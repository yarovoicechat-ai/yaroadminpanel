'use client';

import React from 'react';

interface FormInputProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'url';
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    required?: boolean;
    error?: string;
    options?: Array<{ value: string; label: string }>;
    rows?: number;
    ariaLabel?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    error,
    options = [],
    rows = 3,
    ariaLabel,
}) => {
    const inputId = `input-${name}`;

    return (
        <div className="space-y-1.5 text-left">
            <label htmlFor={inputId} className="block text-xs font-semibold text-white/90">
                {label} {required && <span className="text-pink-400 font-bold">*</span>}
            </label>

            {type === 'select' ? (
                <select
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    aria-label={ariaLabel || label}
                    aria-required={required}
                    aria-invalid={Boolean(error)}
                    className={`w-full bg-white/20 border text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                        error
                            ? 'border-pink-400 focus:ring-pink-400'
                            : 'border-white/30 focus:ring-pink-400 hover:border-white/50'
                    }`}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    id={inputId}
                    name={name}
                    rows={rows}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    aria-label={ariaLabel || label}
                    aria-required={required}
                    aria-invalid={Boolean(error)}
                    className={`w-full bg-white/20 border text-white placeholder-white/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        error
                            ? 'border-pink-400 focus:ring-pink-400'
                            : 'border-white/30 focus:ring-pink-400 hover:border-white/50'
                    }`}
                />
            ) : (
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    aria-label={ariaLabel || label}
                    aria-required={required}
                    aria-invalid={Boolean(error)}
                    className={`w-full bg-white/20 border text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                        error
                            ? 'border-pink-400 focus:ring-pink-400'
                            : 'border-white/30 focus:ring-pink-400 hover:border-white/50'
                    }`}
                />
            )}

            {error && <p className="text-pink-300 text-xs font-semibold mt-1 animate-pulse">{error}</p>}
        </div>
    );
};
