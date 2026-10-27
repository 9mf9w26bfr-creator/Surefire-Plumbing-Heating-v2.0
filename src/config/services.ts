export interface ServiceDefinition {
  id: string;
  name: string;
  category: 'Plumbing' | 'Heating' | 'Boiler' | 'Emergency';
  description: string;
  baseMin: number;
  baseMax: number;
  durationAvg: number; // minutes
}

export const SERVICES: ServiceDefinition[] = [
  {
    id: 'emergency-plumbing',
    name: 'Emergency Plumbing',
    category: 'Emergency',
    description: 'Leaks, burst pipes, overflow issues & urgent call-outs',
    baseMin: 85,
    baseMax: 220,
    durationAvg: 60,
  },
  {
    id: 'boiler-heating',
    name: 'Boiler & Central Heating',
    category: 'Boiler',
    description: 'Boiler breakdowns, annual servicing, radiator balancing & installation',
    baseMin: 55,
    baseMax: 160,
    durationAvg: 90,
  },
  {
    id: 'general-repairs',
    name: 'General Plumbing Repairs',
    category: 'Plumbing',
    description: 'Dripping taps, toilet flush mechanisms, shower valves & pipework',
    baseMin: 30,
    baseMax: 95,
    durationAvg: 45,
  },
  {
    id: 'maintenance',
    name: 'Plumbing Maintenance',
    category: 'Plumbing',
    description: 'Landlord CP12 gas safety checks, system flushes & preventive inspection',
    baseMin: 20,
    baseMax: 75,
    durationAvg: 60,
  },
];
