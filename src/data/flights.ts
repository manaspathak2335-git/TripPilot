export type FlightStatus = 'On Time' | 'Delayed' | 'Boarding' | 'In Air' | 'Landed';

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineLogo: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: FlightStatus;
  gate: string;
  terminal: string;
  aircraft: string;
  currentLat: number;
  currentLng: number;
  altitude: number;
  speed: number;
  heading: number;
  progress: number;
  // Optional raw route/debug data returned from backend
  raw_route?: any;
}

export const flights: Flight[] = [
  {
    id: "1",
    flightNumber: "AI101",
    airline: "Air India",
    airlineLogo: "🛫",
    origin: "DEL",
    destination: "BOM",
    departureTime: "06:30",
    arrivalTime: "08:45",
    status: "In Air",
    gate: "T3-42",
    terminal: "Terminal 3",
    aircraft: "Boeing 787-8",
    currentLat: 23.5,
    currentLng: 75.2,
    altitude: 35000,
    speed: 520,
    heading: 225,
    progress: 65
  },
  {
    id: "2",
    flightNumber: "6E234",
    airline: "IndiGo",
    airlineLogo: "✈️",
    origin: "BLR",
    destination: "DEL",
    departureTime: "07:15",
    arrivalTime: "10:00",
    status: "In Air",
    gate: "T1-15",
    terminal: "Terminal 1",
    aircraft: "Airbus A320neo",
    currentLat: 18.9,
    currentLng: 77.8,
    altitude: 38000,
    speed: 540,
    heading: 15,
    progress: 45
  },
  {
    id: "3",
    flightNumber: "SG456",
    airline: "SpiceJet",
    airlineLogo: "🔴",
    origin: "CCU",
    destination: "BOM",
    departureTime: "08:00",
    arrivalTime: "11:15",
    status: "Delayed",
    gate: "T2-28",
    terminal: "Terminal 2",
    aircraft: "Boeing 737-800",
    currentLat: 22.6547,
    currentLng: 88.4467,
    altitude: 0,
    speed: 0,
    heading: 0,
    progress: 0
  },
  {
    id: "4",
    flightNumber: "UK887",
    airline: "Vistara",
    airlineLogo: "💜",
    origin: "DEL",
    destination: "BLR",
    departureTime: "09:30",
    arrivalTime: "12:20",
    status: "Boarding",
    gate: "T3-56",
    terminal: "Terminal 3",
    aircraft: "Airbus A321neo",
    currentLat: 28.5562,
    currentLng: 77.1000,
    altitude: 0,
    speed: 0,
    heading: 180,
    progress: 0
  },
  {
    id: "5",
    flightNumber: "AI502",
    airline: "Air India",
    airlineLogo: "🛫",
    origin: "BOM",
    destination: "HYD",
    departureTime: "10:15",
    arrivalTime: "11:45",
    status: "On Time",
    gate: "T2-12",
    terminal: "Terminal 2",
    aircraft: "Airbus A320",
    currentLat: 19.0896,
    currentLng: 72.8656,
    altitude: 0,
    speed: 0,
    heading: 90,
    progress: 0
  },
  {
    id: "6",
    flightNumber: "6E112",
    airline: "IndiGo",
    airlineLogo: "✈️",
    origin: "MAA",
    destination: "DEL",
    departureTime: "11:00",
    arrivalTime: "13:45",
    status: "In Air",
    gate: "T1-08",
    terminal: "Terminal 1",
    aircraft: "Airbus A321",
    currentLat: 17.5,
    currentLng: 79.2,
    altitude: 36000,
    speed: 510,
    heading: 350,
    progress: 38
  },
  {
    id: "7",
    flightNumber: "SG789",
    airline: "SpiceJet",
    airlineLogo: "🔴",
    origin: "AMD",
    destination: "GOI",
    departureTime: "12:30",
    arrivalTime: "14:00",
    status: "On Time",
    gate: "T2-05",
    terminal: "Terminal 2",
    aircraft: "Boeing 737 MAX 8",
    currentLat: 23.0772,
    currentLng: 72.6347,
    altitude: 0,
    speed: 0,
    heading: 210,
    progress: 0
  },
  {
    id: "8",
    flightNumber: "UK456",
    airline: "Vistara",
    airlineLogo: "💜",
    origin: "HYD",
    destination: "CCU",
    departureTime: "13:15",
    arrivalTime: "15:30",
    status: "In Air",
    gate: "T1-22",
    terminal: "Terminal 1",
    aircraft: "Boeing 787-9",
    currentLat: 19.8,
    currentLng: 84.5,
    altitude: 34000,
    speed: 495,
    heading: 45,
    progress: 55
  },
  {
    id: "9",
    flightNumber: "AI303",
    airline: "Air India",
    airlineLogo: "🛫",
    origin: "COK",
    destination: "DEL",
    departureTime: "14:00",
    arrivalTime: "17:15",
    status: "In Air",
    gate: "T3-18",
    terminal: "Terminal 3",
    aircraft: "Airbus A350-900",
    currentLat: 15.2,
    currentLng: 76.8,
    altitude: 39000,
    speed: 560,
    heading: 5,
    progress: 42
  },
  {
    id: "10",
    flightNumber: "6E567",
    airline: "IndiGo",
    airlineLogo: "✈️",
    origin: "PNQ",
    destination: "BLR",
    departureTime: "15:30",
    arrivalTime: "16:45",
    status: "Landed",
    gate: "T1-32",
    terminal: "Terminal 1",
    aircraft: "Airbus A320neo",
    currentLat: 13.1986,
    currentLng: 77.7066,
    altitude: 0,
    speed: 0,
    heading: 0,
    progress: 100
  },
  {
    id: "11",
    flightNumber: "SG321",
    airline: "SpiceJet",
    airlineLogo: "🔴",
    origin: "GOI",
    destination: "MAA",
    departureTime: "16:00",
    arrivalTime: "17:45",
    status: "In Air",
    gate: "T1-04",
    terminal: "Terminal 1",
    aircraft: "Boeing 737-800",
    currentLat: 13.8,
    currentLng: 76.2,
    altitude: 32000,
    speed: 480,
    heading: 85,
    progress: 72
  },
  {
    id: "12",
    flightNumber: "UK234",
    airline: "Vistara",
    airlineLogo: "💜",
    origin: "DEL",
    destination: "COK",
    departureTime: "17:30",
    arrivalTime: "20:45",
    status: "Boarding",
    gate: "T3-61",
    terminal: "Terminal 3",
    aircraft: "Airbus A321neo",
    currentLat: 28.5562,
    currentLng: 77.1000,
    altitude: 0,
    speed: 0,
    heading: 200,
    progress: 0
  },
  {
    id: "13",
    flightNumber: "AI678",
    airline: "Air India",
    airlineLogo: "🛫",
    origin: "BLR",
    destination: "CCU",
    departureTime: "18:15",
    arrivalTime: "20:45",
    status: "Delayed",
    gate: "T2-09",
    terminal: "Terminal 2",
    aircraft: "Boeing 777-300ER",
    currentLat: 13.1986,
    currentLng: 77.7066,
    altitude: 0,
    speed: 0,
    heading: 45,
    progress: 0
  },
  {
    id: "14",
    flightNumber: "6E890",
    airline: "IndiGo",
    airlineLogo: "✈️",
    origin: "HYD",
    destination: "AMD",
    departureTime: "19:00",
    arrivalTime: "21:00",
    status: "On Time",
    gate: "T1-14",
    terminal: "Terminal 1",
    aircraft: "Airbus A320",
    currentLat: 17.2403,
    currentLng: 78.4294,
    altitude: 0,
    speed: 0,
    heading: 315,
    progress: 0
  },
  {
    id: "15",
    flightNumber: "SG145",
    airline: "SpiceJet",
    airlineLogo: "🔴",
    origin: "BOM",
    destination: "PNQ",
    departureTime: "20:30",
    arrivalTime: "21:15",
    status: "On Time",
    gate: "T2-33",
    terminal: "Terminal 2",
    aircraft: "Bombardier Q400",
    currentLat: 19.0896,
    currentLng: 72.8656,
    altitude: 0,
    speed: 0,
    heading: 120,
    progress: 0
  }
];

export const getFlightById = (id: string): Flight | undefined => {
  return flights.find(f => f.id === id);
};

export const getFlightsByStatus = (status: FlightStatus): Flight[] => {
  return flights.filter(f => f.status === status);
};

export const searchFlights = (query: string): Flight[] => {
  const q = query.toLowerCase();
  return flights.filter(f => 
    f.flightNumber.toLowerCase().includes(q) ||
    f.origin.toLowerCase().includes(q) ||
    f.destination.toLowerCase().includes(q) ||
    f.airline.toLowerCase().includes(q)
  );
};
