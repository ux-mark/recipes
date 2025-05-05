import { ReactNode } from 'react';

// Re-export the generateStaticParams function from the recipes page
export { generateStaticParams } from '@/app/recipes/[id]/page';

export default function AdminEditLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}