import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SESSION_DURATION_SECONDS = 5 * 60; // 300 detik (5 menit)
const WARNING_BEFORE_EXPIRY_SECONDS = 60; // 60 detik (1 menit)
const STORAGE_KEY = 'portal_santri_session_activity';
const USER_KEY = 'portal_santri_user';

export const SessionTimeoutManager: React.FC = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_BEFORE_EXPIRY_SECONDS);

  const lastActivityRef = useRef<number>(Date.now());
  const tickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStorageSyncRef = useRef<number>(0);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/login');
  }, [navigate]);

  const extendSession = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setShowWarning(false);
    setSecondsRemaining(WARNING_BEFORE_EXPIRY_SECONDS);

    if (now - lastStorageSyncRef.current > 5000) {
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
        lastStorageSyncRef.current = now;
      } catch {
        // Abaikan error localStorage
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = localStorage.getItem(USER_KEY);
    if (!checkAuth) {
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
      setShowWarning(false);
      return;
    }

    const storedLastActivity = Number(localStorage.getItem(STORAGE_KEY) || 0);
    const initialActivity = storedLastActivity > 0 && Date.now() - storedLastActivity < SESSION_DURATION_SECONDS * 1000
      ? storedLastActivity
      : Date.now();

    lastActivityRef.current = initialActivity;
    localStorage.setItem(STORAGE_KEY, initialActivity.toString());
    lastStorageSyncRef.current = initialActivity;

    tickerIntervalRef.current = setInterval(() => {
      const checkAuthNow = localStorage.getItem(USER_KEY);
      if (!checkAuthNow) return; // if logged out in another tab

      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const remaining = SESSION_DURATION_SECONDS - elapsedSeconds;

      if (remaining <= 0) {
        if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
        setShowWarning(false);
        logout();
      } else if (remaining <= WARNING_BEFORE_EXPIRY_SECONDS) {
        setShowWarning(true);
        setSecondsRemaining(remaining);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    const handleUserActivity = () => {
      if (!showWarning) {
        extendSession();
      }
    };

    const userActivityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    userActivityEvents.forEach((event) => window.addEventListener(event, handleUserActivity, { passive: true }));

    return () => {
      userActivityEvents.forEach((event) => window.removeEventListener(event, handleUserActivity));
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    };
  }, [logout, extendSession, showWarning]);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden font-sans animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Sesi Segera Berakhir</h3>
          
          <div className="text-3xl font-bold text-amber-600 font-mono tracking-tight mb-3">
            {formatCountdown(secondsRemaining)}
          </div>
          
          <p className="text-slate-500 text-sm mb-6">
            Sesi Anda akan ditutup otomatis karena tidak ada aktivitas.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={logout}
              className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Keluar
            </button>
            <button
              type="button"
              onClick={extendSession}
              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Perpanjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
