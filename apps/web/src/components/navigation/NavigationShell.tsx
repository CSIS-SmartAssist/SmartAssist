"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

interface NavigationShellProps {
  variant?: "dark" | "light";
  activeRoute?: string;
}

const navigationLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/bookings", label: "Booking" },
  { href: "/documents", label: "Documents" },
];

const courses = [
  { id: 1, name: "CS211 Data Structures", active: true },
  { id: 2, name: "CS241 Microprocessors", active: false },
];

const campusLocations = [
  { code: "DLT1", name: "Digital Lecture Theater" },
  { code: "DLT2", name: "Digital Lecture Theater" },
  { code: "LT1", name: "Lecture Theater 1" },
  { code: "A401", name: "Advanced Systems Lab" },
];

export const NavigationShell = ({
  variant = "dark",
  activeRoute,
}: NavigationShellProps) => {
  const isDark = variant === "dark";
  const { setTheme } = useTheme();

  const darkClasses = {
    bg: "bg-slate-950",
    asideBg: "bg-slate-950/40 border-blue-500/20",
    text: "text-slate-50",
    secondaryText: "text-slate-400",
    accentBg: "bg-blue-500/15",
    accentBorder: "border-blue-500",
  };

  const lightClasses = {
    bg: "bg-slate-50",
    asideBg: "bg-white border-blue-500/15",
    text: "text-slate-950",
    secondaryText: "text-slate-600",
    accentBg: "bg-blue-500/10",
    accentBorder: "border-blue-500",
  };

  const theme = isDark ? darkClasses : lightClasses;

  return (
    <aside
      className={`w-72 h-full flex flex-col ${theme.asideBg} border border-solid rounded-3xl mx-3 backdrop-blur-md shadow-xl`}
    >
      {/* Header */}
      <div className={`p-6 border-b border-opacity-10 border-current`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl ${theme.accentBg} flex items-center justify-center`}
          >
            <span className={`text-lg font-bold text-blue-500`}>S</span>
          </div>
          <div>
            <h1 className={`font-bold text-lg ${theme.text}`}>Smart Assist</h1>
            <p className="text-[10px] text-blue-500 font-semibold tracking-widest uppercase">
              Academic OS
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${theme.secondaryText}`}
        >
          Main Menu
        </div>

        {navigationLinks.map((link) => {
          const isActive = activeRoute === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? `${theme.accentBg} border-l-[3px] ${theme.accentBorder} ${theme.text} shadow-sm`
                  : `${theme.secondaryText} hover:${theme.accentBg}`
              }`}
            >
              <span className="text-xl">•</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}

        {/* My Courses */}
        <div
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${theme.secondaryText} mt-6`}
        >
          My Courses
        </div>
        <div className="space-y-2 px-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                course.active
                  ? `${theme.accentBg} ${theme.text}`
                  : theme.secondaryText
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  course.active ? "bg-blue-500" : "bg-slate-400"
                }`}
              />
              <span className="text-sm">{course.name}</span>
            </div>
          ))}
        </div>

        {/* Campus Map */}
        <div
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${theme.secondaryText} mt-6`}
        >
          Campus Map
        </div>
        <div className="grid grid-cols-2 gap-2 px-2">
          {campusLocations.slice(0, 4).map((location) => (
            <button
              key={location.code}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${theme.accentBg} ${theme.secondaryText} hover:shadow-md`}
              title={location.name}
            >
              {location.code}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer Actions */}
      <div
        className={`p-4 space-y-3 border-t border-opacity-10 border-current`}
      >
        <button
          className={`w-full py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg`}
        >
          BOOK A ROOM
        </button>
        <div className={`flex justify-around text-sm ${theme.secondaryText}`}>
          <button
            className="hover:opacity-80 transition-opacity"
            aria-label="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="hover:opacity-80 transition-opacity"
            aria-label="Toggle theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <button
            className="hover:opacity-80 transition-opacity"
            aria-label="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
};
