'use client';

import { useTheme } from 'next-themes';

interface MobileTopBarProps {
  title?: string;
}

export function MobileTopBar({ title = 'Smart Assist' }: MobileTopBarProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark
    ? 'bg-slate-900/95 border-slate-800'
    : 'bg-white/95 border-slate-200';
  const textColor = isDark ? 'text-slate-50' : 'text-slate-950';
  const accentColor = 'text-blue-500';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className={`lg:hidden fixed top-0 left-0 right-0 border-b ${bgColor} backdrop-blur-md z-40`}>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'} flex items-center justify-center`}>
            <span className={`text-sm font-bold ${accentColor}`}>S</span>
          </div>
          <h1 className={`font-bold ${textColor}`}>{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'hover:bg-slate-800/60 focus:ring-slate-700' : 'hover:bg-slate-100 focus:ring-slate-200'}`}
          >
            <span className="text-lg" aria-hidden>{isDark ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
