import Image, { StaticImageData } from "next/image";

import Card from "./Card";
import H1 from "./H1";
import Button from "./Button";

export default function MessageCard({image,subject,message,onClickBtn,btnText}:{image:StaticImageData;subject:string;message:string; onClickBtn:()=>void;btnText:string}){
    return (
        <Card>
            <div className="flex flex-col gap-8">
                <div className="flex justify-center items-center">
                   <Image src={image} alt="message-icon" className="w-24 h-24"/>
                </div>
                <H1>{subject}</H1>
                <p>{message}</p>
                <Button onClickBtn={onClickBtn}>{btnText}</Button>
            </div>
        </Card>
    )

}