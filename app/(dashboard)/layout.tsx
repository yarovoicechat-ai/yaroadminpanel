import Sidebar from "@/components/layout/Sidebar";
import IAMManager from "@/components/layout/IAMManager";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
            <IAMManager />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full p-4 pt-16 md:p-8 md:pt-8 relative">
                    <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dosti-900/20 via-slate-950/0 to-slate-950/0 z-[-1]" />
                    <ProtectedRoute>
                        {children}
                    </ProtectedRoute>
                </main>
            </div>
        </div>
    );
}
