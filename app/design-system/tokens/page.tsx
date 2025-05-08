'use client';

export default function TokensPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Design Tokens</h1>
          <p className="mt-2 text-lg text-gray-600">
            Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.
          </p>
        </div>
      </header>

      <div className="mt-10 space-y-16">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">About Design Tokens</h2>
          <div className="mt-4 prose prose-blue">
            <p>
              Design tokens are all the values needed to construct and maintain a design system — spacing, color, 
              typography, object styles, animation, etc. — represented as data. These can be transformed and 
              formatted to meet the needs of any platform.
            </p>
            <p>
              By separating the values of our design decisions from their application, we can reuse them 
              across the recipe website. They help us maintain a consistent visual language.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Usage</h2>
          <div className="mt-4 prose prose-blue">
            <p>
              Our design tokens are implemented as CSS variables and Tailwind CSS classes. They can be used directly in 
              your component code.
            </p>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <pre className="language-css"><code>{`/* Using CSS variables */
.my-component {
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family-base);
}

/* Using Tailwind classes */
<div className="text-primary mb-6 font-sans">
  Content
</div>`}</code></pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Token Categories</h2>
          
          <div className="mt-8 space-y-12">
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Color Tokens</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Token Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CSS Variable</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tailwind Class</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Value</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <TokenRow name="Primary" cssVar="--color-primary" tailwindClass="text-primary" value="#3B82F6" preview="bg-blue-500" />
                    <TokenRow name="Primary Dark" cssVar="--color-primary-dark" tailwindClass="text-primary-dark" value="#2563EB" preview="bg-blue-600" />
                    <TokenRow name="Secondary" cssVar="--color-secondary" tailwindClass="text-secondary" value="#10B981" preview="bg-emerald-500" />
                    <TokenRow name="Gray 900" cssVar="--color-gray-900" tailwindClass="text-gray-900" value="#111827" preview="bg-gray-900" />
                    <TokenRow name="Gray 50" cssVar="--color-gray-50" tailwindClass="text-gray-50" value="#F9FAFB" preview="bg-gray-50" />
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Spacing Tokens</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Token Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CSS Variable</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tailwind Class</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Extra Small</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">--spacing-xs</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">p-2, m-2</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">0.5rem (8px)</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Small</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">--spacing-sm</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">p-4, m-4</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">1rem (16px)</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Medium</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">--spacing-md</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">p-6, m-6</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">1.5rem (24px)</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Large</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">--spacing-lg</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">p-8, m-8</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">2rem (32px)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Typography Tokens</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Token Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CSS Variable</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tailwind Class</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Font Family Base</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">--font-family-base</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">font-sans</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">ui-sans-serif, system-ui, sans-serif</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Font Size XL</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">--font-size-xl</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">text-xl</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">1.25rem (20px)</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Font Weight Bold</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">--font-weight-bold</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">font-bold</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">700</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function TokenRow({ name, cssVar, tailwindClass, value, preview }: { name: string; cssVar: string; tailwindClass: string; value: string; preview: string }) {
  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{name}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cssVar}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tailwindClass}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{value}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className={`h-6 w-12 rounded ${preview}`}></div>
      </td>
    </tr>
  );
}