import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database, BrainCircuit, HardDrive, ClipboardList, TrendingUp, Zap, ArrowRight,
  ShieldCheck, Activity, Cpu, Sparkles, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { statsApi, diagnosisApi } from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const DISEASE_COLOR_MAP = {
  'Dermatitis':  '#3b82f6',  // Biru
  'Flea Allergy':'#ef4444',  // Merah
  'Ringworm':    '#f59e0b',  // Amber
  'Scabies':     '#a855f7',  // Ungu
  'Healthy':     '#10b981',  // Hijau
};

// Warna badge angka kanan (bg+border+text) selaras dengan tiap penyakit
const DISEASE_COUNT_BADGE = {
  'Dermatitis':  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Flea Allergy':'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'Ringworm':    'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Scabies':     'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'Healthy':     'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

const STANDARD_DISEASES = ['Dermatitis', 'Flea Allergy', 'Ringworm', 'Scabies', 'Healthy'];

const DISEASE_BADGES = {
  'Dermatitis': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Flea Allergy': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'Ringworm': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Scabies': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Healthy': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function StatCard({ icon: Icon, label, value, sub, color, badge, badgeColor }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white text-3xl font-extrabold mt-1 tracking-tight">{value ?? '—'}</p>
        {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, desc, color, tag }) {
  return (
    <Link
      to={to}
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group flex flex-col justify-between shadow-lg"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {tag && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {tag}
            </span>
          )}
        </div>
        <p className="text-white font-semibold text-sm flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
          {label}
          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 transition-transform" />
        </p>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [recentDiags, setRecentDiags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interaktivitas Donut Chart Dataset
  const [hoveredDsIndex, setHoveredDsIndex] = useState(null);
  const [pinnedDsIndex, setPinnedDsIndex] = useState(null);

  // Interaktivitas Donut Chart Kasus Diagnosa
  const [hoveredDgIndex, setHoveredDgIndex] = useState(null);
  const [pinnedDgIndex, setPinnedDgIndex] = useState(null);

  useEffect(() => {
    Promise.all([
      statsApi.get().catch(() => null),
      diagnosisApi.list({ page: 1, limit: 5 }).catch(() => ({ items: [] }))
    ]).then(([s, d]) => {
      if (s) setStats(s);
      if (d?.items) setRecentDiags(d.items);
    }).finally(() => setLoading(false));
  }, []);

  const totalDataset = stats?.total_dataset || 0;
  // Tampilkan semua 5 kelas TANPA filter agar urutan slice selalu konsisten dengan legend
  const pieData = STANDARD_DISEASES.map(name => {
    const val = stats?.dataset_per_class?.[name] || 0;
    return {
      name,
      value: val,
      fill: DISEASE_COLOR_MAP[name],
      pct: totalDataset > 0 ? ((val / totalDataset) * 100).toFixed(1) : '0.0',
    };
  });
  // Data untuk pie hanya yang > 0, tapi urutan tetap sesuai STANDARD_DISEASES
  const pieDataForChart = pieData.filter(d => d.value > 0);
  const activeDsIndex = hoveredDsIndex !== null ? hoveredDsIndex : pinnedDsIndex;
  const activeDsItem = activeDsIndex !== null ? pieDataForChart[activeDsIndex] : null;

  const totalDiag = stats?.total_diagnosis || 0;
  const diagData = STANDARD_DISEASES.map(name => {
    const val = stats?.diagnosis_per_disease?.[name] || 0;
    return {
      name,
      value: val,
      fill: DISEASE_COLOR_MAP[name],
      pct: totalDiag > 0 ? ((val / totalDiag) * 100).toFixed(1) : '0.0',
    };
  });
  const diagDataForChart = diagData.filter(d => d.value > 0);
  const activeDgIndex = hoveredDgIndex !== null ? hoveredDgIndex : pinnedDgIndex;
  const activeDgItem = activeDgIndex !== null ? diagDataForChart[activeDgIndex] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Sistem AI & Clinical Database Aktif
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Dashboard CatSkin AI Control Center
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Pusat monitoring model CNN MobileNetV2, pengelolaan dataset latih 5 penyakit kulit kucing, dan rekam medis hasil diagnosa pasien.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <span className="text-slate-400">OOD Filter: </span>
              <span className="text-emerald-400 font-semibold">Aktif</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <span className="text-slate-400">Engine: </span>
              <span className="text-indigo-400 font-semibold">MobileNetV2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardList}
          label="Total Diagnosis"
          value={loading ? '...' : stats?.total_diagnosis}
          sub="Rekam medis tersimpan"
          color="bg-gradient-to-br from-violet-600 to-indigo-600"
          badge="Live Log"
          badgeColor="bg-violet-500/20 text-violet-300 border-violet-500/30"
        />
        <StatCard
          icon={Database}
          label="Total Dataset"
          value={loading ? '...' : stats?.total_dataset}
          sub="5 Kategori Penyakit"
          color="bg-gradient-to-br from-sky-500 to-cyan-600"
          badge="Balanced"
          badgeColor="bg-sky-500/20 text-sky-300 border-sky-500/30"
        />
        <StatCard
          icon={BrainCircuit}
          label="Status Training"
          value={
            loading
              ? '...'
              : stats?.training_status === 'training'
              ? 'Training'
              : stats?.training_status === 'completed'
              ? 'Selesai'
              : 'Idle'
          }
          sub="AI Fine-Tuning Studio"
          color="bg-gradient-to-br from-amber-500 to-orange-600"
          badge={stats?.training_status === 'training' ? 'Running' : 'Siap'}
          badgeColor={
            stats?.training_status === 'training'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
              : 'bg-slate-700 text-slate-300 border-slate-600'
          }
        />
        <StatCard
          icon={Zap}
          label="Model Mode"
          value={loading ? '...' : stats?.model_loaded ? 'REAL' : 'MOCK'}
          sub={stats?.model_loaded ? 'Model .keras aktif' : 'Fallback simulation'}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          badge={stats?.model_loaded ? 'Optimal' : 'Demo'}
          badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dataset Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <p className="text-white font-bold text-sm">Distribusi Dataset Training</p>
              <p className="text-slate-400 text-xs">Proporsi foto latih pada 5 kelas penyakit</p>
            </div>
            <div className="flex items-center gap-2">
              {pinnedDsIndex !== null && (
                <button
                  onClick={() => setPinnedDsIndex(null)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 transition-all hover:bg-indigo-500/25"
                  title="Klik untuk reset pilihan"
                >
                  Reset Pilihan ✕
                </button>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Total: {totalDataset} Gambar
              </span>
            </div>
          </div>

          {pieDataForChart.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* Donut Container with Dynamic Spotlight Center */}
              <div
                className="w-52 h-52 relative shrink-0 flex items-center justify-center p-1"
                onMouseLeave={() => setHoveredDsIndex(null)}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={pieDataForChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={74}
                      dataKey="value"
                      paddingAngle={3}
                      onMouseEnter={(_, idx) => setHoveredDsIndex(idx)}
                      onClick={(_, idx) => setPinnedDsIndex(prev => prev === idx ? null : idx)}
                      cursor="pointer"
                    >
                      {pieDataForChart.map((entry, i) => {
                        const isSelected = activeDsIndex === i;
                        return (
                          <Cell
                            key={`pie-ds-${i}`}
                            fill={entry.fill}
                            stroke={isSelected ? '#ffffff' : '#0f172a'}
                            strokeWidth={isSelected ? 3 : 2}
                            style={{
                              filter: isSelected ? `drop-shadow(0 0 8px ${entry.fill})` : 'none',
                              opacity: activeDsIndex === null || isSelected ? 1 : 0.38,
                              transition: 'all 0.25s ease',
                              outline: 'none',
                            }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Central Dynamic Spotlight Display (Hanya aktif di area lingkaran tengah, tidak menghalangi slice pie) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    onClick={() => setPinnedDsIndex(null)}
                    className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-center px-1 pointer-events-auto cursor-pointer select-none"
                    title={pinnedDsIndex !== null ? 'Klik untuk lepas pilihan' : ''}
                  >
                    {activeDsItem ? (
                      <div className="flex flex-col items-center justify-center transition-all duration-200">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 border uppercase tracking-wider max-w-[90px] truncate leading-tight shadow-sm"
                          style={{
                            color: activeDsItem.fill,
                            backgroundColor: `${activeDsItem.fill}22`,
                            borderColor: `${activeDsItem.fill}55`,
                            boxShadow: `0 0 10px ${activeDsItem.fill}25`,
                          }}
                        >
                          {activeDsItem.name}
                        </span>
                        <span
                          className="text-2xl font-black font-mono leading-none tracking-tight my-0.5"
                          style={{
                            color: activeDsItem.fill,
                            textShadow: `0 0 12px ${activeDsItem.fill}60`,
                          }}
                        >
                          {activeDsItem.value}
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono font-semibold leading-tight mt-0.5">
                          {activeDsItem.pct}% Foto
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white font-mono leading-none tracking-tight">
                          {totalDataset}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                          Total Foto
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legend List (Sync Hover & Click) */}
              <div className="space-y-1.5 flex-1 w-full">
                {pieData.map((d, i) => {
                  const chartIdx = pieDataForChart.findIndex(item => item.name === d.name);
                  const isSelected = chartIdx !== -1 && activeDsIndex === chartIdx;
                  return (
                    <div
                      key={`leg-ds-${i}`}
                      onMouseEnter={() => { if (chartIdx !== -1) setHoveredDsIndex(chartIdx); }}
                      onMouseLeave={() => setHoveredDsIndex(null)}
                      onClick={() => { if (chartIdx !== -1) setPinnedDsIndex(prev => prev === chartIdx ? null : chartIdx); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 text-xs cursor-pointer select-none ${
                        isSelected
                          ? 'scale-[1.02] shadow-lg'
                          : 'hover:scale-[1.01]'
                      }`}
                      style={{
                        background: isSelected ? `${d.fill}26` : `${d.fill}10`,
                        border: `1px solid ${isSelected ? d.fill : `${d.fill}35`}`,
                        boxShadow: isSelected ? `0 0 14px ${d.fill}45` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                          style={{
                            background: d.fill,
                            boxShadow: `0 0 6px ${d.fill}80`,
                            transform: isSelected ? 'scale(1.35)' : 'scale(1)',
                          }}
                        />
                        <span className={`font-semibold transition-colors ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {d.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">{d.pct}%</span>
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded-lg border text-xs ${DISEASE_COUNT_BADGE[d.name]}`}
                        >{d.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Belum ada data dataset</div>
          )}
        </div>

        {/* Diagnosis Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <p className="text-white font-bold text-sm">Distribusi Temuan Kasus Klinis</p>
              <p className="text-slate-400 text-xs">Frekuensi penyakit yang didiagnosa oleh pengguna</p>
            </div>
            <div className="flex items-center gap-2">
              {pinnedDgIndex !== null && (
                <button
                  onClick={() => setPinnedDgIndex(null)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 transition-all hover:bg-indigo-500/25"
                  title="Klik untuk reset pilihan"
                >
                  Reset Pilihan ✕
                </button>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Total: {totalDiag} Kasus
              </span>
            </div>
          </div>

          {diagDataForChart.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* Donut Container with Dynamic Spotlight Center */}
              <div
                className="w-52 h-52 relative shrink-0 flex items-center justify-center p-1"
                onMouseLeave={() => setHoveredDgIndex(null)}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={diagDataForChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={74}
                      dataKey="value"
                      paddingAngle={3}
                      onMouseEnter={(_, idx) => setHoveredDgIndex(idx)}
                      onClick={(_, idx) => setPinnedDgIndex(prev => prev === idx ? null : idx)}
                      cursor="pointer"
                    >
                      {diagDataForChart.map((entry, i) => {
                        const isSelected = activeDgIndex === i;
                        return (
                          <Cell
                            key={`pie-dg-${i}`}
                            fill={entry.fill}
                            stroke={isSelected ? '#ffffff' : '#0f172a'}
                            strokeWidth={isSelected ? 3 : 2}
                            style={{
                              filter: isSelected ? `drop-shadow(0 0 8px ${entry.fill})` : 'none',
                              opacity: activeDgIndex === null || isSelected ? 1 : 0.38,
                              transition: 'all 0.25s ease',
                              outline: 'none',
                            }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Central Dynamic Spotlight Display (Hanya aktif di area lingkaran tengah, tidak menghalangi slice pie) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    onClick={() => setPinnedDgIndex(null)}
                    className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-center px-1 pointer-events-auto cursor-pointer select-none"
                    title={pinnedDgIndex !== null ? 'Klik untuk lepas pilihan' : ''}
                  >
                    {activeDgItem ? (
                      <div className="flex flex-col items-center justify-center transition-all duration-200">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 border uppercase tracking-wider max-w-[90px] truncate leading-tight shadow-sm"
                          style={{
                            color: activeDgItem.fill,
                            backgroundColor: `${activeDgItem.fill}22`,
                            borderColor: `${activeDgItem.fill}55`,
                            boxShadow: `0 0 10px ${activeDgItem.fill}25`,
                          }}
                        >
                          {activeDgItem.name}
                        </span>
                        <span
                          className="text-2xl font-black font-mono leading-none tracking-tight my-0.5"
                          style={{
                            color: activeDgItem.fill,
                            textShadow: `0 0 12px ${activeDgItem.fill}60`,
                          }}
                        >
                          {activeDgItem.value}
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono font-semibold leading-tight mt-0.5">
                          {activeDgItem.pct}% Kasus
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white font-mono leading-none tracking-tight">
                          {totalDiag}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                          Total Kasus
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legend List (Sync Hover & Click) */}
              <div className="space-y-1.5 flex-1 w-full">
                {diagData.map((d, i) => {
                  const chartIdx = diagDataForChart.findIndex(item => item.name === d.name);
                  const isSelected = chartIdx !== -1 && activeDgIndex === chartIdx;
                  return (
                    <div
                      key={`leg-dg-${i}`}
                      onMouseEnter={() => { if (chartIdx !== -1) setHoveredDgIndex(chartIdx); }}
                      onMouseLeave={() => setHoveredDgIndex(null)}
                      onClick={() => { if (chartIdx !== -1) setPinnedDgIndex(prev => prev === chartIdx ? null : chartIdx); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 text-xs cursor-pointer select-none ${
                        isSelected
                          ? 'scale-[1.02] shadow-lg'
                          : 'hover:scale-[1.01]'
                      }`}
                      style={{
                        background: isSelected ? `${d.fill}26` : `${d.fill}10`,
                        border: `1px solid ${isSelected ? d.fill : `${d.fill}35`}`,
                        boxShadow: isSelected ? `0 0 14px ${d.fill}45` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                          style={{
                            background: d.fill,
                            boxShadow: `0 0 6px ${d.fill}80`,
                            transform: isSelected ? 'scale(1.35)' : 'scale(1)',
                          }}
                        />
                        <span className={`font-semibold transition-colors ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {d.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">{d.pct}%</span>
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded-lg border text-xs ${DISEASE_COUNT_BADGE[d.name]}`}
                        >{d.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Belum ada data diagnosa</div>
          )}
        </div>
      </div>

      {/* Recent Diagnoses Widget */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm">Riwayat Diagnosis Terbaru</h3>
            <p className="text-slate-400 text-xs">5 kasus terakhir yang dianalisis oleh pengguna</p>
          </div>
          <Link
            to="/admin/diagnosis"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
          >
            Lihat Semua Riwayat <ArrowRight size={13} />
          </Link>
        </div>

        {recentDiags.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">Belum ada riwayat diagnosis</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Foto</th>
                  <th className="pb-3">Penyakit</th>
                  <th className="pb-3">Tingkat Keparahan</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentDiags.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 pl-2">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/60 shrink-0">
                        <img
                          src={`/api/admin/diagnosis/image/${d.image_id}`}
                          alt="Foto Kucing"
                          onError={(e) => { e.currentTarget.src = '/images/disease-healthy.jpg'; }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-semibold border ${DISEASE_BADGES[d.disease] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {d.disease}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300 font-medium">
                      {d.severity || 'Sedang'}
                    </td>
                    <td className="py-2.5">
                      <span className="font-mono font-bold text-white">
                        {typeof d.confidence === 'number' ? d.confidence.toFixed(1) : d.confidence}%
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {d.timestamp ? new Date(d.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Modul Akses Cepat</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink
            to="/admin/dataset"
            icon={Database}
            label="Dataset Manager"
            desc="Kelola 1.134 foto training per kategori penyakit"
            color="bg-gradient-to-br from-sky-500 to-cyan-600"
            tag="1.134 Foto"
          />
          <QuickLink
            to="/admin/training"
            icon={BrainCircuit}
            label="Training Studio"
            desc="Fine-tuning model CNN MobileNetV2 real-time"
            color="bg-gradient-to-br from-violet-500 to-purple-600"
            tag="AI Lab"
          />
          <QuickLink
            to="/admin/models"
            icon={HardDrive}
            label="Model Management"
            desc="Deploy & download bobot model AI .keras / .h5"
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            tag="Weights"
          />
          <QuickLink
            to="/admin/diagnosis"
            icon={ClipboardList}
            label="Riwayat Diagnosis"
            desc="Rekam jejak riwayat prediksi pengguna publik"
            color="bg-gradient-to-br from-emerald-500 to-green-600"
            tag="Rekam Medis"
          />
        </div>
      </div>
    </div>
  );
}
