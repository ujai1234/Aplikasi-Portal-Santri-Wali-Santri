import React, { useState, useEffect } from 'react';
import { User, Save, ShieldCheck, Image as ImageIcon, FileText, X } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';


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
    homeOwnership: '',
    scholarshipType: '',
    ktpUrl: '',
    kkUrl: '',
    scholarshipDocUrl: ''
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
              homeOwnership: data.data.homeOwnership || '',
              scholarshipType: data.data.scholarshipType || '',
              ktpUrl: data.data.ktpUrl || '',
              kkUrl: data.data.kkUrl || '',
              scholarshipDocUrl: data.data.scholarshipDocUrl || ''
            });
          } else {
            // Parent record hasn't been created yet in parents table
            setParentData({ id: currentUser.id, isNew: true });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setParentData({ id: currentUser.id, isNew: true });
          setLoading(false);
        });
    }
  }, [currentUser.id]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'ktpUrl' | 'kkUrl' | 'scholarshipDocUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }
    setSaving(true);
    try {
      const compressedBase64 = await compressImage(file, 1200, 1200, 0.7);
      setFormData({ ...formData, [fieldName]: compressedBase64 });
    } catch (error) {
      console.error(error);
      alert('Gagal memproses gambar');
    } finally {
      setSaving(false);
    }
  };

  const removeImage = (fieldName: 'ktpUrl' | 'kkUrl' | 'scholarshipDocUrl') => {
    setFormData({ ...formData, [fieldName]: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = parentData?.id || currentUser?.id;
    if (!targetId) {
      alert('Sesi tidak terdeteksi. Silakan re-login.');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/parents/${targetId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setParentData(result.data);
        }
        alert('Profil keluarga berhasil disimpan dan tersinkronisasi');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Gagal menyimpan profil');
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

          <div className="space-y-1.5 md:col-span-2 pt-4 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
              Jenis Beasiswa / Jalur Masuk
            </label>
            <select 
              name="scholarshipType" 
              value={formData.scholarshipType} 
              onChange={handleChange} 
              className="w-full md:w-1/2 text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-slate-800"
            >
              <option value="">-- Pilih Jenis Beasiswa (Jika Ada) --</option>
              <option value="Tidak Ada">Tidak Ada (Reguler)</option>
              <option value="KIP">KIP (Kartu Indonesia Pintar)</option>
              <option value="KJP">KJP (Kartu Jakarta Pintar)</option>
              <option value="BSM">BSM (Bantuan Siswa Miskin)</option>
              <option value="Yatim/Piatu">Jalur Yatim/Piatu</option>
              <option value="Dhuafa">Jalur Dhuafa</option>
              <option value="Prestasi">Jalur Prestasi</option>
            </select>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KTP Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Foto KTP Wali
              </label>
              {!formData.ktpUrl ? (
                <label className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer min-h-[140px]">
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-[10px] text-slate-500 text-center px-2">Klik untuk unggah Foto KTP (Max: 5MB)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'ktpUrl')} />
                </label>
              ) : (
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                  <img src={formData.ktpUrl} alt="KTP" className="max-h-full max-w-full object-contain" />
                  <button type="button" onClick={() => removeImage('ktpUrl')} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-sm">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* KK Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Foto Kartu Keluarga (KK)
              </label>
              {!formData.kkUrl ? (
                <label className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer min-h-[140px]">
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-[10px] text-slate-500 text-center px-2">Klik untuk unggah Foto KK (Max: 5MB)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'kkUrl')} />
                </label>
              ) : (
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                  <img src={formData.kkUrl} alt="KK" className="max-h-full max-w-full object-contain" />
                  <button type="button" onClick={() => removeImage('kkUrl')} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-sm">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Scholarship Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Dokumen Beasiswa (KIP/KJP)
              </label>
              {!formData.scholarshipDocUrl ? (
                <label className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer min-h-[140px]">
                  <FileText className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-[10px] text-slate-500 text-center px-2">Klik untuk unggah Dokumen (Opsional)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'scholarshipDocUrl')} />
                </label>
              ) : (
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                  <img src={formData.scholarshipDocUrl} alt="Scholarship" className="max-h-full max-w-full object-contain" />
                  <button type="button" onClick={() => removeImage('scholarshipDocUrl')} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-sm">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
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
