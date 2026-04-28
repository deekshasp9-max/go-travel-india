import { create } from 'zustand';

export type Page = 'home' | 'tourism' | 'flights' | 'trains' | 'buses' | 'rides' | 'rentals' | 'history';

interface GoTravelState {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedItinerary: string | null;
  setSelectedItinerary: (id: string | null) => void;
  rideState: {
    status: 'idle' | 'searching' | 'confirming' | 'ongoing' | 'completed';
    rideType: string;
    pickup: string;
    destination: string;
    pickupCoords: [number, number] | null;
    destCoords: [number, number] | null;
    distance: number;
    fare: number;
    currentRideId: string | null;
  };
  setRideState: (state: Partial<GoTravelState['rideState']>) => void;
  driverPosition: [number, number] | null;
  setDriverPosition: (pos: [number, number] | null) => void;
}

export const useGoTravelStore = create<GoTravelState>((set) => ({
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  selectedItinerary: null,
  setSelectedItinerary: (id) => set({ selectedItinerary: id }),
  rideState: {
    status: 'idle',
    rideType: 'auto',
    pickup: '',
    destination: '',
    pickupCoords: null,
    destCoords: null,
    distance: 0,
    fare: 0,
    currentRideId: null,
  },
  setRideState: (state) =>
    set((prev) => ({
      rideState: { ...prev.rideState, ...state },
    })),
  driverPosition: null,
  setDriverPosition: (pos) => set({ driverPosition: pos }),
}));
