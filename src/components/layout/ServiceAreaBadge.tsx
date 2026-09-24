'use client';
/**
 * SUREFIRE PLUMBING & HEATING — Service Area Declaration
 * Constitution: Always state current coverage clearly; never imply UK-wide service
 */

export default function ServiceAreaBadge() {
  const gmNote = process.env.NEXT_PUBLIC_GREATER_MANCHESTER_ENABLED === 'true'
    ? ' • Selected Areas of Greater Manchester'
    : '';

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-3 text-sm text-center mb-6">
      <span className="font-semibold text-blue-900">
        Serving North West England
      </span>
      <p className="text-gray-600 mt-1 text-xs">
        Liverpool • Merseyside • Cheshire • Runcorn • Widnes • Warrington • St Helens
        {gmNote}
      </p>
      <p className="text-blue-700 mt-1 text-xs font-medium">
        20+ Years Local Professional Experience
      </p>
    </div>
  );
}