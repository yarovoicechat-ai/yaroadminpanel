'use client';

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function IAMManager() {
  const { user } = useAuth();
  const [simUserId, setSimUserId] = useState<string | null>(null);
  const [simUserName, setSimUserName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSimUserId(localStorage.getItem('sim_user_id'));
      setSimUserName(localStorage.getItem('sim_user_name'));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.mithichat.live';
    const socket = io(socketUrl, {
      auth: {
        token: localStorage.getItem('admin_token')
      },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('✅ Connected to IAM Realtime Sync Engine');
    });

    socket.on('permissionsUpdated', (data: any) => {
      if (data.targetType === 'user' && data.targetId === user.id) {
        toast.info('🛡️ Your account permissions have been updated in real-time.', { duration: 5000 });
        setTimeout(() => window.location.reload(), 1500);
      }
    });

    socket.on('rolePermissionsUpdated', (data: any) => {
      if (data.role === user.role) {
        toast.info(`🛡️ Permissions for role '${user.role.toUpperCase()}' have been updated in real-time.`, { duration: 5000 });
        setTimeout(() => window.location.reload(), 1500);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleStopSimulation = () => {
    localStorage.removeItem('sim_user_id');
    localStorage.removeItem('sim_user_name');
    toast.success('Simulation mode deactivated.');
    setTimeout(() => window.location.reload(), 1000);
  };

  if (!simUserId) return null;

  return (
    <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-between shadow-2xl relative z-50">
      <div className="flex items-center gap-2">
        <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">Simulation Mode</span>
        <span>Viewing console as: <strong>{simUserName || simUserId}</strong>. Destructive actions are write-protected.</span>
      </div>
      <button
        onClick={handleStopSimulation}
        className="bg-white text-indigo-900 px-3 py-1 rounded hover:bg-slate-100 transition-colors font-black uppercase text-[10px]"
      >
        ✕ Stop Preview
      </button>
    </div>
  );
}
