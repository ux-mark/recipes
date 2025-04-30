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
