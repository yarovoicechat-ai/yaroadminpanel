'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Diamond,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  QrCode,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SellerBuyStockPage() {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(2);
  const [purchasing, setPurchasing] = useState(false);

  const plans = [
    { price: '₹95', diamonds: 1670, worth: '₹100 Value', discount: '5% OFF' },
    { price: '₹475', diamonds: 8350, worth: '₹500 Value', discount: '5% OFF' },
    { price: '₹950', diamonds: 16700, worth: '₹1,000 Value', discount: '5% OFF', popular: true },
    { price: '₹4,750', diamonds: 83500, worth: '₹5,000 Value', discount: '5% OFF' },
    { price: '₹9,500', diamonds: 167000, worth: '₹10,000 Value', discount: '5% OFF', popular: true },
    { price: '₹47,500', diamonds: 835000, worth: '₹50,000 Value', discount: '5% OFF' },
    { price: '₹95,000', diamonds: 1670000, worth: '₹1,00,000 Value', discount: '5% OFF' },
  ];

  const handleOrder = () => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      toast.success('Stock order generated! Please complete payment via UPI/Bank.');
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Purchase Diamond Stock</h1>
            <p className="text-xs text-slate-400">
              Buy wholesale diamonds with guaranteed seller discount margins for reselling.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {plans.map((p, idx) => {
            const isSelected = selectedPlanIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPlanIndex(idx)}
                className={`p-5 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    POPULAR
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">{p.discount}</span>
                    <span className="text-[10px] text-slate-400 line-through">{p.worth}</span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">{p.price}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                    <Diamond size={15} />
                    <span>{p.diamonds.toLocaleString()} 💎</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Instant credit</span>
                  <span className={`font-semibold ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                    {isSelected ? '✓ Selected' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Selected Stock Order</span>
            <div className="text-sm font-bold text-white mt-0.5">
              {plans[selectedPlanIndex].diamonds.toLocaleString()} Diamonds for {plans[selectedPlanIndex].price}
            </div>
          </div>
          <button
            onClick={handleOrder}
            disabled={purchasing}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
          >
            {purchasing ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
