import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-sm text-muted">Page not found.</p>
      <Link href="/" className="text-sm text-accent hover:underline">
        Back home
      </Link>
    </main>
  );
}
