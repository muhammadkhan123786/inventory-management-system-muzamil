import React from 'react'
import PurchaseDashboard from "./components/PurchaseDashboard"
import { Toaster } from 'sonner';
const page = () => {
  return (
    <div>
      <Toaster 
  richColors
  position="top-right"
  toastOptions={{
    duration: 3000
  }}
/>
        <PurchaseDashboard />
    </div>
  )
}

export default page