import Link from 'next/link';

export default function LegalShell({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-700">
            PostAssistant
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
            <Link href="/terms" className="hover:text-indigo-600 font-medium">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-indigo-600 font-medium">
              Privacy
            </Link>
            <Link href="/login" className="hover:text-indigo-600 font-medium">
              Log in
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10 pb-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">{title}</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: 4 April 2026</p>
        <div className="space-y-8 text-sm leading-relaxed text-slate-700">{children}</div>
      </main>
    </div>
  );
}
