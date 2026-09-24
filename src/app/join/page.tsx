'use client';

export default function JoinPage() {
  return (
    <div className="space-y-6 py-4">
      <h1 className="text-2xl font-bold text-primary">Join Our Team</h1>
      <p className="text-gray-600">
        We are always looking for skilled, reliable engineers to join our growing team.
      </p>
      
      <div className="bg-gray-50 p-5 rounded-lg space-y-4">
        <h2 className="font-semibold text-lg">What We Look For</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✅ Relevant qualifications &amp; experience</li>
          <li>✅ Gas Safe registration (for heating roles)</li>
          <li>✅ Own transport &amp; tools</li>
          <li>✅ Professional, friendly manner</li>
          <li>✅ Right to work in the UK</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">How to Apply</h2>
        <p>Send your CV and a short cover note to:</p>
        <p className="font-mono bg-gray-50 p-3 rounded text-blue-700">
          join@surefireplumbingheating.co.uk
        </p>
        <p className="text-sm text-gray-500">
          We review every application and aim to reply within 3 working days.
        </p>
      </div>
    </div>
  );
}