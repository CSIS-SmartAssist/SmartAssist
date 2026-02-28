'use client';

import type { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { NavigationShell } from '@/components/navigation/NavigationShell';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="flex h-screen gap-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-3">
      <NavigationShell variant={theme === 'light' ? 'light' : 'dark'} activeRoute={pathname} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
