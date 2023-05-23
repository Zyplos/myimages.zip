import Navbar from "@/components/Navbar";
import "./globals.css";
import { Inter, Azeret_Mono } from "next/font/google";
import Breadcrumbs from "@/components/Breadcrumbs";

const inter = Inter({ subsets: ["latin"] });
const azeret_mono = Azeret_Mono({ subsets: ["latin"], variable: "--font-azeret-mono" });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${azeret_mono.variable}`}>
        <Navbar />
        <Breadcrumbs />
        <main>{children}</main>
      </body>
    </html>
  );
}
