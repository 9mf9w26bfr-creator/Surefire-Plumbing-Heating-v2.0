'use client';

export default function AdminPage() {
  return (
    <div className="space-y-6 py-4">
      <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
      <p className="text-gray-500">Restricted area — staff sign-in required.</p>
      
      <div className="space-y-3 pt-4">
        <input
          type="email"
          placeholder="Staff Email"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors">
          Sign In to Admin
        </button>
      </div>
    </div>
  );
}