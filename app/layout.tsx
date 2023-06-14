import Navbar from "@/components/Navbar";
import "./globals.css";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Breadcrumbs />
        <main>{children}</main>
      </body>
    </html>
  );
}
