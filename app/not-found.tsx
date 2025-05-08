import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-4xl font-bold text-neutral-800">404 - Page Not Found</h1>
      <p className="mt-4 text-xl text-neutral-600">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link 
        href="/"
        className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}