"use client";
import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerifyOTPPage() {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedEmail = localStorage.getItem('resetEmail');
        if (!storedEmail) router.push('/auth/forget-password');
        else setEmail(storedEmail);
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forget-password/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailId: email, otp }),
            });
            if (res.ok) {
                router.push('/auth/forget-password/update-password');
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            alert("Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#4F39F6]">
                <h2 className="text-2xl font-bold text-center text-indigo-950">Verify OTP</h2>
                <p className="text-gray-500 text-center mb-8">Sent to {email}</p>
                <form onSubmit={handleVerify} className="space-y-6">
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        className="w-full text-center text-3xl tracking-widest py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl focus:border-[#9810FA] outline-none"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <button
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-[#4F39F6] to-[#9810FA] text-white py-3 rounded-lg font-bold"
                    >
                        {isLoading ? "Verifying..." : "Verify & Continue"}
                    </button>
                </form>
            </div>
        </div>
    );
}