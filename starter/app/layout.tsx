import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirrorlane Clone",
  description: "Componentized rebuild generated from Mirrorlane artifacts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
