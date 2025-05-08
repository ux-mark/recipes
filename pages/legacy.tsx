import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LegacyPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the app directory home page
    router.replace('/');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>This is a legacy page. Redirecting to new home page...</p>
    </div>
  );
}