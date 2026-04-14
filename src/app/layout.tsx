import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentLens — AI-Powered Hiring Assistant",
  description:
    "Streamline your hiring process with AI-powered candidate evaluation, resume parsing, and intelligent recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-white antialiased font-sans">
        {/* Background gradient orbs */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
