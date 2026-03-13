import type { Metadata } from "next";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import Modal from "@/components/ui/Modal";
import { ModalProvider } from "@/context/ModalContext";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider"; // Naya import
import { Toaster } from "react-hot-toast";



export const metadata: Metadata = {
  title: "Humber Mobility",
  description: "Technicians and workshops connections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-[#B4B4B4]`}>
        <QueryProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <ModalProvider>
            <Modal />
            <Theme>
              <ThemeProvider>{children}</ThemeProvider>
            </Theme>
          </ModalProvider>

        </QueryProvider>
      </body>
    </html>
  );
}