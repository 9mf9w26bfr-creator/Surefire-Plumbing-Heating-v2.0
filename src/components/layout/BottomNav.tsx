'use client';
/**
 * SUREFIRE PLUMBING & HEATING — Bottom Navigation
 * Constitution: 5 core entries: BOOK, ABOUT US, JOIN US, CASES, PROFILE
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Info, Users, Package, User } from 'lucide-react';

const navItems = [
  { label: 'BOOK', href: '/booking', icon: Calendar },
  { label: 'ABOUT US', href: '/about', icon: Info },
  { label: 'JOIN US', href: '/join', icon: Users },
  { label: 'CASES', href: '/cases', icon: Package },
  { label: 'PROFILE', href: '/profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb shadow-sm">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-1 min-w-[60px] transition-colors ${
                isActive
                  ? 'text-blue-700 font-semibold'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
