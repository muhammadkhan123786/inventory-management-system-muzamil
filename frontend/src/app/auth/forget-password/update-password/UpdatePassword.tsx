"use client";
import { useState } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = localStorage.getItem('resetEmail');
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forget-password/update-passoword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailId: email, ...passwords }),
            });
            
            if (res.ok) {
                alert("Password Updated Successfully.");
                localStorage.removeItem('resetEmail');
                router.push('/auth/signIn');
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            alert("Error updating password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#E60076]">
                <div className="mb-6 flex justify-center">
                    <CheckCircle className="text-[#E60076] w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">Set New Password</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <input
                        type="password"
                        placeholder="New Password"
                        className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#E60076] outline-none"
                        onChange={(e) => setPasswords({...passwords, password: e.target.value})}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#E60076] outline-none"
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        required
                    />
                    <button
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-[#E60076] to-[#9810FA] text-white py-3 rounded-lg font-bold"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}