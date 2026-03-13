// src/app/dashboard/addresses/page.tsx
import VehicleAddressClient from "./components/VehicleAddressClient";

export const metadata = {
  title: "Addresses | Dashboard",
  description: "View and manage user addresses",
};

export default function AddressPage() {
  return (
    <main>
      <VehicleAddressClient />
    </main>
  );
}