import React, { useState, useEffect } from 'react';
import { User, Save, ShieldCheck } from 'lucide-react';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const FamilyProfile = () => {
  const [parentData, setParentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nik: '',
    kkNumber: '',
    phone: '',
    address: '',
    job: '',
    income: '',
    vehicle: '',
    homeOwnership: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('portal_santri_user') || '{}');

  useEffect(() => {
    if (currentUser.id) {
      fetch(`${API_URL}/api/parents/${currentUser.id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setParentData(data.data);
            setFormData({
              nik: data.data.nik || '',
              kkNumber: data.data.kkNumber || '',
              phone: data.data.phone || '',
              address: data.data.address || '',
              job: data.data.job || '',
              income: data.data.income || '',
              vehicle: data.data.vehicle || '',
              homeOwnership: data.data.homeOwnership || ''
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [currentUser.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentData?.id) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/parents/${parentData.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Profil keluarga berhasil disimpan dan tersinkronisasi');
      } else {
        alert('Gagal menyimpan profil');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bqa-card p-8 text-center text-slate-500 font-medium">
        Memuat data profil keluarga...
      </div>
    );
  }

  return (
    <div className="bqa-card p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6 border-b pb-5 border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#065f46] flex items-center justify-center border border-emerald-200">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Profil & Data Keluarga Santri</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Fasilitas Pembaruan Mandiri (Self-Service MDM) Terhubung Langsung dengan HRIS Yayasan</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              NIK (Nomor Induk Kependudukan)
            </label>
            <input 
              name="nik" 
              value={formData.nik} 
              onChange={handleChange} 
              className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400" 
              placeholder="16 digit NIK Wali Santri" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Nomor Kartu Keluarga (KK)
            </label>
            <input 
              name="kkNumber" 
              value={formData.kkNumber} 
              onChange={handleChange} 
              className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400" 
              placeholder="16 digit No KK" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Pekerjaan Utama
            </label>
            <input 
              name="job" 
              value={formData.job} 
              onChange={handleChange} 
              className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400" 
              placeholder="Misal: Pegawai Negeri, Wiraswasta, BUMN" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Rentang Penghasilan Bulanan
            </label>
            <select 
              name="income" 
              value={formData.income} 
              onChange={handleChange} 
              className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800"
            >
              <option value="">-- Pilih Penghasilan --</option>
              <option value="< 2 Juta">Kurang dari Rp 2.000.000</option>
              <option value="2 - 5 Juta">Rp 2.000.000 - Rp 5.000.000</option>
              <option value="5 - 10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
              <option value="> 10 Juta">Lebih dari Rp 10.000.000</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Kepemilikan Kendaraan
            </label>
            <select 
              name="vehicle" 
              value={formData.vehicle} 
              onChange={handleChange} 
              className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800"
            >
              <option value="">-- Pilih Kendaraan --</option>
              <option value="Tidak Ada">Tidak Ada / Jalan Kaki</option>
              <option value="Motor">Sepeda Motor</option>
              <option value="Mobil">Mobil</option>
              <option value="Motor & Mobil">Sepeda Motor & Mobil</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Status Tempat Tinggal
            </label>
            <select 
              name="homeOwnership" 
              value={formData.homeOwnership} 
              onChange={handleChange} 
              className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800"
            >
              <option value="">-- Pilih Status Rumah --</option>
              <option value="Milik Sendiri">Milik Sendiri</option>
              <option value="Sewa / Kontrak">Sewa / Kontrak</option>
              <option value="Menumpang">Menumpang</option>
              <option value="Rumah Dinas">Rumah Dinas</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Alamat Lengkap Rumah
            </label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              rows={3} 
              className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400 leading-relaxed" 
              placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten..."
            ></textarea>
          </div>
        </div>

        {/* Security / MDM Assurance Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 p-4 rounded-2xl border border-emerald-200/80 flex items-start gap-3.5">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900">Jaminan Keamanan & Integrasi MDM</h4>
            <p className="text-xs text-emerald-800 font-medium leading-relaxed mt-0.5">
              Data keluarga Anda disimpan dengan enkripsi dan disinkronkan secara real-time ke Pusat Data Induk (HRIS Admin) Yayasan Baitul Qur'an Al-Ikhwan. Anda tidak perlu mengulang pengisian data fisik.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={saving} 
            className="bg-[#065f46] hover:bg-[#047857] active:scale-95 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-300" />
            {saving ? 'Menyimpan Perubahan...' : 'Simpan Data Keluarga'}
          </button>
        </div>
      </form>
    </div>
  );
};
