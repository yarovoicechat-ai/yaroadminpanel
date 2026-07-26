'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline';
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    type = 'button',
    variant = 'primary',
    onClick,
    disabled = false,
    loading = false,
    children,
    className = '',
}) => {
    const baseStyle =
        'font-bold px-8 py-2.5 rounded-full text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary:
            'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30',
        secondary: 'bg-white hover:bg-slate-100 text-slate-900 shadow-md',
        outline: 'border border-white/40 hover:bg-white/10 text-white',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {loading && <Loader2 size={16} className="animate-spin text-white" />}
            {children}
        </button>
    );
};
