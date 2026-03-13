"use client";
import { useState } from 'react';
import { Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgetPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forget-password/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailId: email }),
            });
            const result = await res.json();
            if (res.ok) {
                // Store email in localStorage to use in next steps
                localStorage.setItem('resetEmail', email);
                router.push('/auth/forget-password/verify-otp');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#9810FA]">
                <div className="p-8">
                    <div className="mb-6 flex justify-center">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#9810FA] to-[#4F39F6] flex items-center justify-center">
                            <ShieldCheck className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-indigo-950">Forgot Password?</h2>
                    <p className="text-gray-500 text-center mb-8">Enter your email to receive a 6-digit OTP.</p>

                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9810FA] outline-none"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-linear-to-r from-[#9810FA] via-[#4F39F6] to-[#E60076] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isLoading ? "Sending..." : "Send Reset OTP"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/auth/signIn" className="text-sm text-gray-600 hover:text-[#9810FA] flex items-center justify-center gap-2">
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}