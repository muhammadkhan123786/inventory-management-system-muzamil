// src/app/dashboard/country/page.tsx
import VehicleCountryClient from "./components/VehicleCountryClient";

export const metadata = {
  title: "Countries | Dashboard",
  description: "Manage countries for vehicle services and locations",
};

export default function CountryPage() {
  return (
    <main>
      <VehicleCountryClient />
    </main>
  );
}