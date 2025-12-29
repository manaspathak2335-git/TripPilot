export interface Airport {
  code: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  terminal: number;
  amenities: {
    restaurants: number;
    lounges: number;
    shops: number;
    services: number;
  };
}

// Empty array - airports are now fetched from API
export const airports: Airport[] = [];

// Helper function to get airport by code
// This will be replaced with API call if needed
export const getAirportByCode = (code: string): Airport | undefined => {
  return airports.find(a => a.code === code);
};
