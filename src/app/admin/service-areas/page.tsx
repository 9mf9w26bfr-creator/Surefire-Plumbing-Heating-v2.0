'use client';
import { useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';

export default function ServiceAreasPage() {
  const [areas, setAreas] = useState<string[]>([
    'Liverpool', 'Merseyside', 'Cheshire', 'Runcorn', 'Widnes', 'Warrington', 'St Helens'
  ]);
  const [newArea, setNewArea] = useState('');

  const addArea = () => {
    if (newArea.trim() && !areas.includes(newArea.trim())) {
      setAreas([...areas, newArea.trim()]);
      setNewArea('');
    }
  };

  const removeArea = (area: string) => {
    setAreas(areas.filter(a => a !== area));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#0F2B4A]">Service Areas</h1>

      <div className="flex gap-2">
        <input
          type="text"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
          placeholder="Add new area..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          onKeyDown={(e) => e.key === 'Enter' && addArea()}
        />
        <button
          onClick={addArea}
          className="px-4 py-2 bg-[#0F2B4A] text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {areas.map(area => (
          <div key={area} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              {area}
            </span>
            <button onClick={() => removeArea(area)} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}