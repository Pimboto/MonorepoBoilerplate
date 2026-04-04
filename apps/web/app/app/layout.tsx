'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { Sidebar } from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-8 px-10 scrollbar-hide">
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
