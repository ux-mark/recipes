import SiteHeader from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/design-system/code-block";

export default async function HeaderNavigationPage() {
  // Mock data for the RecipeTag[] prop required by SiteHeader
  const mockTags = [
    { id: "1", name: "Breakfast", slug: "breakfast", count: 5 },
    { id: "2", name: "Lunch", slug: "lunch", count: 8 },
    { id: "3", name: "Dinner", slug: "dinner", count: 12 },
    { id: "4", name: "Dessert", slug: "dessert", count: 6 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Header Navigation</h1>
          <p className="mt-2 text-lg text-gray-600">
            The main navigation component for the recipe website.
          </p>
        </div>
      </header>
      
      <div className="mt-8 space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Example</h2>
          <p className="text-gray-600">
            This is an interactive example of the SiteHeader component used across the recipe website.
          </p>
          
          <div className="border rounded-lg overflow-hidden">
            <SiteHeader tags={mockTags} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Usage</h2>
          <Tabs defaultValue="tsx">
            <TabsList>
              <TabsTrigger value="tsx">TSX</TabsTrigger>
              <TabsTrigger value="props">Props</TabsTrigger>
            </TabsList>
            <TabsContent value="tsx">
              <CodeBlock language="tsx">{`import SiteHeader from "@/components/site-header";

// Render the SiteHeader component with the required tags prop
<SiteHeader tags={recipeTags} />`}</CodeBlock>
            </TabsContent>
            <TabsContent value="props">
              <div className="rounded-md bg-slate-50 p-6">
                <h3 className="text-lg font-medium mb-4">SiteHeaderProps</h3>
                <div className="grid grid-cols-3 gap-4 mb-2 font-medium text-sm">
                  <div>Name</div>
                  <div>Type</div>
                  <div>Description</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2 border-t border-slate-200 text-sm">
                  <div className="font-medium">tags</div>
                  <div className="text-slate-700 font-mono text-xs">RecipeTag[]</div>
                  <div className="text-slate-700">Array of recipe tags to display in the navigation menu</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Responsive design with mobile drawer navigation</li>
            <li>Feature flag integration for admin edit interface</li>
            <li>Feature flag integration for design system access</li>
            <li>Tag dropdown navigation</li>
            <li>Search button integration</li>
          </ul>
        </section>
      </div>
    </div>
  );
}