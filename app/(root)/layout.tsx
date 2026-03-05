import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
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
      <main>{children}</main>
    </>
  );
}
