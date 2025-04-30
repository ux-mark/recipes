'use client';

import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

// Using a plain object instead of the metadata API which requires server components
const siteMetadata = {
  title: "Fairy Bites",
  description: "A collection of recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tags = [];

  return (
    <html lang="en" className="h-full">
      <head>
        <title>{siteMetadata.title}</title>
        <meta name="description" content={siteMetadata.description} />
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
