import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getAllTags } from "@/lib/recipes";
import { ToastProvider } from "@/components/ui/toast-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Fairy Bites Collection",
  description: "Discover delicious recipes for every occasion.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get tags to pass to the header
  const allTags = await getAllTags();
  const tags = allTags
    .filter(tag => !tag.name.includes('Needs'))
    .slice(0, 20);
  
  // Check if we're in production environment
  const isProduction = process.env.NODE_ENV === 'production';
    
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <SiteHeader tags={tags} />
        <main className="flex-1 px-6 md:px-8 lg:px-12">
          {children}
        </main>
        <SiteFooter />
        {/* Only include Analytics and SpeedInsights in production */}
        {isProduction && <Analytics />}
        {isProduction && <SpeedInsights />}
        <ToastProvider />
      </body>
    </html>
  );
}
