'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ConfirmationRefPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.ref) {
      router.replace(`/booking/${params.ref}`);
    } else {
      router.replace('/bookings');
    }
  }, [params.ref, router]);

  return (
    <div className="py-20 text-center text-gray-500">
      <p>Redirecting to your booking details…</p>
    </div>
  );
}
