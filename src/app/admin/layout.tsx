'use client';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute isAdmin>
      <div className="min-h-screen bg-gray-50 pb-12">
        {children}
      </div>
    </ProtectedRoute>
  );
}
