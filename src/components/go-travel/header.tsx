'use client';

import { useGoTravelStore, type Page } from '@/store/go-travel-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import {
  MapPin, Bike, Car, History,
  Menu, Shield, Home, Compass,
  LogIn, LogOut, Ticket, CircleUser
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'tourism', label: 'Tour Packages', icon: <Compass className="w-4 h-4" /> },
  { id: 'rides', label: 'Local Rides', icon: <Bike className="w-4 h-4" /> },
  { id: 'rentals', label: 'Rentals', icon: <Car className="w-4 h-4" /> },
  { id: 'history', label: 'My Records', icon: <History className="w-4 h-4" /> },
];

export function Header() {
  const { currentPage, setCurrentPage } = useGoTravelStore();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
                <Image src="/logo.jpeg" alt="Go Travel" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Go Travel
                </h1>
                <p className="text-[10px] text-gray-400 -mt-1 font-medium tracking-wide">INDIA&apos;S TRAVEL COMPANION</p>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">{item.icon}{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right side: Auth + Bookings */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex items-center gap-1 border-emerald-200 text-emerald-700 bg-emerald-50 px-2.5 py-1">
                <Shield className="w-3 h-3" />
                Women&apos;s Safety
              </Badge>

              {user ? (
                <div className="hidden lg:flex items-center gap-2">
                  {/* My Bookings button */}
                  <button
                    onClick={() => navigate('bookings')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === 'bookings'
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Ticket className="w-4 h-4" />
                    Bookings
                  </button>

                  {/* User avatar & dropdown */}
                  <div className="flex items-center gap-2 ml-1 pl-2 border-l border-gray-200">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-gray-400 hover:text-red-500" title="Logout">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => navigate('auth')}
                  className="hidden lg:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 h-9 text-sm font-semibold shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Login / Sign Up
                </Button>
              )}

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <div className="p-4 border-b bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden">
                        <Image src="/logo.jpeg" alt="Go Travel" width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-lg font-bold">Go Travel</span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-1">India&apos;s Travel Companion</p>
                    {user && (
                      <div className="flex items-center gap-2 mt-3 bg-white/15 rounded-lg px-3 py-2">
                        <CircleUser className="w-5 h-5" />
                        <div>
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-[10px] text-emerald-100">{user.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <nav className="p-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all mb-1 ${
                          currentPage === item.id
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}

                    {/* Bookings in mobile menu */}
                    {user && (
                      <button
                        onClick={() => navigate('bookings')}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all mb-1 ${
                          currentPage === 'bookings'
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Ticket className="w-4 h-4" />
                        My Bookings
                      </button>
                    )}

                    {/* Auth in mobile menu */}
                    <div className="border-t mt-2 pt-2">
                      {user ? (
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 text-red-500 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('auth')}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <LogIn className="w-4 h-4" />
                          Login / Sign Up
                        </button>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around py-1.5 px-1">
          {[
            { id: 'home' as Page, label: 'Home', icon: <Home className="w-5 h-5" /> },
            { id: 'tourism' as Page, label: 'Packages', icon: <Compass className="w-5 h-5" /> },
            { id: 'rides' as Page, label: 'Rides', icon: <Bike className="w-5 h-5" /> },
            { id: 'rentals' as Page, label: 'Rent', icon: <Car className="w-5 h-5" /> },
            { id: 'history' as Page, label: 'Records', icon: <History className="w-5 h-5" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                currentPage === item.id
                  ? 'text-emerald-600'
                  : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
