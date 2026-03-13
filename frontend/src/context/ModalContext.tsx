"use client"

import { createContext, ReactNode, useState } from "react"

interface ModalContextType{
    isOpen: boolean,
    content: ReactNode | null,
    openModal: (content:ReactNode)=>void,
    closeModal:()=>void,
}

export const ModalContext = createContext<ModalContextType|undefined>(undefined);

export const ModalProvider = ({children}:{children:ReactNode})=>{
     const [isOpen,setIsOpen]= useState<boolean>(false);
     const [content,setContent] = useState<ReactNode | null>(null);

     const openModal = (content:ReactNode)=>{
        setContent(content);
        setIsOpen(true);
     }

     const closeModal = ()=>{
         setIsOpen(false);
         setContent(null);        
     }
   
     return (
        <ModalContext.Provider value={{isOpen,content,openModal,closeModal}}>
            {children}
        </ModalContext.Provider>
     )

}