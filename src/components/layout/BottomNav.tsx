'use client';
/**
 * SUREFIRE PLUMBING & HEATING — Bottom Navigation
 * Constitution: Exactly 5 permanent entries: BOOK, ABOUT US, JOIN US, PARTS, PROFILE
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Info, Users, Package, User } from 'lucide-react';

const navItems = [
  { label: 'BOOK', href: '/booking', icon: Calendar },
  { label: 'ABOUT US', href: '/about', icon: Info },
  { label: 'JOIN US', href: '/join', icon: Users },
  { label: 'PARTS', href: '/parts', icon: Package },
  { label: 'PROFILE', href: '/profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[70px] min-h-[60px] transition-colors ${
                isActive
                  ? 'text-blue-700 border-t-2 border-blue-700 font-medium'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-xs tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}