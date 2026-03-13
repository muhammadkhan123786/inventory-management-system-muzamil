"use client"
import MessageCard from "@/components/ui/MessageCard";
import group from '../../../assets/group.png';
import { redirect } from "next/navigation";

export default function ResetPasswordLinkSentMessage(){
    function onClickBtn(){
       redirect('/auth/signIn');
    }
     return (
        <MessageCard
          image={group}
          subject={"Email sent."}
          message={"We have sent a email to your registered email. Please check email and click on link to reset password."}
          onClickBtn={onClickBtn}
          btnText={"Acknowledged"}
        />
     )
}