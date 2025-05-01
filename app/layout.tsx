import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getAllTags } from "@/lib/recipes";
import Script from "next/script";

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
    
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Script for handling GitHub Pages SPA navigation */}
        <Script id="github-pages-spa-navigation" strategy="beforeInteractive">
          {`
            (function() {
              // Check if we have a path stored in sessionStorage from a 404 redirect
              const redirectPath = sessionStorage.getItem('redirectPath');
              if (redirectPath) {
                sessionStorage.removeItem('redirectPath');
                
                // Extract the path relative to the base path
                const basePath = '/recipe-website';
                const relativePath = redirectPath.replace(basePath, '');
                
                // Use Next.js router to navigate to the correct page
                if (relativePath && relativePath !== '/') {
                  // We'll handle this on the client side after hydration
                  window.__NEXT_REDIRECT_PATH = relativePath;
                }
              }
            })();
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <SiteHeader tags={tags} />
        <main className="flex-1 px-6 md:px-8 lg:px-12">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
