'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ModerationSocketProvider } from '@/components/providers/ModerationSocketProvider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
    console.log("Providers mounting");
    return (
        <AuthProvider>
            <ModerationSocketProvider>
                {children}
                <Toaster richColors position="top-right" theme="dark" />
            </ModerationSocketProvider>
        </AuthProvider>
    );
}
