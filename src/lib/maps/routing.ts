/**
 * Google Maps / Distance Matrix Routing Helper
 */

export interface TravelEstimate {
  distanceMiles: number;
  durationMinutes: number;
  withinStandardRadius: boolean;
}

export async function calculateTravelEstimate(
  originPostcode: string,
  destinationPostcode: string
): Promise<TravelEstimate> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    // Standard North West fallback estimate
    return {
      distanceMiles: 8.5,
      durationMinutes: 20,
      withinStandardRadius: true,
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      originPostcode
    )}&destinations=${encodeURIComponent(destinationPostcode)}&key=${apiKey}&units=imperial`;

    const res = await fetch(url);
    const data = await res.json();

    const element = data.rows?.[0]?.elements?.[0];
    if (element && element.status === 'OK') {
      const distanceMiles = Math.round((element.distance.value / 1609.34) * 10) / 10;
      const durationMinutes = Math.round(element.duration.value / 60);
      return {
        distanceMiles,
        durationMinutes,
        withinStandardRadius: distanceMiles <= 10,
      };
    }
  } catch (err) {
    console.warn('[Routing API Warning]', err);
  }

  return {
    distanceMiles: 9,
    durationMinutes: 22,
    withinStandardRadius: true,
  };
}
