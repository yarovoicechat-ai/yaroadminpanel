'use client';

import React, { useEffect } from 'react';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
    useEffect(() => {
        // Initialize Google Translate script if not already added
        if (!document.getElementById('google-translate-script')) {
            const addScript = document.createElement('script');
            addScript.id = 'google-translate-script';
            addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            addScript.async = true;
            document.body.appendChild(addScript);

            (window as any).googleTranslateElementInit = () => {
                new (window as any).google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                    },
                    'google_translate_element'
                );
            };
        }
    }, []);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-white/90 shadow-sm text-xs">
            <div className="flex items-center gap-2">
                <Globe size={15} className="text-pink-300 animate-spin-slow" />
                <span className="font-semibold text-white">Select Language</span>
            </div>

            <div className="flex items-center gap-3">
                <div id="google_translate_element" className="google-translate-container" />
                <span className="text-[10px] text-white/60 font-medium whitespace-nowrap">
                    Powered by Google Translate
                </span>
            </div>
        </div>
    );
};
