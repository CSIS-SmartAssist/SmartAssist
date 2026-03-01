'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/bookings', label: 'Book', icon: '📅' },
  { href: '/documents', label: 'Docs', icon: '📄' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark 
    ? 'bg-slate-900/95 border-slate-800' 
    : 'bg-white/95 border-slate-200';
  const textColor = isDark ? 'text-slate-50' : 'text-slate-950';
  const activeColor = isDark 
    ? 'text-blue-400 bg-blue-500/10' 
    : 'text-blue-600 bg-blue-500/10';
  const inactiveColor = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 border-t ${bgColor} backdrop-blur-md`}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                isActive
                  ? `${activeColor} rounded-t-2xl`
                  : `${inactiveColor} hover:${inactiveColor}`
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
