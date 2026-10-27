'use client';
import Link from 'next/link';
import Image from 'next/image';
import { User, LogIn } from 'lucide-react';
import { AuthUser } from '@/lib/authStore';

interface HeaderProps {
  user: AuthUser | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-36 h-12">
            <Image
              src="/logo.png"
              alt="Surefire Plumbing & Heating"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <div>
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
            >
              <User size={14} />
              <span className="truncate max-w-[100px]">{user.name}</span>
            </Link>
          ) : (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
            >
              <LogIn size={13} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
