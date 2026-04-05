import { Navbar } from '@/components/navbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">{children}</main>
      <footer className="w-full flex items-center justify-center py-3 text-sm text-default-500">
        <span>&copy; {new Date().getFullYear()} CocoStudio. All rights reserved.</span>
      </footer>
    </div>
  );
}
