'use client';

export default function StylesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Styles</h1>
          <p className="mt-2 text-lg text-gray-600">
            Typography, colors, spacing, and other style guidelines used across the recipe website.
          </p>
        </div>
      </header>

      <div className="mt-10 space-y-16">
        {/* Typography */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Typography</h2>
          <p className="mt-1 text-gray-600">Font families, sizes, and styles used throughout the site.</p>
          
          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Headings</h3>
              <div className="mt-4 space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">H1: Recipe Title</h1>
                  <p className="mt-1 text-sm text-gray-500">text-4xl font-bold</p>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900">H2: Section Heading</h2>
                  <p className="mt-1 text-sm text-gray-500">text-3xl font-semibold</p>
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-gray-900">H3: Sub Section</h3>
                  <p className="mt-1 text-sm text-gray-500">text-2xl font-medium</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900">H4: Card Title</h4>
                  <p className="mt-1 text-sm text-gray-500">text-xl font-medium</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Body Text</h3>
              <div className="mt-4 space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div>
                  <p className="text-base text-gray-900">Body: Regular paragraph text used for recipe descriptions and content.</p>
                  <p className="mt-1 text-sm text-gray-500">text-base</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Small: Used for supporting information, metadata, and labels.</p>
                  <p className="mt-1 text-sm text-gray-500">text-sm</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Colors</h2>
          <p className="mt-1 text-gray-600">Core color palette used across the recipe website.</p>
          
          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Primary Colors</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <ColorSwatch name="Primary" hexCode="#3B82F6" className="bg-blue-500" />
                <ColorSwatch name="Primary Dark" hexCode="#2563EB" className="bg-blue-600" />
                <ColorSwatch name="Primary Light" hexCode="#60A5FA" className="bg-blue-400" />
                <ColorSwatch name="Accent" hexCode="#10B981" className="bg-emerald-500" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Grays</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <ColorSwatch name="Gray 900" hexCode="#111827" className="bg-gray-900" textClass="text-white" />
                <ColorSwatch name="Gray 700" hexCode="#374151" className="bg-gray-700" textClass="text-white" />
                <ColorSwatch name="Gray 500" hexCode="#6B7280" className="bg-gray-500" textClass="text-white" />
                <ColorSwatch name="Gray 300" hexCode="#D1D5DB" className="bg-gray-300" />
                <ColorSwatch name="Gray 100" hexCode="#F3F4F6" className="bg-gray-100" />
                <ColorSwatch name="Gray 50" hexCode="#F9FAFB" className="bg-gray-50" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Feedback Colors</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <ColorSwatch name="Success" hexCode="#10B981" className="bg-emerald-500" />
                <ColorSwatch name="Warning" hexCode="#F59E0B" className="bg-amber-500" />
                <ColorSwatch name="Error" hexCode="#EF4444" className="bg-red-500" textClass="text-white" />
                <ColorSwatch name="Info" hexCode="#3B82F6" className="bg-blue-500" textClass="text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Spacing</h2>
          <p className="mt-1 text-gray-600">Standardized spacing units used for margins and padding.</p>
          
          <div className="mt-8 space-y-4">
            {[
              { size: '4', pixels: '16px', name: 'Small' },
              { size: '6', pixels: '24px', name: 'Medium' },
              { size: '8', pixels: '32px', name: 'Large' },
              { size: '12', pixels: '48px', name: 'Extra Large' },
            ].map((space) => (
              <div key={space.size} className="flex items-center">
                <div className="flex-none">
                  <div 
                    className={`bg-blue-500 h-4`}
                    style={{ width: `${parseInt(space.pixels)}px` }}
                  />
                </div>
                <div className="ml-4">
                  <span className="text-sm font-medium text-gray-900">
                    {space.name}: {space.pixels} (p-{space.size}, m-{space.size})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ColorSwatch({ name, hexCode, className, textClass = 'text-black' }: { name: string; hexCode: string; className: string; textClass?: string }) {
  return (
    <div className="rounded-md overflow-hidden shadow-sm">
      <div className={`${className} p-6 h-24 flex items-end`}>
        <span className={`font-medium ${textClass}`}>{hexCode}</span>
      </div>
      <div className="bg-white p-3 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-900">{name}</span>
      </div>
    </div>
  );
}