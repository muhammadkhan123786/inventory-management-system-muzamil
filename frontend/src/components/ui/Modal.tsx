"use client"

import { useModal } from "@/hooks/useModal"

export default function Modal(){
   const {isOpen,content,closeModal}= useModal();
   if(!isOpen) return null;

   return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-9999">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-[90%] relative">
        {content}

        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✕
        </button>
      </div>
    </div>
  );
}