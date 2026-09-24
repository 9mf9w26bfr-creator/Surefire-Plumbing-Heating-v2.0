'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileBookingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/bookings');
  }, [router]);

  return (
    <div className="py-16 text-center">
      <p className="text-gray-500">Redirecting…</p>
    </div>
  );
}