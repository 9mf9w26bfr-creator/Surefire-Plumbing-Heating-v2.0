/**
 * SUREFIRE PLUMBING & HEATING — Service Area Configuration
 * Constitution v2.0: Expand via config, no hard-coded cities
 */

export type AreaStatus = 'active' | 'conditional' | 'inactive';

export interface ServiceAreaConfig {
  region: string;
  status: AreaStatus;
  cities: string[];
  postcodePrefixes: string[];
  allowedPostcodes?: string[];
  travelTimeWeight: number;
}

export const SERVICE_AREAS: Record<string, ServiceAreaConfig> = {
  liverpool: {
    region: 'Liverpool',
    status: 'active',
    cities: ['Liverpool'],
    postcodePrefixes: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'],
    travelTimeWeight: 1.0,
  },
  merseyside: {
    region: 'Merseyside',
    status: 'active',
    cities: ['Birkenhead', 'Wallasey', 'Hoylake'],
    postcodePrefixes: ['CH41', 'CH42', 'CH43', 'CH44', 'CH45', 'L20', 'L21'],
    travelTimeWeight: 1.0,
  },
  cheshire: {
    region: 'Cheshire',
    status: 'active',
    cities: ['Chester', 'Crewe', 'Nantwich'],
    postcodePrefixes: ['CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CW1', 'CW2'],
    travelTimeWeight: 1.05,
  },
  runcorn: {
    region: 'Runcorn',
    status: 'active',
    cities: ['Runcorn'],
    postcodePrefixes: ['WA7', 'WA8'],
    travelTimeWeight: 1.02,
  },
  widnes: {
    region: 'Widnes',
    status: 'active',
    cities: ['Widnes'],
    postcodePrefixes: ['WA8', 'WA9'],
    travelTimeWeight: 1.02,
  },
  warrington: {
    region: 'Warrington',
    status: 'active',
    cities: ['Warrington'],
    postcodePrefixes: ['WA1', 'WA2', 'WA3', 'WA4', 'WA5'],
    travelTimeWeight: 1.0,
  },
  stHelens: {
    region: 'St Helens',
    status: 'active',
    cities: ['St Helens'],
    postcodePrefixes: ['WA10', 'WA11', 'WA12'],
    travelTimeWeight: 1.0,
  },
  greaterManchester: {
    region: 'Greater Manchester',
    status: 'conditional',
    cities: ['Manchester'],
    postcodePrefixes: ['M1', 'M2', 'M3'],
    allowedPostcodes: ['M1', 'M2', 'M3'],
    travelTimeWeight: 1.1,
  },
  yorkshire: {
    region: 'Yorkshire',
    status: 'inactive',
    cities: [],
    postcodePrefixes: [],
    travelTimeWeight: 1.0,
  },
};