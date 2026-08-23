'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface ModerationViolationPayload {
  violationId: string;
  userId: string;
  user?: {
    _id: string;
    userId?: number | string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
  category: string;
  source: string;
  createdAt: string;
  status: string;
}

interface ModerationSocketContextType {
  socket: Socket | null;
  unreadViolationCount: number;
  refreshUnreadCount: () => Promise<void>;
  markViolationsAsRead: () => void;
}

const ModerationSocketContext = createContext<ModerationSocketContextType>({
  socket: null,
  unreadViolationCount: 0,
  refreshUnreadCount: async () => {},
  markViolationsAsRead: () => {},
});

const getBackendUrl = () => {
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || 'http://localhost:3001';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.mithichat.live';
};

export function ModerationSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadViolationCount, setUnreadViolationCount] = useState<number>(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiClient.get<any>('/api/moderation/violations/unread-count');
      if (res.success && res.data && typeof res.data.unreadCount === 'number') {
        setUnreadViolationCount(res.data.unreadCount);
      }
    } catch (err) {
      // Ignore count fetch error if unauthenticated or not logged in yet
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('admin_token');
    if (!token) return;

    const backendUrl = getBackendUrl();
    console.log('🛡️ Connecting Admin Moderation Socket to:', backendUrl);

    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Admin Moderation Socket connected:', newSocket.id);
      newSocket.emit('joinModerationRoom');
    });

    const handleNewViolation = (payload: ModerationViolationPayload) => {
      console.log('🚨 New Moderation Violation Received:', payload);

      setUnreadViolationCount((prev) => prev + 1);

      // Trigger sonner toast alert
      toast.warning('⚠️ New Moderation Violation Detected', {
        description: `${payload.user?.name || 'A user'} attempted to share restricted contact information (${payload.category || 'RESTRICTED'}).`,
        duration: 8000,
        action: {
          label: 'View Violations',
          onClick: () => {
            if (window.location.pathname !== '/moderation/violations') {
              window.location.href = '/moderation/violations';
            }
          },
        },
      });

      // Dispatch custom window event so Violations page can update in real-time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('moderationViolation:new', { detail: payload })
        );
      }
    };

    const handleEscalation = (payload: any) => {
      console.log('🚨 Moderation Escalation Event Received:', payload);

      setUnreadViolationCount((prev) => prev + 1);

      let title = '⚠️ User Chat Temporarily Muted';
      let desc = `${payload.user?.name || 'A user'} repeatedly attempted to share restricted contact information.`;

      if (payload.action === 'ACCOUNT_REVIEW_REQUIRED') {
        title = '🚨 Account Review Required';
        desc = `${payload.user?.name || 'A user'} has repeatedly attempted to bypass contact-sharing protections and requires administrative review.`;
      } else if (payload.action === 'EXTENDED_CHAT_MUTE') {
        title = '🚨 User Chat Access Restricted';
        desc = `${payload.user?.name || 'A user'} reached the repeated violation threshold and received an extended chat restriction.`;
      }

      toast.error(title, {
        description: desc,
        duration: 10000,
        action: {
          label: 'Review User',
          onClick: () => {
            if (window.location.pathname !== '/moderation/violations') {
              window.location.href = '/moderation/violations';
            }
          },
        },
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('moderationEscalation:new', { detail: payload })
        );
      }
    };

    newSocket.on('moderationViolation:new', handleNewViolation);
    newSocket.on('moderation_violation:new', handleNewViolation);
    newSocket.on('moderationEscalation:new', handleEscalation);
    newSocket.on('moderation_escalation:new', handleEscalation);

    setSocket(newSocket);

    return () => {
      newSocket.off('moderationViolation:new', handleNewViolation);
      newSocket.off('moderation_violation:new', handleNewViolation);
      newSocket.off('moderationEscalation:new', handleEscalation);
      newSocket.off('moderation_escalation:new', handleEscalation);
      newSocket.disconnect();
    };
  }, []);

  const markViolationsAsRead = useCallback(() => {
    setUnreadViolationCount(0);
  }, []);

  return (
    <ModerationSocketContext.Provider
      value={{
        socket,
        unreadViolationCount,
        refreshUnreadCount: fetchUnreadCount,
        markViolationsAsRead,
      }}
    >
      {children}
    </ModerationSocketContext.Provider>
  );
}

export function useModerationSocket() {
  return useContext(ModerationSocketContext);
}
