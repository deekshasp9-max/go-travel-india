'use client';

import { useGoTravelStore, type Page } from '@/store/go-travel-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plane, Train, Bus, Bike, Car, Building2, History,
  Menu, X, Shield, ChevronDown, Home, Compass, CreditCard, Star
} from 'lucide-react';
import { useState } from 'react';

const navItems: { id: Page; label: string; icon: React.ReactNode; mobileOnly?: boolean }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'tourism', label: 'Explore India', icon: <Compass className="w-4 h-4" /> },
  { id: 'flights', label: 'Flights', icon: <Plane className="w-4 h-4" /> },
  { id: 'trains', label: 'Trains', icon: <Train className="w-4 h-4" /> },
  { id: 'buses', label: 'Buses', icon: <Bus className="w-4 h-4" /> },
  { id: 'rides', label: 'Local Rides', icon: <Bike className="w-4 h-4" /> },
  { id: 'rentals', label: 'Rentals', icon: <Car className="w-4 h-4" /> },
  { id: 'history', label: 'My Records', icon: <History className="w-4 h-4" /> },
];

export function Header() {
  const { currentPage, setCurrentPage } = useGoTravelStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [travelDropdown, setTravelDropdown] = useState(false);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setMobileOpen(false);
    setTravelDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
                <MapPin className="w-5 h-5 text-white" />
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
              {navItems.slice(0, 6).map((item) => (
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

              {/* Travel Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTravelDropdown(!travelDropdown)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    ['flights', 'trains', 'buses'].includes(currentPage)
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  More
                  <ChevronDown className={`w-3 h-3 transition-transform ${travelDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {travelDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 z-50"
                    >
                      {[
                        { id: 'trains' as Page, label: 'Trains', icon: <Train className="w-4 h-4" /> },
                        { id: 'buses' as Page, label: 'Buses', icon: <Bus className="w-4 h-4" /> },
                        { id: 'rentals' as Page, label: 'Rentals', icon: <Car className="w-4 h-4" /> },
                        { id: 'history' as Page, label: 'My Records', icon: <History className="w-4 h-4" /> },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.id)}
                          className={`w-full px-4 py-2.5 text-sm flex items-center gap-2.5 hover:bg-gray-50 transition-colors ${
                            currentPage === item.id ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
                          }`}
                        >
                          {item.icon}{item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex items-center gap-1 border-emerald-200 text-emerald-700 bg-emerald-50 px-2.5 py-1">
                <Shield className="w-3 h-3" />
                Women&apos;s Safety
              </Badge>
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
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg font-bold">Go Travel</span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-1">India&apos;s Travel Companion</p>
                  </div>
                  <nav className="p-2">
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
            { id: 'tourism' as Page, label: 'Explore', icon: <Compass className="w-5 h-5" /> },
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
