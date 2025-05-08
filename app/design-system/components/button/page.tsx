'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Search } from 'lucide-react';

export default function ButtonPage() {
  const [variant, setVariant] = useState<'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'>('default');
  const [size, setSize] = useState<'default' | 'sm' | 'lg' | 'icon'>('default');
  const [disabled, setDisabled] = useState(false);
  const [withIcon, setWithIcon] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Button</h1>
          <p className="mt-2 text-lg text-gray-600">
            The Button component is used to trigger actions throughout the interface.
          </p>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          {/* Purpose */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Purpose</h2>
            <div className="mt-4 prose prose-blue max-w-none">
              <p>
                The Button component is a fundamental interactive element that triggers an action when clicked.
                It provides visual feedback to users about actions they can take and their current state.
              </p>
              <p>
                Use buttons to enable user interactions, form submissions, and to navigate between pages
                when combined with Next.js Link component.
              </p>
            </div>
          </section>

          {/* Props */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Props</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Prop Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Default</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">variant</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      &apos;default&apos; | &apos;destructive&apos; | &apos;outline&apos; | &apos;secondary&apos; | &apos;ghost&apos; | &apos;link&apos;
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">default</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      The visual style variant of the button
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">size</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      &apos;default&apos; | &apos;sm&apos; | &apos;lg&apos; | &apos;icon&apos;
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">default</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      The size of the button
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">asChild</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">boolean</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">false</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      When true, the component will forward its props to its child rather than rendering a button element directly
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">disabled</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">boolean</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">false</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      When true, the button will be disabled
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">className</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">string</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">undefined</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      Additional CSS classes to apply to the button
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">...props</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">React.ButtonHTMLAttributes</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">-</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      All standard button HTML attributes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Variants */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Variants</h2>
            <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-2">Default</h3>
                <div className="flex items-center gap-4">
                  <Button variant="default">Button</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  The primary button style, used for main actions and call-to-actions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Destructive</h3>
                <div className="flex items-center gap-4">
                  <Button variant="destructive">Delete</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Used for actions that are destructive or potentially risky.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Outline</h3>
                <div className="flex items-center gap-4">
                  <Button variant="outline">Outline</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  A softer visual style for secondary actions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Secondary</h3>
                <div className="flex items-center gap-4">
                  <Button variant="secondary">Secondary</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Used for secondary actions alongside a primary button.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Ghost</h3>
                <div className="flex items-center gap-4">
                  <Button variant="ghost">Ghost</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  The most subtle button style, with no background until hovered.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Link</h3>
                <div className="flex items-center gap-4">
                  <Button variant="link">Link Style</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Appears as a text link rather than a button.
                </p>
              </div>
            </div>
          </section>

          {/* Sizes */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Sizes</h2>
            <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-2">Default</h3>
                <div className="flex items-center gap-4">
                  <Button size="default">Default Size</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Standard button size suitable for most contexts.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Small</h3>
                <div className="flex items-center gap-4">
                  <Button size="sm">Small Size</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Compact size for tight spaces or less prominent actions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Large</h3>
                <div className="flex items-center gap-4">
                  <Button size="lg">Large Size</Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Larger size for emphasis or improved touch targets.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Icon</h3>
                <div className="flex items-center gap-4">
                  <Button size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Square button optimized for displaying a single icon.
                </p>
              </div>
            </div>
          </section>

          {/* Examples */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Usage Examples</h2>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Basic Button</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`import { Button } from '@/components/ui/button';

// In your component
export default function MyComponent() {
  return (
    <Button onClick={() => console.log('Button clicked')}>
      Click Me
    </Button>
  );
}`}</code>
              </pre>

              <h3 className="text-lg font-medium mt-6 mb-2">With Next.js Link</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`import { Button } from '@/components/ui/button';
import Link from 'next/link';

// In your component
export default function MyComponent() {
  return (
    <Button asChild>
      <Link href="/recipes">View All Recipes</Link>
    </Button>
  );
}`}</code>
              </pre>

              <h3 className="text-lg font-medium mt-6 mb-2">With Icon</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// In your component
export default function MyComponent() {
  return (
    <Button>
      Continue <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
  );
}`}</code>
              </pre>
            </div>
          </section>

          {/* Accessibility */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Accessibility</h2>
            <div className="mt-4 prose prose-blue max-w-none">
              <ul>
                <li>Has appropriate contrast ratios for all variants</li>
                <li>Disabled state is visible both visually and to assistive technology</li>
                <li>Can be used with keyboard navigation</li>
                <li>When used with icons, includes proper screen reader text where needed</li>
                <li>Uses the native button element for proper semantics and screen reader support</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Interactive Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interactive Preview</h2>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 flex flex-col items-center justify-center min-h-[200px]">
              <Button
                variant={variant}
                size={size}
                disabled={disabled}
                className="mx-auto"
              >
                {withIcon && size !== 'icon' ? (
                  <>
                    Button
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : withIcon && size === 'icon' ? (
                  <Search className="h-4 w-4" />
                ) : 'Button'}
              </Button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Customize</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value as 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="default">Default</option>
                    <option value="destructive">Destructive</option>
                    <option value="outline">Outline</option>
                    <option value="secondary">Secondary</option>
                    <option value="ghost">Ghost</option>
                    <option value="link">Link</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as 'default' | 'sm' | 'lg' | 'icon')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="default">Default</option>
                    <option value="sm">Small</option>
                    <option value="lg">Large</option>
                    <option value="icon">Icon</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="disabled"
                    name="disabled"
                    type="checkbox"
                    checked={disabled}
                    onChange={(e) => setDisabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="disabled" className="ml-2 block text-sm text-gray-900">
                    Disabled
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="withIcon"
                    name="withIcon"
                    type="checkbox"
                    checked={withIcon}
                    onChange={(e) => setWithIcon(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="withIcon" className="ml-2 block text-sm text-gray-900">
                    With Icon
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}