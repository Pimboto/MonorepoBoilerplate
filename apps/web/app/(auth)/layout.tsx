import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="flex flex-col items-center gap-3 group">
          <img
            src="/logo.svg"
            alt="CocoStudio"
            className="h-12 w-12 rounded-xl transition-transform group-hover:scale-105"
          />
          <span className="font-bold text-xl tracking-tight text-foreground">CocoStudio</span>
        </Link>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
