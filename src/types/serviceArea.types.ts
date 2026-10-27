export type AreaStatus = 'active' | 'conditional' | 'inactive';

export interface ServiceAreaConfig {
  region: string;
  status: AreaStatus;
  cities: string[];
  postcodePrefixes: string[];
  allowedPostcodes?: string[];
  travelTimeWeight: number;
}
