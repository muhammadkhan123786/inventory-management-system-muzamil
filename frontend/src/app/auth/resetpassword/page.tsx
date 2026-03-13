"use client"
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import H1 from "@/components/ui/H1";
import { redirect } from "next/navigation";


export default function ResetPassword(){
    function sendResetPasswordLink(){
        console.log('Please check your email id we have sent link to update password.');
        redirect('/auth/resetpasswordrequestsent');
    }
    
    return (
        <Card>
             <H1>Reset password request.</H1>
             <div className="mt-6 w-full py-4">
                <input
                    type="emailId"
                    name="emailId"
                    id="emailId"
                    placeholder="Please enter your registered email id."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                />
            </div>
             <Button onClickBtn={sendResetPasswordLink}>
                Send request
             </Button>
        </Card>
    )
}