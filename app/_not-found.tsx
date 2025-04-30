'use client';

import Link from 'next/link';

export default function NotFoundCatchAll() {
  return (
    <div className="container py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="font-serif text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-neutral-600 mb-8 text-center max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link 
        href="/"
        className="bg-primary-600 hover:bg-primary-700 transition-colors text-white font-medium py-2 px-6 rounded-full"
      >
        Return to Home
      </Link>
    </div>
  );
}