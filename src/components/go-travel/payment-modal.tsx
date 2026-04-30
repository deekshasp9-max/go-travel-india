'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Smartphone, Building2, Wallet, Clock, Mail,
  CheckCircle, X, Loader2, Shield, IndianRupee, Copy, QrCode,
  ArrowLeft, ChevronRight, Lock, AlertCircle, Info
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethod: string) => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'wallets' | 'paylater' | 'email';
type ProcessingState = 'idle' | 'processing' | 'success';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function generateTransactionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'GT';
  for (let i = 0; i < 14; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function detectCardBrand(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^5[1-5]/.test(n)) return 'MASTERCARD';
  if (/^3[47]/.test(n)) return 'AMEX';
  if (/^6(?:011|5)/.test(n)) return 'DISCOVER';
  if (/^35(2[89]|[3-8])/.test(n)) return 'JCB';
  return '';
}

function formatCardNumber(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 4);
  return v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
}

// ---------------------------------------------------------------------------
// UPI QR Code Component (SVG-based)
// ---------------------------------------------------------------------------

function UPIQRCode({ upiId, amount }: { upiId: string; amount: number }) {
  const upiLink = `upi://pay?pa=${upiId}&pn=GoTravel&am=${amount}&cu=INR`;
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    navigator.clipboard?.writeText(upiLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [upiLink]);

  // Simple QR-code-like pattern (visual placeholder) - using useMemo to avoid ref-during-render
  const cells = useMemo(() => {
    const grid = Array.from({ length: 21 }, () =>
      Array.from({ length: 21 }, () => Math.random() > 0.5)
    );
    const setFinder = (r: number, c: number) => {
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 21 && nc >= 0 && nc < 21)
            grid[nr][nc] = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
        }
    };
    setFinder(3, 3);
    setFinder(3, 17);
    setFinder(17, 3);
    return grid;
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-xl border-2 border-gray-200">
        <svg width="160" height="160" viewBox="0 0 21 21" className="w-40 h-40">
          {cells.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#1a1a1a" />
              ) : null
            )
          )}
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500">Scan with any UPI app</p>
        <p className="text-sm font-semibold text-gray-700 mt-1">GoTravel@upi</p>
        <p className="text-xs text-emerald-600 font-bold mt-0.5">{formatINR(amount)}</p>
      </div>
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
      >
        {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied!' : 'Copy UPI Link'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Payment Modal Component
// ---------------------------------------------------------------------------

export default function PaymentModal({ amount, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [state, setState] = useState<ProcessingState>('idle');
  const [txnId, setTxnId] = useState('');

  // UPI state
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState('');

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState('');

  // Pay Later state
  const [selectedPayLater, setSelectedPayLater] = useState('');

  // Email state
  const [payEmail, setPayEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const brand = detectCardBrand(cardNumber);
  const brandColors: Record<string, string> = {
    VISA: 'bg-blue-600', MASTERCARD: 'bg-red-500', AMEX: 'bg-green-600',
    DISCOVER: 'bg-orange-500', JCB: 'bg-green-700',
  };

  const resetAll = useCallback(() => {
    setState('idle');
    setTxnId('');
    setUpiId(''); setUpiError('');
    setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardName(''); setCardErrors({});
    setSelectedBank(''); setSelectedWallet(''); setSelectedPayLater('');
    setPayEmail(''); setEmailError('');
    setActiveTab('upi');
  }, []);

  const handleClose = useCallback(() => {
    if (state === 'processing') return;
    resetAll();
    onClose();
  }, [state, resetAll, onClose]);

  const processPayment = useCallback((method: string) => {
    setState('processing');
    const id = generateTransactionId();
    setTxnId(id);
    setTimeout(() => {
      setState('success');
      setTimeout(() => {
        onSuccess(method);
        resetAll();
      }, 1500);
    }, 2000);
  }, [onSuccess, resetAll]);

  // Validate & pay UPI
  const handleUPIPay = useCallback(() => {
    const id = upiId.trim();
    if (!id) { setUpiError('Please enter your UPI ID'); return; }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/.test(id)) { setUpiError('Invalid UPI ID format (e.g., name@bank)'); return; }
    setUpiError('');
    processPayment(`UPI: ${id}`);
  }, [upiId, processPayment]);

  // Validate & pay Card
  const handleCardPay = useCallback(() => {
    const errs: Record<string, string> = {};
    const num = cardNumber.replace(/\s/g, '');
    if (num.length < 15) errs.number = 'Enter a valid card number';
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) errs.expiry = 'Enter MM/YY';
    else {
      const [mm, yy] = cardExpiry.split('/').map(Number);
      if (mm < 1 || mm > 12) errs.expiry = 'Invalid month';
    }
    if (cardCvv.length < 3) errs.cvv = 'Enter CVV';
    if (!cardName.trim()) errs.name = 'Enter cardholder name';
    setCardErrors(errs);
    if (Object.keys(errs).length > 0) return;
    processPayment(`Card: ${brand || 'Debit/Credit'} ending ${num.slice(-4)}`);
  }, [cardNumber, cardExpiry, cardCvv, cardName, brand, processPayment]);

  // Pay Net Banking
  const handleNetBankingPay = useCallback(() => {
    if (!selectedBank) return;
    processPayment(`Net Banking: ${selectedBank}`);
  }, [selectedBank, processPayment]);

  // Pay Wallet
  const handleWalletPay = useCallback(() => {
    if (!selectedWallet) return;
    processPayment(`Wallet: ${selectedWallet}`);
  }, [selectedWallet, processPayment]);

  // Pay Later
  const handlePayLaterPay = useCallback(() => {
    if (!selectedPayLater) return;
    processPayment(`Pay Later: ${selectedPayLater}`);
  }, [selectedPayLater, processPayment]);

  // Pay Email Link
  const handleEmailPay = useCallback(() => {
    if (!payEmail.trim()) { setEmailError('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payEmail)) { setEmailError('Enter a valid email'); return; }
    setEmailError('');
    processPayment(`Email Link: ${payEmail}`);
  }, [payEmail, processPayment]);

  // Tab configuration
  const tabs: { id: PaymentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'upi', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'card', label: 'Cards', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="w-4 h-4" /> },
    { id: 'wallets', label: 'Wallets', icon: <Wallet className="w-4 h-4" /> },
    { id: 'paylater', label: 'Pay Later', icon: <Clock className="w-4 h-4" /> },
    { id: 'email', label: 'Email Link', icon: <Mail className="w-4 h-4" /> },
  ];

  // Bank list for net banking
  const banks = [
    'SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra',
    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IndusInd Bank',
  ];

  // Wallets list
  const wallets = [
    { name: 'Paytm', icon: '📱' },
    { name: 'PhonePe', icon: '💜' },
    { name: 'Amazon Pay', icon: '📦' },
    { name: 'Freecharge', icon: '⚡' },
    { name: 'MobiKwik', icon: '💰' },
    { name: 'Jio Money', icon: '🔵' },
  ];

  // Pay Later list
  const payLaterOptions = [
    { name: 'LazyPay', icon: '🌙' },
    { name: 'Simpl', icon: '✨' },
    { name: 'Ola Postpaid', icon: '🚗' },
    { name: 'Amazon Pay Later', icon: '📦' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] p-0 overflow-hidden" onPointerDownOutside={(e) => state === 'processing' && e.preventDefault()}>
        {/* Processing overlay */}
        <AnimatePresence>
          {state === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
              <p className="text-lg font-bold text-gray-900">Processing Payment...</p>
              <p className="text-sm text-gray-500 mt-1">Please do not close this window</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success overlay */}
        <AnimatePresence>
          {state === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-sm text-gray-500 mt-1">{formatINR(amount)} paid</p>
              {txnId && (
                <p className="text-xs text-gray-400 mt-2 font-mono">Txn: {txnId}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Secure Payment
            </DialogTitle>
            <DialogDescription className="text-emerald-100 text-sm">
              Your payment information is encrypted and secure
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Amount bar */}
        <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-500">Amount to pay</span>
          </div>
          <span className="text-xl font-extrabold text-emerald-700">{formatINR(amount)}</span>
        </div>

        {/* Payment method tabs */}
        <div className="px-3 pt-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PaymentTab)} className="w-full">
            <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-gray-100 rounded-xl gap-0.5">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-[10px] sm:text-xs py-2 px-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 text-gray-500 gap-0.5 flex items-center justify-center"
                >
                  {tab.icon}
                  <span className="hidden sm:inline ml-1">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* UPI Tab */}
            <TabsContent value="upi" className="mt-4 px-2 pb-4">
              <div className="space-y-4">
                <UPIQRCode upiId="gotravel@ybl" amount={amount} />

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-700">Or enter UPI ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setUpiError(''); }}
                      placeholder="yourname@upi"
                      className="flex-1"
                    />
                    <Button onClick={handleUPIPay} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                      Pay {formatINR(amount)}
                    </Button>
                  </div>
                  {upiError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3 h-3" /> {upiError}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Cards Tab */}
            <TabsContent value="card" className="mt-4 px-2 pb-4">
              <div className="space-y-3">
                {/* Card Preview */}
                <div className={`relative rounded-2xl p-5 text-white ${brandColors[brand] || 'bg-gray-700'} transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm font-bold tracking-wider">{brand || 'CARD'}</span>
                    <CreditCard className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-lg font-mono tracking-widest mb-4">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-[10px] opacity-60 uppercase">Card Holder</p>
                      <p className="font-medium">{cardName || 'YOUR NAME'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-60 uppercase">Expires</p>
                      <p className="font-medium">{cardExpiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>

                {/* Card Number */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-500">CARD NUMBER</Label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setCardErrors((p) => ({ ...p, number: '' })); }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={cardErrors.number ? 'border-red-500' : ''}
                  />
                  {cardErrors.number && <p className="text-xs text-red-500">{cardErrors.number}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500">EXPIRY</Label>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => { setCardExpiry(formatExpiry(e.target.value)); setCardErrors((p) => ({ ...p, expiry: '' })); }}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={cardErrors.expiry ? 'border-red-500' : ''}
                    />
                    {cardErrors.expiry && <p className="text-xs text-red-500">{cardErrors.expiry}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-500">CVV</Label>
                    <Input
                      value={cardCvv}
                      onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setCardErrors((p) => ({ ...p, cvv: '' })); }}
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      className={cardErrors.cvv ? 'border-red-500' : ''}
                    />
                    {cardErrors.cvv && <p className="text-xs text-red-500">{cardErrors.cvv}</p>}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-500">CARDHOLDER NAME</Label>
                  <Input
                    value={cardName}
                    onChange={(e) => { setCardName(e.target.value); setCardErrors((p) => ({ ...p, name: '' })); }}
                    placeholder="Name on card"
                    className={cardErrors.name ? 'border-red-500' : ''}
                  />
                  {cardErrors.name && <p className="text-xs text-red-500">{cardErrors.name}</p>}
                </div>

                <Button onClick={handleCardPay} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold">
                  <Lock className="w-4 h-4 mr-2" /> Pay {formatINR(amount)}
                </Button>
                <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> 256-bit SSL encrypted
                </p>
              </div>
            </TabsContent>

            {/* Net Banking Tab */}
            <TabsContent value="netbanking" className="mt-4 px-2 pb-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Select your bank to proceed</p>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                  {banks.map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                        selectedBank === bank
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 text-gray-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mb-1 text-gray-400" />
                      {bank}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleNetBankingPay}
                  disabled={!selectedBank}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold disabled:opacity-50"
                >
                  Pay {formatINR(amount)} via {selectedBank || 'Bank'}
                </Button>
              </div>
            </TabsContent>

            {/* Wallets Tab */}
            <TabsContent value="wallets" className="mt-4 px-2 pb-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Pay using your preferred wallet</p>
                <div className="space-y-2">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => setSelectedWallet(wallet.name)}
                      className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        selectedWallet === wallet.name
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="text-sm font-semibold text-gray-700">{wallet.name}</span>
                      {selectedWallet === wallet.name && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleWalletPay}
                  disabled={!selectedWallet}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold disabled:opacity-50"
                >
                  Pay {formatINR(amount)} via {selectedWallet || 'Wallet'}
                </Button>
              </div>
            </TabsContent>

            {/* Pay Later Tab */}
            <TabsContent value="paylater" className="mt-4 px-2 pb-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>Buy now, pay later with no extra charges</span>
                </div>
                <div className="space-y-2">
                  {payLaterOptions.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setSelectedPayLater(opt.name)}
                      className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        selectedPayLater === opt.name
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-sm font-semibold text-gray-700">{opt.name}</span>
                      {selectedPayLater === opt.name && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handlePayLaterPay}
                  disabled={!selectedPayLater}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold disabled:opacity-50"
                >
                  Pay {formatINR(amount)} via {selectedPayLater || 'Pay Later'}
                </Button>
              </div>
            </TabsContent>

            {/* Email Link Tab */}
            <TabsContent value="email" className="mt-4 px-2 pb-4">
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900">Pay via Email Link</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    We&apos;ll send a secure payment link to your email
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Email Address</Label>
                  <Input
                    value={payEmail}
                    onChange={(e) => { setPayEmail(e.target.value); setEmailError(''); }}
                    placeholder="you@example.com"
                    type="email"
                    className={emailError ? 'border-red-500' : ''}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {emailError}
                    </p>
                  )}
                </div>
                <Button onClick={handleEmailPay} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold">
                  <Mail className="w-4 h-4 mr-2" /> Send Payment Link
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            <span>100% Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[9px]">SSL</Badge>
            <Badge variant="secondary" className="text-[9px]">PCI DSS</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
