'use client';

import { useGoTravelStore, type Page } from '@/store/go-travel-store';
import { Shield, Phone, Mail, Heart, Globe } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const { setCurrentPage } = useGoTravelStore();

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-11 h-11 rounded-lg overflow-hidden">
                <Image src="/logo.jpeg" alt="Go Travel" width={44} height={44} className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold text-white">Go Travel</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India&apos;s comprehensive travel platform. Explore tour packages and book local rides — all in one place.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('tourism')} className="hover:text-emerald-400 transition-colors">Tour Packages</button></li>
              <li><button onClick={() => navigate('rides')} className="hover:text-emerald-400 transition-colors">Local Rides</button></li>
              <li><button onClick={() => navigate('rentals')} className="hover:text-emerald-400 transition-colors">Vehicle Rentals</button></li>
              <li><button onClick={() => navigate('history')} className="hover:text-emerald-400 transition-colors">My Records</button></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> Women&apos;s Safety</span></li>
              <li><span className="flex items-center gap-1"><Globe className="w-3 h-3 text-emerald-400" /> GPS Tracking</span></li>
              <li><button onClick={() => navigate('bookings')} className="hover:text-emerald-400 transition-colors">My Bookings</button></li>
              <li><button onClick={() => navigate('auth')} className="hover:text-emerald-400 transition-colors">Login / Sign Up</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-3 h-3" /> 1800-XXX-XXXX</li>
              <li className="flex items-center gap-2"><Mail className="w-3 h-3" /> help@gotravel.in</li>
              <li className="flex items-center gap-2"><Globe className="w-3 h-3" /> www.gotravel.in</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © 2025 Go Travel India. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
