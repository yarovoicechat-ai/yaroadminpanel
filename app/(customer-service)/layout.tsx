'use client';

import Sidebar from '@/components/layout/Sidebar';

export default function CustomerServiceLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto w-full p-4 pt-16 md:p-8 md:pt-8 relative">
                {children}
            </main>
        </div>
    );
}
