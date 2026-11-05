import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Database, BrainCircuit, HardDrive,
  ClipboardList, ChevronLeft, ChevronRight, Cat, ExternalLink, Menu, X,
  ShieldCheck, Activity, Cpu, Sparkles, Upload, AlertTriangle, CheckCircle2,
  Image as ImageIcon, Zap, Clock, Sliders
} from 'lucide-react';
import { statsApi, diagnosisApi } from './api';

const NAV = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard',         badge: null },
  { to: '/admin/dataset',   icon: Database,        label: 'Dataset Manager',   badge: null },
  { to: '/admin/training',  icon: BrainCircuit,    label: 'Training Studio',   badge: 'AI Lab' },
  { to: '/admin/models',    icon: HardDrive,       label: 'Model Management',  badge: null },
  { to: '/admin/diagnosis', icon: ClipboardList,   label: 'Riwayat Diagnosis', badge: null },
  { to: '/admin/settings',  icon: Sliders,         label: 'Pengaturan Website', badge: 'Footer' },
];

function AdminTesterModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  if (!isOpen) return null;

  const handleSelectFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleRunDiagnosis = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await diagnosisApi.testDiagnose(file);
      setResult(res);
    } catch (e) {
      setError(e.message || 'Gagal menjalankan diagnosa uji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Model Diagnostic Sandbox</h3>
              <p className="text-slate-400 text-xs">Uji performa inferensi bobot model aktif secara real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Dropzone & Preview */}
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/60 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={e => handleSelectFile(e.target.files?.[0])}
            />
            <ImageIcon className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-80 group-hover:scale-110 transition-transform" />
            <p className="text-white font-bold text-sm">Pilih atau Seret Foto Pasien di Sini</p>
            <p className="text-slate-400 text-xs mt-1">Uji model CNN dengan foto kulit kucing ataupun foto non-kucing untuk menguji OOD Filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                <img src={preview} alt="Uji Pasien" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-xs truncate">{file?.name}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{(file?.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                  className="mt-2 text-xs text-indigo-400 hover:underline"
                >
                  Ganti Foto Lain
                </button>
              </div>
              {!result && (
                <button
                  onClick={handleRunDiagnosis}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <Zap size={14} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? 'Menganalisis...' : 'Jalankan Diagnosa'}</span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Result Analysis */}
            {result && (
              <div className="space-y-4 animate-in fade-in">
                {/* Out of Domain / Non-Cat Guard Result */}
                {result.is_valid_cat_skin === false ? (
                  <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <AlertTriangle size={18} />
                      <span>Validasi Non-Kucing (OOD Guard Aktif)</span>
                    </div>
                    <p className="text-amber-200/90 text-xs mt-1.5 leading-relaxed">
                      {result.message}
                    </p>
                    <div className="mt-3 p-2.5 bg-black/40 rounded-xl text-[11px] text-amber-300 font-mono">
                      Status: Filter AI berhasil memblokir citra non-kucing agar tidak salah didiagnosa.
                    </div>
                  </div>
                ) : result.data ? (
                  <div className="space-y-3">
                    {/* Primary Prediction */}
                    <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Hasil Klasifikasi AI</span>
                        <h4 className="text-white font-extrabold text-xl mt-0.5">{result.data.disease}</h4>
                        <p className="text-slate-400 text-xs">{result.data.scientific_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-400 font-mono">
                          {result.data.confidence.toFixed(1)}%
                        </div>
                        <span className="text-[10px] text-slate-400">Tingkat Keyakinan</span>
                      </div>
                    </div>

                    {/* Latency & Severity */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Tingkat Keparahan</span>
                        <span className="text-white font-bold mt-0.5 inline-block">{result.data.severity}</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Latency Inferensi</span>
                        <span className="text-emerald-400 font-mono font-bold mt-0.5 inline-block">
                          {(result.processing_time * 1000).toFixed(0)} ms
                        </span>
                      </div>
                    </div>

                    {/* Softmax Probability Distribution */}
                    {result.data.all_predictions && (
                      <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                          Distribusi Probabilitas Softmax (5 Kelas)
                        </p>
                        {result.data.all_predictions.map(pred => (
                          <div key={pred.disease} className="space-y-1 text-xs">
                            <div className="flex justify-between text-[11px]">
                              <span className={pred.disease === result.data.disease ? 'text-white font-bold' : 'text-slate-400'}>
                                {pred.disease}
                              </span>
                              <span className="font-mono text-slate-300 font-semibold">{pred.confidence.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pred.disease === result.data.disease ? 'bg-indigo-500' : 'bg-slate-600'
                                }`}
                                style={{ width: `${pred.confidence}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                <button
                  onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Uji Foto Berikutnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [testerOpen, setTesterOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    statsApi.get().then(setStats).catch(() => {});
    const interval = setInterval(() => {
      statsApi.get().then(setStats).catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const activeNav = NAV.find(n => n.to === location.pathname || (n.to !== '/admin' && location.pathname.startsWith(n.to)));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
        <Link to="/admin" className={`flex items-center gap-3 group ${collapsed ? 'mx-auto' : ''}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Cat className="w-5 h-5 text-indigo-400 group-hover:text-teal-300 transition-colors" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-sm tracking-tight">CatSkin AI</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">Pro</span>
              </div>
              <p className="text-[11px] text-slate-400">Pusat Kendali Sistem</p>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle Inside Header */}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Sembunyikan Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="hidden md:flex justify-center py-2 border-b border-slate-800/60">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Buka Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className={`px-2 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-500 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? 'Menu' : 'Menu Utama'}
        </div>
        {NAV.map(({ to, icon: Icon, label, badge }) => {
          const exact = to === '/admin';
          const active = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group relative ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${active ? 'text-white scale-110' : 'text-slate-400 group-hover:text-indigo-400'}`} />
              {!collapsed && (
                <span className="flex-1 truncate">{label}</span>
              )}
              {!collapsed && badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-indigo-500/15 text-indigo-300'
                }`}>
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Model Quick Status Badge */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Engine CNN
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              stats?.model_loaded ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {stats?.model_loaded ? 'MobileNetV2 (REAL)' : 'MOCK MODE'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            {stats?.total_dataset ? `${stats.total_dataset} citra latih terverifikasi` : '1.134 gambar dataset'}
          </p>
        </div>
      )}

      {/* Footer / Back to Public Website */}
      <div className="p-3 border-t border-slate-800/80">
        <a
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-all ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title="Buka Website Diagnosa Publik"
        >
          <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
          {!collapsed && <span>Website Utama</span>}
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#070b14] overflow-hidden text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-300 relative z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-b from-[#0b101d] to-[#070b14]">
        {/* Modern Top Header */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka Menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>CatSkin Control Center</span>
                <span>/</span>
                <span className="text-indigo-400 font-medium">{activeNav?.label || 'Admin'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 truncate">
                {activeNav?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Right Status & Tools */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Server API Online</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-mono text-[11px]">Port 8000</span>
            </div>

            <button
              onClick={() => setTesterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-teal-400 hover:from-indigo-600 hover:to-teal-500 text-white shadow-md shadow-indigo-500/20 transition-all transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coba Diagnosa (Sandbox)</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Model Diagnostic Sandbox Modal */}
      <AdminTesterModal isOpen={testerOpen} onClose={() => setTesterOpen(false)} />
    </div>
  );
}
