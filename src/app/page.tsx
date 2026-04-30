'use client';

import { useEffect } from 'react';
import { useGoTravelStore } from '@/store/go-travel-store';
import { useAuthStore } from '@/store/auth-store';
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
import { BookingsPage } from '@/components/go-travel/bookings-page';
import AuthPage from '@/components/go-travel/auth-page';
import { ErrorBoundary } from '@/components/go-travel/error-boundary';

export default function GoTravelApp() {
  const { currentPage } = useGoTravelStore();
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
      case 'bookings':
        return <BookingsPage />;
      case 'auth':
        return <AuthPage />;
      default:
        return <HomePage />;
    }
  };

  // Auth page has its own layout (full screen, no header/footer)
  if (currentPage === 'auth') {
    return (
      <ErrorBoundary>
        <AuthPage />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-1 pt-4">
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </main>
      <Footer />
      {/* Spacer for mobile bottom nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
