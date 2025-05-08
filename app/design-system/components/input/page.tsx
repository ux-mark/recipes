'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';

export default function InputPage() {
  const [value, setValue] = useState('');
  const [inputType, setInputType] = useState<'text' | 'password' | 'email' | 'number' | 'search'>('text');
  const [disabled, setDisabled] = useState(false);
  const [placeholder, setPlaceholder] = useState('Enter text here');
  const [leadingIcon, setLeadingIcon] = useState(false);
  const [invalid, setInvalid] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Input</h1>
          <p className="mt-2 text-lg text-gray-600">
            The Input component allows users to enter and edit text or numeric values.
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
                The Input component is a fundamental form control that allows users to enter text or numeric values.
                It supports various input types, can be styled differently based on its state, and integrates with
                standard HTML form validation.
              </p>
              <p>
                Use inputs within forms to collect user data, in search fields, or as standalone controls
                for filtering or other content manipulation.
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
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">type</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">string</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">text</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      HTML input type (text, password, email, number, etc.)
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">disabled</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">boolean</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">false</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      When true, the input will be disabled
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">className</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">string</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">undefined</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      Additional CSS classes to apply to the input
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">aria-invalid</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">boolean</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">undefined</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      When true, applies error styling to the input
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">...props</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">React.InputHTMLAttributes</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">-</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      All standard input HTML attributes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* States */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">States</h2>
            <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-2">Default</h3>
                <div className="flex flex-col gap-2">
                  <Input placeholder="Default input" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Standard input appearance for most use cases.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Focused</h3>
                <div className="flex flex-col gap-2">
                  <Input placeholder="Click to see focus state" className="focus-within:border-blue-500 focus-within:ring focus-within:ring-blue-200" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  When the input receives focus, it displays a highlight state.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Disabled</h3>
                <div className="flex flex-col gap-2">
                  <Input disabled placeholder="Disabled input" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Used when input interaction is not available.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Error</h3>
                <div className="flex flex-col gap-2">
                  <Input aria-invalid placeholder="Invalid input" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Indicates validation errors or problems with the entered data.
                </p>
              </div>
            </div>
          </section>

          {/* Common Types */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Common Input Types</h2>
            <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-2">Text</h3>
                <div className="flex flex-col gap-2">
                  <Input type="text" placeholder="Text input" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  For general text entry.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Email</h3>
                <div className="flex flex-col gap-2">
                  <Input type="email" placeholder="Email address" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Optimized for email entry with validation.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Password</h3>
                <div className="flex flex-col gap-2">
                  <Input type="password" placeholder="Password" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Masks entered characters for sensitive information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Number</h3>
                <div className="flex flex-col gap-2">
                  <Input type="number" placeholder="0" />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  For numerical values with increment controls.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Search</h3>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input type="search" className="pl-10" placeholder="Search..." />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Optimized for search functionality with appropriate keyboard behavior.
                </p>
              </div>
            </div>
          </section>

          {/* Examples */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Usage Examples</h2>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Basic Input</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`import { Input } from '@/components/ui/input';

// In your component
export default function MyComponent() {
  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium mb-1">
        Full Name
      </label>
      <Input 
        id="name"
        placeholder="Enter your name" 
        onChange={(e) => console.log(e.target.value)}
      />
    </div>
  );
}`}</code>
              </pre>

              <h3 className="text-lg font-medium mt-6 mb-2">Search Input with Icon</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// In your component
export default function SearchComponent() {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        type="search"
        placeholder="Search..."
        className="pl-10"
      />
    </div>
  );
}`}</code>
              </pre>

              <h3 className="text-lg font-medium mt-6 mb-2">Validation Example</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{`import { Input } from '@/components/ui/input';
import { useState } from 'react';

// In your component
export default function FormField() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  
  const validateEmail = (value: string) => {
    const valid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
    setEmail(value);
    setIsValid(value === '' || valid);
  };
  
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium mb-1">
        Email Address
      </label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => validateEmail(e.target.value)}
        aria-invalid={!isValid}
        placeholder="your.email@example.com"
      />
      {!isValid && (
        <p className="text-red-500 text-sm mt-1">
          Please enter a valid email address
        </p>
      )}
    </div>
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
                <li>Always associate inputs with labels using the &apos;id&apos; and &apos;for&apos; attributes</li>
                <li>Use aria-invalid to indicate validation errors</li>
                <li>Include clear, descriptive placeholder text when appropriate</li>
                <li>Appropriate contrast ratios for text and borders in all states</li>
                <li>Focus states are clearly visible for keyboard navigation</li>
                <li>Disabled states are conveyed both visually and to screen readers</li>
              </ul>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Best Practices</h2>
            <div className="mt-4 prose prose-blue max-w-none">
              <ul>
                <li><strong>Always use labels</strong>: Every input should have a visible label unless it&apos;s part of a well-understood UI pattern like a search box with a search icon.</li>
                <li><strong>Use placeholder text appropriately</strong>: Placeholders should provide hints, not replace labels.</li>
                <li><strong>Provide validation feedback</strong>: Use error states to clearly communicate validation issues.</li>
                <li><strong>Use appropriate input types</strong>: Choose the right input type (email, password, number, etc.) to provide the best experience on different devices.</li>
                <li><strong>Be consistent with sizing</strong>: Maintain consistent input sizes throughout your application.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Interactive Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interactive Preview</h2>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="space-y-4">
                <label htmlFor="interactive-input" className="block text-sm font-medium text-gray-700">
                  Input Preview
                </label>
                <div className="relative">
                  {leadingIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {inputType === 'search' ? (
                        <Search className="h-4 w-4 text-gray-400" />
                      ) : (
                        <User className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  )}
                  <Input
                    id="interactive-input"
                    type={inputType}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={leadingIcon ? 'pl-10' : ''}
                    aria-invalid={invalid}
                  />
                </div>
                {invalid && (
                  <p className="text-red-500 text-sm mt-1">This field is invalid</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Customize</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
                  <select
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value as 'text' | 'password' | 'email' | 'number' | 'search')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="password">Password</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="search">Search</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                  <Input
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    placeholder="Enter placeholder text"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="disabled-toggle"
                    name="disabled"
                    type="checkbox"
                    checked={disabled}
                    onChange={(e) => setDisabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="disabled-toggle" className="ml-2 block text-sm text-gray-900">
                    Disabled
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="leading-icon-toggle"
                    name="leadingIcon"
                    type="checkbox"
                    checked={leadingIcon}
                    onChange={(e) => setLeadingIcon(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="leading-icon-toggle" className="ml-2 block text-sm text-gray-900">
                    Leading Icon
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="invalid-toggle"
                    name="invalid"
                    type="checkbox"
                    checked={invalid}
                    onChange={(e) => setInvalid(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="invalid-toggle" className="ml-2 block text-sm text-gray-900">
                    Invalid State
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