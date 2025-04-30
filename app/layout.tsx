import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { getAllTags } from "@/lib/recipes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Fairy Bites",
  description: "A collection of recipes",
};

// Pre-fetch tags at build time and export for use in the static site
export async function generateStaticParams() {
  return [{}]; // Empty params, just to trigger the static generation
}

// Make this a regular component (not async) for static export compatibility
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We can't use await here in a static export, so we'll use empty tags initially
  // The actual tags will be loaded client-side in the SiteHeader component
  const tags = [];

  return (
    <html lang="en" className="h-full">
      <head>
        {/* Script to handle redirect from 404.html for static site hosting */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Check if we're being redirected from 404.html
                var redirectPath = sessionStorage.getItem('redirectPath');
                if (redirectPath) {
                  // Clear the path
                  sessionStorage.removeItem('redirectPath');
                  // Set the URL in history without causing a page refresh
                  history.replaceState(null, null, redirectPath);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader tags={tags} />
          <main className="flex-1 px-6 md:px-8 lg:px-12">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
