'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
    title: string;
    icon?: LucideIcon;
    description?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon: Icon, description }) => {
    return (
        <div className="border-b border-white/20 pb-3 mb-5 text-left">
            <div className="flex items-center gap-2.5">
                {Icon && (
                    <div className="p-2 rounded-xl bg-white/20 border border-white/30 text-white shadow-sm">
                        <Icon size={18} />
                    </div>
                )}
                <div>
                    <h3 className="text-base font-extrabold tracking-wider text-white uppercase">{title}</h3>
                    {description && <p className="text-xs text-white/70 font-medium mt-0.5">{description}</p>}
                </div>
            </div>
        </div>
    );
};
