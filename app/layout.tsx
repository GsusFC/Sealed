import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sealed - Your Digital Diary",
  description: "Write daily thoughts and seal them forever on Base L2",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
