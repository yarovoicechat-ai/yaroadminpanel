import Sidebar from "@/components/layout/Sidebar";
import IAMManager from "@/components/layout/IAMManager";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TopHeader from "@/components/layout/TopHeader";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="app-shell flex h-screen flex-col overflow-hidden">
            <IAMManager />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopHeader />
                    <main className="app-main relative w-full flex-1 overflow-y-auto p-4 md:p-8">
                        <ProtectedRoute>
                            {children}
                        </ProtectedRoute>
                    </main>
                </div>
            </div>
        </div>
    );
}
