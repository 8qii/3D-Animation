import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cinematic 3D Experience | Next.js + Three.js + R3F',
  description:
    'A high-end cinematic interactive 3D web experience built with Next.js App Router, React Three Fiber, Three.js shaders, GSAP, and smooth scrolling.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#030712] text-slate-100 antialiased overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
