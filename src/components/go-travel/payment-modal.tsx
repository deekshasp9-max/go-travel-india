"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Clock,
  Mail,
  ChevronRight,
  Check,
  Shield,
  ArrowLeft,
  QrCode,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: string) => void;
}

type PaymentCategory =
  | "upi"
  | "cards"
  | "netbanking"
  | "wallets"
  | "paylater"
  | "emaillink";

type ModalView = "main" | "processing" | "success";

interface PaymentOption {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  color?: string;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const CATEGORY_META: {
  id: PaymentCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "upi", label: "UPI", icon: <Smartphone className="size-4" /> },
  {
    id: "cards",
    label: "Cards",
    icon: <CreditCard className="size-4" />,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: <Building2 className="size-4" />,
  },
  { id: "wallets", label: "Wallets", icon: <Wallet className="size-4" /> },
  {
    id: "paylater",
    label: "Pay Later",
    icon: <Clock className="size-4" />,
  },
  {
    id: "emaillink",
    label: "Email Link",
    icon: <Mail className="size-4" />,
  },
];

const UPI_OPTIONS: PaymentOption[] = [
  {
    id: "gpay",
    label: "Google Pay",
    icon: (
      <span className="flex size-8 items-center justify-center rounded-lg bg-white shadow-sm border text-[10px] font-bold text-gray-800">
        G
      </span>
    ),
  },
  {
    id: "phonepe",
    label: "PhonePe",
    icon: (
      <span className="flex size-8 items-center justify-center rounded-lg bg-purple-600 text-[10px] font-bold text-white">
        P
      </span>
    ),
  },
  {
    id: "paytm",
    label: "Paytm",
    icon: (
      <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500 text-[10px] font-bold text-white">
        PT
      </span>
    ),
  },
  {
    id: "bhim",
    label: "BHIM UPI",
    icon: (
      <span className="flex size-8 items-center justify-center rounded-lg bg-green-600 text-[10px] font-bold text-white">
        B
      </span>
    ),
  },
  {
    id: "qrcode",
    label: "QR Code",
    icon: <QrCode className="size-5 text-gray-700" />,
  },
  {
    id: "upiid",
    label: "Enter UPI ID",
    sublabel: "e.g. name@upi",
    icon: (
      <span className="flex size-8 items-center justify-center rounded-lg bg-gray-100">
        <Smartphone className="size-4 text-gray-500" />
      </span>
    ),
  },
];

const CARD_BRANDS = [
  { id: "visa", label: "Visa", color: "bg-blue-700" },
  { id: "mastercard", label: "Mastercard", color: "bg-red-600" },
  { id: "rupay", label: "RuPay", color: "bg-green-700" },
  { id: "amex", label: "Amex", color: "bg-blue-500" },
];

const BANKS: PaymentOption[] = [
  { id: "sbi", label: "State Bank of India", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-blue-900 text-[10px] font-bold text-white">SBI</span> },
  { id: "hdfc", label: "HDFC Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-[10px] font-bold text-white">H</span> },
  { id: "icici", label: "ICICI Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-[10px] font-bold text-white">I</span> },
  { id: "axis", label: "Axis Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-red-700 text-[10px] font-bold text-white">A</span> },
  { id: "kotak", label: "Kotak Mahindra Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-yellow-500 text-[10px] font-bold text-red-900">K</span> },
  { id: "pnb", label: "Punjab National Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-orange-600 text-[10px] font-bold text-white">P</span> },
  { id: "bob", label: "Bank of Baroda", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-yellow-600 text-[10px] font-bold text-white">B</span> },
  { id: "canara", label: "Canara Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-yellow-400 text-[10px] font-bold text-gray-900">C</span> },
  { id: "union", label: "Union Bank of India", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-bold text-white">U</span> },
  { id: "indusind", label: "IndusInd Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-bold text-white">IN</span> },
  { id: "yes", label: "Yes Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-pink-600 text-[10px] font-bold text-white">Y</span> },
  { id: "idfc", label: "IDFC First Bank", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-[10px] font-bold text-white">ID</span> },
];

const WALLETS: PaymentOption[] = [
  { id: "paytm_wallet", label: "Paytm Wallet", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500 text-[10px] font-bold text-white">PT</span> },
  { id: "amazon_pay", label: "Amazon Pay", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-[10px] font-bold text-white">A</span> },
  { id: "phonepe_wallet", label: "PhonePe Wallet", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-purple-600 text-[10px] font-bold text-white">P</span> },
  { id: "mobikwik", label: "Mobikwik", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-[10px] font-bold text-white">M</span> },
  { id: "freecharge", label: "Freecharge", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-[10px] font-bold text-white">FC</span> },
  { id: "jiomoney", label: "Jio Money", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-blue-700 text-[10px] font-bold text-white">J</span> },
];

const PAY_LATER: PaymentOption[] = [
  { id: "simpl", label: "Simpl", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-[10px] font-bold text-white">S</span> },
  { id: "lazypay", label: "LazyPay", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-600 text-[10px] font-bold text-white">LP</span> },
  { id: "slice", label: "Slice", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-purple-500 text-[10px] font-bold text-white">SL</span> },
  { id: "flipkart_paylater", label: "Flipkart Pay Later", icon: <span className="flex size-8 items-center justify-center rounded-lg bg-yellow-500 text-[10px] font-bold text-blue-900">F</span> },
];

const OFFERS = [
  { code: "GOTRAVEL20", discount: "20% off", max: "up to ₹500", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { code: "FIRST100", discount: "₹100 off", max: "on first booking", color: "bg-orange-50 border-orange-200 text-orange-800" },
  { code: "WEEKEND", discount: "15% off", max: "weekend trips", color: "bg-violet-50 border-violet-200 text-violet-800" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectCardBrand(number: string): string | null {
  const cleaned = number.replace(/\s/g, "");
  if (/^4/.test(cleaned)) return "Visa";
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return "Mastercard";
  if (/^6/.test(cleaned)) return "RuPay";
  if (/^3[47]/.test(cleaned)) return "Amex";
  return null;
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 19);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
}

function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length >= 3) return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
  return cleaned;
}

function generateTransactionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TXN";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PaymentModal({
  amount,
  isOpen,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  // -- State -----------------------------------------------------------------
  const [activeCategory, setActiveCategory] = useState<PaymentCategory>("upi");
  const [view, setView] = useState<ModalView>("main");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [methodName, setMethodName] = useState("");

  // Form state
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailError, setEmailError] = useState("");

  // -- Effects ---------------------------------------------------------------

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setView("main");
      setActiveCategory("upi");
      setSelectedMethod(null);
      setUpiId("");
      setUpiError("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardName("");
      setCardBrand(null);
      setEmailAddress("");
      setEmailError("");
      setTransactionId("");
      setMethodName("");
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-detect card brand
  useEffect(() => {
    setCardBrand(detectCardBrand(cardNumber));
  }, [cardNumber]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && view === "main") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, view, onClose]);

  // -- Handlers --------------------------------------------------------------

  const handlePay = useCallback(() => {
    if (!selectedMethod) return;

    let valid = true;
    let methodLabel = selectedMethod;

    // Validate based on category
    if (activeCategory === "upi" && selectedMethod === "upiid") {
      if (!upiId.includes("@")) {
        setUpiError("Please enter a valid UPI ID (e.g. name@upi)");
        valid = false;
      } else {
        setUpiError("");
        methodLabel = `UPI: ${upiId}`;
      }
    }

    if (activeCategory === "cards" && selectedMethod === "new_card") {
      if (cardNumber.replace(/\s/g, "").length < 13) {
        valid = false;
      }
      if (cardExpiry.length < 5) valid = false;
      if (cardCvv.length < 3) valid = false;
      if (!cardName.trim()) valid = false;
      if (valid) {
        methodLabel = `${cardBrand || "Card"} ending ${cardNumber.replace(/\s/g, "").slice(-4)}`;
      }
    }

    if (activeCategory === "emaillink") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress)) {
        setEmailError("Please enter a valid email address");
        valid = false;
      } else {
        setEmailError("");
        methodLabel = `Email: ${emailAddress}`;
      }
    }

    if (!valid) return;

    setMethodName(methodLabel);
    setView("processing");

    setTimeout(() => {
      setTransactionId(generateTransactionId());
      setView("success");
      setTimeout(() => {
        onSuccess(methodLabel);
      }, 2500);
    }, 2000);
  }, [
    selectedMethod,
    activeCategory,
    upiId,
    cardNumber,
    cardExpiry,
    cardCvv,
    cardName,
    cardBrand,
    emailAddress,
    onSuccess,
  ]);

  const handleOptionSelect = useCallback((id: string) => {
    setSelectedMethod(id);
    setUpiError("");
    setEmailError("");
  }, []);

  const getMethodLabel = useCallback(
    (option: PaymentOption) => option.label,
    []
  );

  // Options list per category
  const currentOptions = useMemo(() => {
    switch (activeCategory) {
      case "upi":
        return UPI_OPTIONS;
      case "cards":
        return [
          ...CARD_BRANDS.map((b) => ({
            id: b.id,
            label: b.label,
            icon: (
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg text-[10px] font-bold text-white",
                  b.color
                )}
              >
                {b.label.slice(0, 2).toUpperCase()}
              </span>
            ),
          })),
          {
            id: "new_card",
            label: "Add New Card",
            sublabel: "Visa, Mastercard, RuPay, Amex",
            icon: (
              <span className="flex size-8 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
                <CreditCard className="size-4" />
              </span>
            ),
          },
        ];
      case "netbanking":
        return BANKS;
      case "wallets":
        return WALLETS;
      case "paylater":
        return PAY_LATER;
      case "emaillink":
        return [];
      default:
        return [];
    }
  }, [activeCategory]);

  const showPayButton = useMemo(() => {
    if (activeCategory === "emaillink") return true;
    if (activeCategory === "cards" && selectedMethod === "new_card") return true;
    if (activeCategory === "upi" && selectedMethod === "upiid") return true;
    if (activeCategory === "upi" && selectedMethod === "qrcode") return false;
    return !!selectedMethod;
  }, [activeCategory, selectedMethod]);

  // -- Portal ---------------------------------------------------------------

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Payment gateway"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={view === "main" ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 flex flex-col overflow-hidden bg-white shadow-2xl",
          "w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[540px]",
          "rounded-none md:rounded-2xl",
          "animate-in slide-in-from-bottom md:slide-in-from-bottom-4 fade-in duration-300"
        )}
      >
        {/* ---- Main View ---- */}
        {view === "main" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
              <button
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close payment modal"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* Amount + Offers */}
            <div className="border-b px-5 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {formatINR(amount)}
                </span>
                <span className="text-sm text-gray-500">to pay</span>
              </div>

              {/* Offers */}
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Offers
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {OFFERS.map((offer) => (
                    <div
                      key={offer.code}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-2 rounded-lg border px-3 py-2",
                        offer.color
                      )}
                    >
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/70 border-0 font-mono">
                        {offer.code}
                      </Badge>
                      <span className="text-xs font-medium whitespace-nowrap">
                        {offer.discount} {offer.max}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Body: Category Sidebar + Content */}
            <div className="flex flex-1 min-h-0">
              {/* Sidebar Categories */}
              <nav className="w-[110px] md:w-[120px] flex-shrink-0 border-r bg-gray-50/80 overflow-y-auto">
                <ul className="py-2 space-y-0.5">
                  {CATEGORY_META.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setSelectedMethod(null);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium transition-colors",
                          activeCategory === cat.id
                            ? "bg-white text-primary shadow-sm border-r-2 border-primary"
                            : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                        )}
                      >
                        <span
                          className={cn(
                            "flex items-center justify-center",
                            activeCategory === cat.id
                              ? "text-primary"
                              : "text-gray-400"
                          )}
                        >
                          {cat.icon}
                        </span>
                        <span className="leading-tight">{cat.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Content Area */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Email Link Category */}
                  {activeCategory === "emaillink" ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Send Payment Link
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Enter an email address and we&apos;ll send a payment link.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor="email-link"
                            className="text-xs font-medium text-gray-700 mb-1 block"
                          >
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <Input
                              id="email-link"
                              type="email"
                              placeholder="you@example.com"
                              value={emailAddress}
                              onChange={(e) => {
                                setEmailAddress(e.target.value);
                                if (emailError) setEmailError("");
                              }}
                              className="pl-9"
                            />
                          </div>
                          {emailError && (
                            <p className="text-xs text-red-500 mt-1">
                              {emailError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {currentOptions.map((option) => {
                        const isSelected = selectedMethod === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                              isSelected
                                ? "bg-primary/5 border border-primary/20 shadow-sm"
                                : "hover:bg-gray-50 border border-transparent"
                            )}
                          >
                            <div className="flex-shrink-0">{option.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {option.label}
                              </p>
                              {option.sublabel && (
                                <p className="text-xs text-gray-500 truncate">
                                  {option.sublabel}
                                </p>
                              )}
                            </div>
                            {isSelected ? (
                              <div className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                                <Check className="size-3 text-white" />
                              </div>
                            ) : (
                              <ChevronRight className="size-4 text-gray-300 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Sub-forms */}

                  {/* UPI ID input */}
                  {activeCategory === "upi" && selectedMethod === "upiid" && (
                    <div className="mt-4 pl-11">
                      <label
                        htmlFor="upi-id"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        UPI ID
                      </label>
                      <Input
                        id="upi-id"
                        type="text"
                        placeholder="name@upi"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value.toLowerCase());
                          if (upiError) setUpiError("");
                        }}
                        className={cn(
                          upiError && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                        )}
                      />
                      {upiError && (
                        <p className="text-xs text-red-500 mt-1">{upiError}</p>
                      )}
                    </div>
                  )}

                  {/* QR Code placeholder */}
                  {activeCategory === "upi" && selectedMethod === "qrcode" && (
                    <div className="mt-4 pl-11">
                      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 p-6 bg-gray-50/50">
                        <div className="size-32 rounded-xl bg-white shadow-sm border flex items-center justify-center">
                          <QrCode className="size-20 text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Scan this QR code with any UPI app to pay{" "}
                          <span className="font-semibold text-gray-900">
                            {formatINR(amount)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Add New Card form */}
                  {activeCategory === "cards" && selectedMethod === "new_card" && (
                    <div className="mt-4 pl-11 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Card Details
                      </p>

                      {/* Card Number */}
                      <div>
                        <label
                          htmlFor="card-number"
                          className="text-xs font-medium text-gray-700 mb-1 block"
                        >
                          Card Number
                        </label>
                        <div className="relative">
                          <Input
                            id="card-number"
                            type="text"
                            inputMode="numeric"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) =>
                              setCardNumber(formatCardNumber(e.target.value))
                            }
                            maxLength={19}
                            className="pr-16"
                          />
                          {cardBrand && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                              {cardBrand}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expiry + CVV */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="card-expiry"
                            className="text-xs font-medium text-gray-700 mb-1 block"
                          >
                            Expiry
                          </label>
                          <Input
                            id="card-expiry"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) =>
                              setCardExpiry(formatExpiry(e.target.value))
                            }
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="card-cvv"
                            className="text-xs font-medium text-gray-700 mb-1 block"
                          >
                            CVV
                          </label>
                          <Input
                            id="card-cvv"
                            type="password"
                            inputMode="numeric"
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) =>
                              setCardCvv(
                                e.target.value.replace(/\D/g, "").slice(0, 4)
                              )
                            }
                            maxLength={4}
                          />
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label
                          htmlFor="card-name"
                          className="text-xs font-medium text-gray-700 mb-1 block"
                        >
                          Name on Card
                        </label>
                        <Input
                          id="card-name"
                          type="text"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer - Pay Button */}
                <div className="border-t px-4 py-3 bg-white flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="size-3.5 text-gray-400" />
                    <span className="text-[11px] text-gray-400">
                      Secured by 256-bit SSL encryption
                    </span>
                  </div>
                  <Button
                    onClick={handlePay}
                    disabled={
                      !showPayButton ||
                      (activeCategory === "upi" && selectedMethod === "qrcode")
                    }
                    className="w-full h-11 text-sm font-semibold rounded-xl"
                    size="lg"
                  >
                    {formatINR(amount)}
                    {activeCategory === "emaillink"
                      ? " — Send Link"
                      : " — Pay Now"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ---- Processing View ---- */}
        {view === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
            <div className="relative">
              <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-8 text-primary animate-spin" style={{ animationDirection: "reverse" }} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                Processing Payment
              </p>
              <p className="text-sm text-gray-500">
                Please wait while we process your payment of{" "}
                <span className="font-semibold text-gray-700">
                  {formatINR(amount)}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                via {methodName}
              </p>
            </div>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: `${i * 300}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---- Success View ---- */}
        {view === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5">
            {/* Green checkmark */}
            <div className="relative">
              <div className="size-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
                <div className="size-14 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-700">
                  <Check className="size-8 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
              <p className="text-xl font-bold text-gray-900">
                Payment Successful!
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">
                  {formatINR(amount)}
                </span>{" "}
                has been paid
              </p>
            </div>

            {/* Transaction details */}
            <div className="w-full max-w-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-400">
              <div className="rounded-xl bg-gray-50 border p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono font-semibold text-gray-900 text-xs">
                    {transactionId}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-900">
                    {methodName}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge className="bg-green-100 text-green-800 border-0">
                    Confirmed
                  </Badge>
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
              <Button
                onClick={onClose}
                variant="outline"
                className="rounded-xl px-8"
                size="lg"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
