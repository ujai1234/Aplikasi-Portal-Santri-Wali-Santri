import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  User, RefreshCw, 
  CheckCircle2, Sparkles, Clock, 
  ChevronRight, LogOut, UploadCloud, Check
} from 'lucide-react';
import { FamilyProfile } from './components/FamilyProfile';
import { BrandLogo } from './components/BrandLogo';
import { SessionTimeoutManager } from './components/SessionTimeoutManager';
import { authClient } from './lib/auth-client';


// API URL: configured via VITE_API_URL env var at build time
// In production: set VITE_API_URL=https://hris.baitulquranalikhwan.cloud
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('walidemo@bqa.local');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password
      });
      
      if (error) {
        alert(error.message || 'Login gagal. Periksa kembali email dan password.');
        setIsLoading(false);
      } else if (data.token && data.user) {
        try {
          const studentRes = await fetch(`${API_URL}/api/parents/${data.user.id}/students`, { credentials: 'include' });
          const studentData = await studentRes.json();
          
          if (studentData?.data && Array.isArray(studentData.data) && studentData.data.length > 0) {
            const userWithStudents = { ...data.user, students: studentData.data }; 
            localStorage.setItem('portal_santri_user', JSON.stringify(userWithStudents));
            navigate('/dashboard');
          } else {
            // No student linked yet
            localStorage.setItem('portal_santri_user', JSON.stringify({ ...data.user, students: [] }));
            navigate('/link-student');
          }
        } catch (fetchErr) {
          console.error(fetchErr);
          alert('Terjadi kesalahan saat memuat data santri.');
          setIsLoading(false);
        }
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard'
      });
      // Do not set isGoogleLoading to false here immediately, because it redirects
    } catch (error) {
      alert('Gagal login menggunakan Google.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-amber-500/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 animate-fade-up z-10 relative">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 relative group">
            <BrandLogo size="lg" className="transition-transform duration-300 hover:scale-105 filter drop-shadow-xl" />
          </div>
          <p className="font-arabic text-emerald-800 text-lg font-bold tracking-wide mb-1">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            Portal Santri & Wali
          </h2>
          <p className="mt-1 text-xs font-semibold text-amber-800 uppercase tracking-widest bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200">
            Baitul Qur'an Al-Ikhwan
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-islamic rounded-3xl border border-slate-200/80 border-t-4 border-t-[#d97706] border-l-4 border-l-[#d97706]">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Wali Santri
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-[#065f46] to-[#047857] hover:from-[#044e3a] hover:to-[#065f46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk Ke Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 mb-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Atau</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            type="button"
            className="w-full flex justify-center items-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
                <span>Menghubungkan ke Google...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Demo Wali: <span className="font-semibold text-emerald-800">walidemo@bqa.local</span> (Password: <span className="font-semibold text-slate-700">password123</span>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceWidget({ studentId }: { studentId: string }) {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/students/${studentId}/attendances`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setAttendances(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) {
    return (
      <div className="bqa-card p-6 text-center">
        <RefreshCw className="animate-spin w-6 h-6 mx-auto text-emerald-600 mb-2" />
        <p className="text-xs text-slate-500">Memuat rekap kehadiran...</p>
      </div>
    );
  }

  const total = attendances.length || 1;
  const hadir = attendances.filter(a => a.status === 'HADIR').length;
  const sakit = attendances.filter(a => a.status === 'SAKIT').length;
  const izin = attendances.filter(a => a.status === 'IZIN').length;
  const alpa = attendances.filter(a => a.status === 'ALPA').length;
  const attendanceRate = attendances.length > 0 ? Math.round((hadir / total) * 100) : 100;

  return (
    <div className="bqa-card p-6">
      <div className="mb-5 pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Rekap Kehadiran</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Bulan Ini • Tingkat Kehadiran: <span className="font-bold text-emerald-700">{attendanceRate}%</span></p>
      </div>

      {/* Modern Progress Bar */}
      <div className="mb-5 bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
        <div style={{ width: `${(hadir / total) * 100}%` }} className="bg-emerald-500 h-full transition-all" title={`Hadir: ${hadir}`} />
        <div style={{ width: `${(sakit / total) * 100}%` }} className="bg-amber-400 h-full transition-all" title={`Sakit: ${sakit}`} />
        <div style={{ width: `${(izin / total) * 100}%` }} className="bg-blue-400 h-full transition-all" title={`Izin: ${izin}`} />
        <div style={{ width: `${(alpa / total) * 100}%` }} className="bg-rose-500 h-full transition-all" title={`Alpa: ${alpa}`} />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="flex flex-col items-center bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
          <span className="text-2xl font-extrabold text-emerald-700">{hadir}</span>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">Hadir</span>
        </div>
        <div className="flex flex-col items-center bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
          <span className="text-2xl font-extrabold text-amber-600">{sakit}</span>
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mt-0.5">Sakit</span>
        </div>
        <div className="flex flex-col items-center bg-blue-50/60 p-3 rounded-xl border border-blue-200/60">
          <span className="text-2xl font-extrabold text-blue-600">{izin}</span>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mt-0.5">Izin</span>
        </div>
        <div className="flex flex-col items-center bg-rose-50/60 p-3 rounded-xl border border-rose-200/60">
          <span className="text-2xl font-extrabold text-rose-600">{alpa}</span>
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider mt-0.5">Alpa</span>
        </div>
      </div>

      {attendances.length > 0 ? (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Aktivitas Presensi Terakhir</p>
          <div className="space-y-2.5">
            {attendances.slice(0, 3).map((att) => (
              <div key={att.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-slate-800">{att.journal?.topic || 'Sesi Pembelajaran Tahfidz'}</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  att.status === 'HADIR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  att.status === 'SAKIT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  att.status === 'IZIN' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-xs italic">
          Belum ada rekapan presensi untuk bulan berjalan.
        </div>
      )}
    </div>
  );
}

function FinanceWidget({ studentId }: { studentId: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const studentPayments = (data.data || []).filter((p: any) => p.studentId === studentId);
        setPayments(studentPayments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [studentId]);

  const handleUploadClick = (payId: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64String = reader.result;
            const res = await fetch(`${API_URL}/api/students/${studentId}/payments/${payId}/upload`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ receiptUrl: base64String })
            });
            if (res.ok) {
              alert(`Bukti transfer ${file.name} berhasil diunggah.`);
              fetchPayments();
            } else {
              alert('Gagal mengunggah bukti');
            }
          } catch (error) {
            alert('Kesalahan jaringan');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  if (loading) {
    return (
      <div className="bqa-card p-6 text-center">
        <RefreshCw className="animate-spin w-6 h-6 mx-auto text-emerald-600 mb-2" />
        <p className="text-xs text-slate-500">Memuat data keuangan...</p>
      </div>
    );
  }

  return (
    <div className="bqa-card p-6">
      <div className="mb-5 pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Informasi Keuangan</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Tagihan SPP & Syahriah Bulanan</p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
          <p className="text-xs text-slate-500 italic">Tidak ada kewajiban tagihan aktif saat ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((pay) => (
            <div key={pay.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 transition-all hover:bg-slate-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Bulan Tagihan</span>
                  <p className="text-sm font-bold text-slate-900">SPP Periode {pay.billingMonth}</p>
                  <p className="text-lg font-extrabold text-emerald-800 mt-0.5">
                    Rp {pay.amount.toLocaleString('id-ID')}
                  </p>
                </div>
                {pay.status === 'LUNAS' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" /> LUNAS
                  </span>
                ) : pay.status === 'MENUNGGU VERIFIKASI' ? (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3 animate-spin" /> PROSES VERIFIKASI
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    BELUM BAYAR
                  </span>
                )}
              </div>

              {pay.status !== 'LUNAS' && pay.status !== 'MENUNGGU VERIFIKASI' && (
                <button 
                  onClick={() => handleUploadClick(pay.id)}
                  className="mt-3 w-full text-xs bg-[#065f46] hover:bg-[#047857] text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Bukti Pembayaran
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TahfidzWidget({ studentId }: { studentId: string }) {
  const [tahfidz, setTahfidz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/tahfidz/student-progress/${studentId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setTahfidz(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) {
    return (
      <div className="bqa-card p-6 text-center">
        <RefreshCw className="animate-spin w-6 h-6 mx-auto text-emerald-600 mb-2" />
        <p className="text-xs text-slate-500">Memuat capaian tahfidz...</p>
      </div>
    );
  }

  const juzCompleted = tahfidz?.juzCompleted || 0;
  const progressPercent = Math.round((juzCompleted / 30) * 100);

  return (
    <div className="bqa-card p-6">
      <div className="mb-5 pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Hafalan & Tahfidz Al-Qur'an</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Progres & Hasil Ujian Tasmi'</p>
      </div>

      {tahfidz ? (
        <div className="space-y-5">
          {/* Capaian Juz Highlight */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-amber-50/50 p-4 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Capaian Juz Al-Qur'an
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#065f46] tracking-tight">{juzCompleted}</span>
                <span className="text-sm font-semibold text-slate-600">/ 30 Juz ({progressPercent}%)</span>
              </div>
            </div>

            {tahfidz.lastTasmi && (
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#d97706] font-bold text-xl flex items-center justify-center border border-amber-200">
                  {tahfidz.lastTasmi.score}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ujian Tasmi'</span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {tahfidz.lastTasmi.predicate || 'Mumtaz'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Visual Juz Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span>Target 30 Juz</span>
              <span>{juzCompleted} Juz Terlampaui</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div 
                className="bg-gradient-to-r from-[#065f46] to-[#047857] h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Setoran Terakhir Detail */}
          {tahfidz.lastEvaluation && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706]" /> Setoran Terakhir
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {new Date(tahfidz.lastEvaluation.date).toLocaleDateString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  tahfidz.lastEvaluation.status === 'Tuntas' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  ✓ {tahfidz.lastEvaluation.status}
                </span>
                <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {tahfidz.lastEvaluation.session}
                </span>
              </div>

              {tahfidz.lastEvaluation.notes && (
                <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/60 mt-2 font-medium leading-relaxed">
                  "{tahfidz.lastEvaluation.notes}"
                </p>
              )}

              <p className="text-[11px] text-slate-500 mt-2.5 text-right font-medium">
                Disimak oleh: <span className="font-bold text-emerald-800">{tahfidz.lastEvaluation.teacherName}</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs italic">
          Belum ada catatan progres tahfidz terkini.
        </div>
      )}
    </div>
  );
}

function AcademicsWidget({ studentId }: { studentId: string }) {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/students/${studentId}/academics`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.grades) {
          setGrades(data.grades);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) {
    return (
      <div className="bqa-card p-6 text-center">
        <RefreshCw className="animate-spin w-6 h-6 mx-auto text-emerald-600 mb-2" />
        <p className="text-xs text-slate-500">Memuat rapor mini...</p>
      </div>
    );
  }

  return (
    <div className="bqa-card p-6">
      <div className="mb-5 pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Rapor Mini & Evaluasi Tugas</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Capaian Pembelajaran Akademik</p>
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs italic">
          Belum ada nilai evaluasi atau tugas yang diinput.
        </div>
      ) : (
        <div className="space-y-3">
          {grades.map((g) => (
            <div key={g.id} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                  Materi / Tugas
                </span>
                <p className="text-xs font-bold text-slate-800">{g.assignment?.title}</p>
                {g.feedback && (
                  <p className="text-xs text-slate-500 italic">"{g.feedback}"</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xl font-extrabold px-2.5 py-1 rounded-xl inline-block ${
                  g.score >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  g.score >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {g.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommunicationBookWidget({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/students/${studentId}/notes`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setNotes(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) {
    return (
      <div className="bqa-card p-6 text-center">
        <RefreshCw className="animate-spin w-6 h-6 mx-auto text-emerald-600 mb-2" />
        <p className="text-xs text-slate-500">Memuat catatan guru...</p>
      </div>
    );
  }

  return (
    <div className="bqa-card p-6">
      <div className="mb-5 pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Buku Penghubung & Catatan</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Informasi & Evaluasi dari Muallim</p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs italic">
          Belum ada catatan khusus dari guru/muallim.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  note.type === 'KEDISIPLINAN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  note.type === 'PRESTASI' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {note.type}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(note.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
                {note.note}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'PROFILE'>('HOME');
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem('portal_santri_user');
    if (!data) {
      navigate('/login');
    } else {
      setUser(JSON.parse(data));
    }
  }, [navigate]);

  if (!user) return null;

  const studentsList = user.students || [];
  const activeStudent = studentsList[activeStudentIndex] || { id: 'STR-001', name: 'Data Tidak Ditemukan' };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <SessionTimeoutManager />
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" />
              <div>
                <span className="font-display font-extrabold text-base text-slate-900 tracking-tight block leading-tight">
                  Portal Santri & Wali
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-widest block">
                  Baitul Qur'an Al-Ikhwan
                </span>
              </div>
            </div>

            {/* Navigation & User Action */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1 sm:gap-3 border-r border-slate-200 pr-3 sm:pr-6">
                <button 
                  onClick={() => setActiveTab('HOME')} 
                  className={`text-xs font-bold transition-all py-2 px-3 rounded-xl cursor-pointer ${
                    activeTab === 'HOME' 
                      ? 'bg-emerald-50 text-[#065f46] border border-emerald-200 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Beranda
                </button>
                <button 
                  onClick={() => setActiveTab('PROFILE')} 
                  className={`text-xs font-bold transition-all py-2 px-3 rounded-xl cursor-pointer ${
                    activeTab === 'PROFILE' 
                      ? 'bg-emerald-50 text-[#065f46] border border-emerald-200 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Profil Keluarga
                </button>
              </div>
              
              <div className="hidden md:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  {user.name ? user.name.charAt(0) : 'W'}
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wali Santri</span>
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('portal_santri_user');
                  navigate('/login');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white px-3 py-2 rounded-xl transition-all border border-rose-200 cursor-pointer"
                title="Keluar dari akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-up">
        {/* Salam & Santri Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white rounded-3xl shadow-md p-6 sm:p-8 mb-8 relative overflow-hidden">
          {/* SVG Geometric Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.4'%3E%3Cpath d='M32 4l8 20 20 8-20 8-8 20-8-20-20-8 20-8z'/%3E%3Ccircle cx='32' cy='32' r='6'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <User className="w-8 h-8 text-emerald-100" />
              </div>
              <div>
                <p className="font-arabic text-amber-300 text-sm font-medium tracking-wide mb-1">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                
                {studentsList.length > 1 ? (
                  <div className="mb-2">
                    <select
                      value={activeStudentIndex}
                      onChange={(e) => setActiveStudentIndex(Number(e.target.value))}
                      className="bg-emerald-900/50 border border-emerald-600 text-white text-lg font-display font-extrabold rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-300 focus:outline-none appearance-none cursor-pointer pr-10 hover:bg-emerald-800 transition-colors"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25em' }}
                    >
                      {studentsList.map((s: any, idx: number) => (
                        <option key={s.id} value={idx} className="bg-emerald-900 text-white">{s.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
                    {activeStudent.name}
                  </h1>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="bg-black/25 text-amber-200 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                    ID Santri: {activeStudent.nis || activeStudent.id}
                  </span>
                  <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                    Kelas {activeStudent.className || '-'}
                  </span>
                  <span className="bg-emerald-400/20 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
                    {activeStudent.gender === 'L' ? '(Ikhwan)' : activeStudent.gender === 'P' ? '(Akhwat)' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Summary Pill in Banner */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 self-start md:self-auto">
              <div className="text-center px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Status Santri</span>
                <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wide">AKTIF</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Tahun Ajaran</span>
                <span className="text-xs font-bold text-white">2026 / 2027</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic View Tab */}
        {activeTab === 'HOME' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="md:col-span-2">
              <TahfidzWidget studentId={activeStudent.id} />
            </div>
            
            <FinanceWidget studentId={activeStudent.id} />
            
            <AttendanceWidget studentId={activeStudent.id} />

            <div className="md:col-span-2">
              <AcademicsWidget studentId={activeStudent.id} />
            </div>
            
            <div className="md:col-span-2">
              <CommunicationBookWidget studentId={activeStudent.id} />
            </div>
          </div>
        ) : (
          <FamilyProfile />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 Baitul Qur'an Al-Ikhwan. Seluruh hak cipta dilindungi undang-undang.</p>
        <p className="mt-1 text-[11px] text-slate-400">Integrated HRIS & Portal Santri System</p>
      </footer>
    </div>
  );
}

function LinkStudent() {
  const navigate = useNavigate();
  const [nis, setNis] = useState('');
  const [kkNumber, setKkNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('portal_santri_user');
    if (!data) {
      navigate('/login');
    } else {
      setUser(JSON.parse(data));
    }
  }, [navigate]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/portal/link-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          nis,
          kkNumber
        })
      });
      
      const responseData = await res.json();
      
      if (res.ok && responseData.success) {
        // Fetch the newly linked students array
        const studentRes = await fetch(`${API_URL}/api/parents/${user.id}/students`, { credentials: 'include' });
        const studentData = await studentRes.json();
        const studentsList = (studentData?.data && Array.isArray(studentData.data)) ? studentData.data : [];
        
        const userWithStudents = { ...user, students: studentsList };
        localStorage.setItem('portal_santri_user', JSON.stringify(userWithStudents));
        
        alert(responseData.message || 'Berhasil menghubungkan akun dengan data santri.');
        navigate('/dashboard');
      } else {
        alert(responseData.error || 'Gagal menghubungkan data santri. Mohon periksa kembali NIS dan No KK.');
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-amber-500/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 animate-fade-up z-10 relative">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 relative group">
            <BrandLogo size="lg" className="transition-transform duration-300 hover:scale-105 filter drop-shadow-xl" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            Hubungkan Data Santri
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Demi keamanan, mohon masukkan NIS dan Nomor Kartu Keluarga untuk menghubungkan akun Anda.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-islamic rounded-3xl border border-slate-200/80 border-t-4 border-t-emerald-600">
          <form className="space-y-5" onSubmit={handleLink}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nomor Induk Santri (NIS)
              </label>
              <input
                type="text"
                required
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 2026001"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nomor Kartu Keluarga (No. KK)
              </label>
              <input
                type="text"
                required
                value={kkNumber}
                onChange={(e) => setKkNumber(e.target.value)}
                placeholder="16 Digit Nomor KK"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-sm text-slate-800 placeholder-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memvalidasi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hubungkan Data</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/link-student" element={<LinkStudent />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

