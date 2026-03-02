import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "../globals.css";
import LightRays from "@/components/LightRays";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevNest",
  description: "Developer Events Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
      >
        <div className="absolute inset-0 z-[-1] min-h-screen top-0">
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#5dfdca"
            raysSpeed={0.5}
            lightSpread={0.9}
            rayLength={1.5}
            followMouse={true}
            mouseInfluence={0.02}
            noiseAmount={0}
            distortion={0}
          />
        </div>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
