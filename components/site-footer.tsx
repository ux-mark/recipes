import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getAllTags } from "@/lib/recipes";

export default async function SiteFooter() {
  const allTags = await getAllTags();
  const popularTags = allTags.slice(0, 8); // Get top 8 most used tags
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50">
      <div className="py-12 md:py-16 px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">
              Tasty<span className="text-primary-600">Bites</span>
            </h3>
            <p className="text-neutral-600 mb-4">
              Discover delicious recipes for every occasion. From quick weekday meals to special celebrations.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link href="/recipes" className="text-neutral-600 hover:text-primary-600 transition-colors">
                All Recipes
              </Link>
              <Link href="/search" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Search
              </Link>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="text-center text-sm text-neutral-500">
          <p>&copy; {currentYear} Bites by The Fairies Recipe Collection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}