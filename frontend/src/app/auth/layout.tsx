import { ReactNode } from "react";
import Image from "next/image";
import onyxtech from '../../assets/onyxtech.png';

export default function AuthLayout({children}:{children:ReactNode}){
     return (
        <>        
        {/* Your content */}
          <div className="">
            {/* <Image
              src={onyxtech}
              alt="logo"
              className="mb-8 w-48 h-auto"
              loading="eager"
            /> */}
            {children}
          </div>
        </>
     )
}