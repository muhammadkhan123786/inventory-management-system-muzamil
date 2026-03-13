"use client";
import MessageCard from "./ui/MessageCard";
import group from '../assets/group.png';
import { redirect } from "next/navigation";
import { useModal } from "@/hooks/useModal";

export default function RegisterSuccess(){
    const {closeModal} = useModal();
    function login(){
         console.log('Login');
        closeModal();
       redirect('/auth/signIn');
    }
    return <MessageCard
     image={group}
     subject="Shop Register."
     message="Please verify your email. Check your inbox."
     onClickBtn={login}
     btnText="Click to login."       
    />

}