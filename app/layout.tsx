import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getAllTags } from "@/lib/recipes";
import Script from "next/script";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { env } from "@/lib/env";
import dynamic from "next/dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

// Dynamically import the debug component to avoid SSR issues
const PathDebug = dynamic(() => import("@/components/path-debug"), {
  ssr: false,
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
                
                // Determine if we're on GitHub Pages or a custom domain
                const hostname = window.location.hostname;
                const isGitHubPages = hostname.includes('github.io');
                const isCustomDomain = ${env.isCustomDomain};
                
                // Handle paths differently based on environment
                if (isGitHubPages && !isCustomDomain) {
                  // GitHub Pages: need to handle the repository name in the path
                  const repoName = '/recipes';
                  const relativePath = redirectPath.replace(repoName, '') || '/';
                  
                  // Store for client-side navigation after hydration
                  window.__NEXT_REDIRECT_PATH = relativePath;
                } else {
                  // Custom domain: use the path as-is
                  window.__NEXT_REDIRECT_PATH = redirectPath;
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
        
        {/* Path debugging component - only visible in development */}
        <PathDebug />
      </body>
    </html>
  );
}
