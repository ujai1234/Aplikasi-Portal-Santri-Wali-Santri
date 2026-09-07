import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden font-sans animate-in zoom-in-95 duration-200">
        {/* Header Peringatan */}
        <div className="bg-amber-50/90 p-5 flex items-center gap-3.5 border-b border-amber-200/70">
          <div className="bg-amber-100 p-2.5 rounded-xl shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sesi Login Segera Berakhir</h3>
            <p className="text-xs text-amber-900/80 mt-0.5">Batas sesi 5 menit demi privasi & keamanan.</p>
          </div>
        </div>

        {/* Konten & Countdown */}
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50/50 border-2 border-amber-300 mb-4 shadow-sm">
            <div className="flex flex-col items-center">
              <Clock className="w-4 h-4 text-amber-600 mb-0.5 animate-pulse" />
              <span className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                {formatCountdown(secondsRemaining)}
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-xs max-w-xs mx-auto mb-2 leading-relaxed">
            Tidak ada aktivitas baru. Sesi Anda akan otomatis ditutup dalam <strong>{secondsRemaining} detik</strong>.
          </p>
          <p className="text-slate-400 text-[11px] max-w-xs mx-auto mb-6">
            Klik <strong>Perpanjang Sesi</strong> untuk melanjutkan.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
            <button
              type="button"
              onClick={extendSession}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perpanjang Sesi</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50/70 px-5 py-2.5 border-t border-slate-100 text-center">
          <span className="text-[10px] text-slate-400 font-medium">
            Proteksi Akses Portal Santri Baitul Qur'an
          </span>
        </div>
      </div>
    </div>
  );
};
