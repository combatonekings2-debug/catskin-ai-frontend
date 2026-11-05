import { useState, useEffect } from 'react';
import {
  Sliders, Save, RefreshCw, CheckCircle2, AlertCircle, Building2,
  Mail, Phone, MapPin, Globe, Share2, BookOpen, Heart, Eye, Sparkles, ExternalLink
} from 'lucide-react';
import { settingsApi } from '../api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    site_name: 'CatSkin AI',
    footer_description: 'Sistem diagnosa penyakit kulit kucing berbasis AI dengan CNN untuk hasil yang akurat dan terpercaya.',
    contact: {
      address: 'Jl. Teknologi No. 123, Kota Digital, Indonesia 40123',
      phone: '+62 812-3456-7890',
      email: 'support@catskin.ai'
    },
    social_links: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com'
    },
    education_menu: {
      title: 'Edukasi Kucing'
    },
    copyright_text: '© 2026 CatSkin AI. All rights reserved.',
    credit_text: 'Dibuat dengan ❤️ untuk kesehatan kucing kesayangan Anda.'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsApi.get();
      if (data) {
        setFormData(prev => ({
          ...prev,
          ...data,
          contact: { ...prev.contact, ...(data.contact || {}) },
          social_links: { ...prev.social_links, ...(data.social_links || {}) },
          education_menu: { ...prev.education_menu, ...(data.education_menu || {}) }
        }));
      }
    } catch (err) {
      showToast('Gagal memuat pengaturan: ' + (err.message || 'Error server'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsApi.update(formData);
      if (res?.success) {
        showToast('Pengaturan website & footer berhasil diperbarui secara permanen!');
      } else {
        showToast('Berhasil disimpan!');
      }
    } catch (err) {
      showToast('Gagal menyimpan: ' + (err.message || 'Terjadi kesalahan'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Memuat konfigurasi website...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border ${
          toast.type === 'error'
            ? 'bg-rose-950/90 border-rose-700/60 text-rose-200'
            : 'bg-emerald-950/90 border-emerald-700/60 text-emerald-200'
        } transition-all transform animate-in slide-in-from-bottom-5`}>
          {toast.type === 'error' ? <AlertCircle size={20} className="text-rose-400 shrink-0" /> : <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Website & Footer</h1>
              <p className="text-slate-400 text-xs sm:text-sm">Kelola informasi publik, kontak klinik/admin, tautan media sosial, dan konten footer</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw size={14} className={saving ? 'animate-spin' : ''} />
            Reset Data
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ExternalLink size={14} />
            Buka Website Publik
          </a>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kartu 1: Identitas & Deskripsi Footer */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Identitas & Deskripsi Brand</h3>
                  <p className="text-slate-400 text-xs">Informasi utama di kolom 1 footer website</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama Sistem / Website
                  </label>
                  <input
                    type="text"
                    value={formData.site_name}
                    onChange={(e) => handleChange(null, 'site_name', e.target.value)}
                    placeholder="CatSkin AI"
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Deskripsi Singkat (Kolom Kiri Footer)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.footer_description}
                    onChange={(e) => handleChange(null, 'footer_description', e.target.value)}
                    placeholder="Sistem diagnosa penyakit kulit kucing berbasis AI..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors resize-none leading-relaxed"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Teks ini menjelaskan fungsi utama website CatSkin AI kepada pemilik kucing di bagian bawah halaman.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Judul Kolom Edukasi (Kolom 3)
                  </label>
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={formData.education_menu?.title || 'Edukasi Kucing'}
                      onChange={(e) => handleChange('education_menu', 'title', e.target.value)}
                      placeholder="Edukasi Kucing"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Judul kolom navigasi edukasi pemilik kucing (misal: "Edukasi Kucing" atau "Panduan Pemilik").
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kartu 2: Kontak Kami */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Phone size={16} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Informasi Kontak Kami (Kolom 4)</h3>
                  <p className="text-slate-400 text-xs">Alamat klinik, kontak darurat, dan email resmi</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Alamat Lengkap / Lokasi Operasional
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    <textarea
                      rows={2}
                      value={formData.contact?.address || ''}
                      onChange={(e) => handleChange('contact', 'address', e.target.value)}
                      placeholder="Jl. Teknologi No. 123, Kota Digital..."
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nomor WhatsApp / Hotline Telepon
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={formData.contact?.phone || ''}
                      onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                      placeholder="+62 812-3456-7890"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Alamat Email Dukungan
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={formData.contact?.email || ''}
                      onChange={(e) => handleChange('contact', 'email', e.target.value)}
                      placeholder="support@catskin.ai"
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kartu 3: Media Sosial */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Share2 size={16} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Tautan Media Sosial</h3>
                <p className="text-slate-400 text-xs">Ikon sosmed di bawah deskripsi website</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={formData.social_links?.facebook || ''}
                  onChange={(e) => handleChange('social_links', 'facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-violet-500 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Twitter / X URL
                </label>
                <input
                  type="url"
                  value={formData.social_links?.twitter || ''}
                  onChange={(e) => handleChange('social_links', 'twitter', e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-violet-500 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={formData.social_links?.instagram || ''}
                  onChange={(e) => handleChange('social_links', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-violet-500 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={formData.social_links?.youtube || ''}
                  onChange={(e) => handleChange('social_links', 'youtube', e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-violet-500 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Kartu 4: Catatan Hak Cipta & Kredit */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Heart size={16} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Catatan Hak Cipta & Footer Bottom</h3>
                <p className="text-slate-400 text-xs">Teks baris paling bawah pada halaman web</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Teks Hak Cipta (Kiri Bawah)
                </label>
                <input
                  type="text"
                  value={formData.copyright_text || ''}
                  onChange={(e) => handleChange(null, 'copyright_text', e.target.value)}
                  placeholder="© 2026 CatSkin AI. All rights reserved."
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Teks Kredit / Motto (Kanan Bawah)
                </label>
                <input
                  type="text"
                  value={formData.credit_text || ''}
                  onChange={(e) => handleChange(null, 'credit_text', e.target.value)}
                  placeholder="Dibuat dengan ❤️ untuk kesehatan kucing kesayangan Anda."
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Bagian Footer */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400">
              <Eye size={18} />
              <h3 className="text-white font-bold text-sm">Pratinjau Footer Website Secara Langsung (Live Preview)</h3>
            </div>
            <span className="text-[11px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-medium">
              Realtime Preview
            </span>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800/80 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
              {/* Kolom 1 */}
              <div>
                <div className="font-bold text-base text-white mb-2 flex items-center gap-1.5">
                  <span>{formData.site_name || 'CatSkin AI'}</span>
                </div>
                <p className="text-slate-400 leading-relaxed mb-4 text-[11px]">
                  {formData.footer_description || 'Deskripsi website...'}
                </p>
                <div className="flex gap-2 text-slate-400">
                  <span className="px-2 py-1 bg-slate-800 rounded-lg text-[10px]">Facebook</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-lg text-[10px]">Twitter</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-lg text-[10px]">Instagram</span>
                </div>
              </div>

              {/* Kolom 2 */}
              <div>
                <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider text-slate-300">Menu Cepat</h4>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li>• Beranda</li>
                  <li>• Fitur</li>
                  <li>• Cara Kerja</li>
                  <li>• Demo Diagnosa</li>
                  <li>• 5 Jenis Penyakit</li>
                  <li>• Rekomendasi Obat</li>
                </ul>
              </div>

              {/* Kolom 3 */}
              <div>
                <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider text-blue-400">
                  {formData.education_menu?.title || 'Edukasi Kucing'}
                </h4>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li className="text-blue-300">• Tips Foto Kulit Akurat (Modal)</li>
                  <li className="text-slate-400">• Pertolongan Pertama Gatal (#medicine)</li>
                  <li className="text-slate-400">• Mengenal 5 Penyakit Kulit (#diseases)</li>
                  <li className="text-rose-300">• Kapan Harus ke Klinik (Modal Red Flags)</li>
                  <li className="text-indigo-300">• FAQ Diagnosa AI (Modal Q&A)</li>
                </ul>
              </div>

              {/* Kolom 4 */}
              <div>
                <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider text-slate-300">Kontak Kami</h4>
                <div className="space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-start gap-1.5">
                    <MapPin size={13} className="text-blue-400 shrink-0 mt-0.5" />
                    <span>{formData.contact?.address || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-400 shrink-0" />
                    <span>{formData.contact?.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={13} className="text-amber-400 shrink-0" />
                    <span>{formData.contact?.email || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
              <span>{formData.copyright_text}</span>
              <span>{formData.credit_text}</span>
            </div>
          </div>
        </div>

        {/* Action Button Bawah */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            Batalkan Perubahan
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
