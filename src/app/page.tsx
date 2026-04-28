'use client';

import { useGoTravelStore } from '@/store/go-travel-store';
import { Header } from '@/components/go-travel/header';
import { Footer } from '@/components/go-travel/footer';
import { HomePage } from '@/components/go-travel/home-page';
import { TourismPage } from '@/components/go-travel/tourism-page';
import { FlightsPage } from '@/components/go-travel/flights-page';
import { TrainsPage } from '@/components/go-travel/trains-page';
import { BusesPage } from '@/components/go-travel/buses-page';
import { RidesPage } from '@/components/go-travel/rides-page';
import { RentalsPage } from '@/components/go-travel/rentals-page';
import { HistoryPage } from '@/components/go-travel/history-page';

export default function GoTravelApp() {
  const { currentPage } = useGoTravelStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'tourism':
        return <TourismPage />;
      case 'flights':
        return <FlightsPage />;
      case 'trains':
        return <TrainsPage />;
      case 'buses':
        return <BusesPage />;
      case 'rides':
        return <RidesPage />;
      case 'rentals':
        return <RentalsPage />;
      case 'history':
        return <HistoryPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-1 pt-4">
        {renderPage()}
      </main>
      <Footer />
      {/* Spacer for mobile bottom nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
