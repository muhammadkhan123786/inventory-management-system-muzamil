"use client";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card"
import H1 from "../../../components/ui/H1";
import { useModal } from "@/hooks/useModal";
import MessageCard from "@/components/ui/MessageCard";
import group from '../../../assets/group.png';
import { redirect } from "next/navigation";


export default function Changepassword (){
    const [password,setPassword] = useState<string>();
    const [confirmPassword,setConfirmPassword]= useState<string>();
    const {openModal,closeModal} = useModal();

    function onClickBtn(){
        closeModal();
        redirect('/auth/signIn');
    }

    function updatePassword(){
        
        console.log(password);
        console.log(confirmPassword);
        console.log('Update password clicked.');
        openModal(<MessageCard
          image={group}
          subject={"Password Updated"}
          message={"We have update the password. Please click on login to your account."}
          onClickBtn={onClickBtn}
          btnText={"Login"}
        />);

    }
    return <Card>
        <div className="flex flex-col gap-4">
            <H1>Create new password.</H1>
            <p className="text-gray-400">Please enter a new password. Your new password must be different from previous password. </p>
            <input 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition" 
            type="password" 
            name="password" 
            id="password" 
            placeholder="Enter new password."
            onChange={(e)=>setPassword(e.target.value)}            
            />
            <input 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition" 
                type="password"
                name="confirmPassword" 
                id="confirmPassword" 
                placeholder="Enter confirm password."
                onChange={(e)=>setConfirmPassword(e.target.value)}

             />
           <Button onClickBtn={()=>updatePassword()}>
              Reset Password
           </Button>
        </div>
    </Card>
}