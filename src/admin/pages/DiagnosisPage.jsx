import { useEffect, useState, useCallback } from 'react';
import {
  Search, Trash2, Eye, X, ChevronLeft, ChevronRight, RefreshCw,
  ClipboardList, AlertTriangle, CheckCircle2, Calendar, FileText, Image as ImageIcon
} from 'lucide-react';
import { diagnosisApi } from '../api';

const DISEASES = ['Dermatitis', 'Flea Allergy', 'Ringworm', 'Scabies', 'Healthy'];

const SEVERITY_COLOR = {
  'Normal': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Sedang': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Tinggi': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const DISEASE_COLOR = {
  'Dermatitis': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Flea Allergy': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'Ringworm': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Scabies': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Healthy': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function ConfidenceBar({ value }) {
  const pct = Math.round(value);
  const color = pct >= 85 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(5, pct))}%` }} />
      </div>
      <span className="text-xs text-white font-mono font-bold w-12 text-right">{pct}%</span>
    </div>
  );
}

function DetailModal({ item, onClose, onRequestDelete }) {
  if (!item) return null;
  const imgUrl = `/api/admin/diagnosis/image/${item.image_id}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 max-w-lg w-full shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <p className="text-white font-bold text-base">Detail Rekam Medis AI</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Foto Preview */}
          <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center relative shadow-inner">
            <img
              src={imgUrl}
              alt={item.disease}
              onError={(e) => { e.currentTarget.src = '/images/disease-healthy.jpg'; }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2.5 right-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-md ${DISEASE_COLOR[item.disease] || 'bg-slate-800 text-slate-200'}`}>
                {item.disease}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3">
              <p className="text-slate-400 text-[11px] mb-1">Tingkat Keyakinan (Confidence)</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white font-mono">{item.confidence?.toFixed(1)}%</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.confidence >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {item.confidence >= 80 ? 'Tinggi' : 'Konfirmasi'}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3">
              <p className="text-slate-400 text-[11px] mb-1">Keparahan Klinis</p>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border mt-0.5 ${SEVERITY_COLOR[item.severity] || 'bg-slate-700 text-slate-300'}`}>
                {item.severity || 'Sedang'}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} /> Waktu Diagnosa:</span>
              <span className="text-white font-medium">
                {item.timestamp ? new Date(item.timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '—'}
              </span>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5"><FileText size={13} /> Nama File Asli:</span>
              <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">{item.filename || '—'}</span>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
              <span className="text-slate-400 text-[11px] block mb-0.5">ID Rekam Medis:</span>
              <span className="text-indigo-300 font-mono text-[11px] select-all break-all">{item.image_id}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                onRequestDelete(item);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all font-semibold text-xs"
            >
              <Trash2 size={14} /> Hapus Record Ini
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosisPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDisease] = useState('');
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const LIMIT = 10;

  const load = useCallback(() => {
    setLoading(true);
    diagnosisApi.list({ page, limit: LIMIT, search, disease_filter: diseaseFilter })
      .then(r => {
        let fetched = r.items || [];
        if (severityFilter) {
          fetched = fetched.filter(item => (item.severity || '').toLowerCase() === severityFilter.toLowerCase());
        }
        setItems(fetched);
        setTotal(r.total || 0);
        setTotalPages(r.total_pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, diseaseFilter, severityFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, diseaseFilter, severityFilter]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.image_id;
    const targetDisease = deleteTarget.disease;
    
    // Optimistic UI: hapus langsung dari tampilan tanpa menunggu server
    setItems(prev => prev.filter(it => it.image_id !== targetId));
    setTotal(t => Math.max(0, t - 1));
    setDeleteTarget(null);
    if (detail?.image_id === targetId) setDetail(null);

    try {
      await diagnosisApi.delete(targetId);
      showToast(`Rekam medis ${targetDisease} berhasil dihapus`);
      load();
    } catch (e) {
      showToast(e.message || 'Gagal menghapus record', 'error');
      load();
    }
  };

  const confirmClearAll = async () => {
    setClearConfirm(false);
    // Optimistic UI
    setItems([]);
    setTotal(0);
    setDetail(null);

    try {
      await diagnosisApi.clear();
      showToast('Semua riwayat diagnosis berhasil dibersihkan');
      load();
    } catch (e) {
      showToast(e.message || 'Gagal membersihkan riwayat', 'error');
      load();
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllPageSelected = items.length > 0 && items.every(it => selectedIds.includes(it.image_id));

  const handleToggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIds = new Set(items.map(it => it.image_id));
      setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...items.map(it => it.image_id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const confirmBatchDelete = async () => {
    if (!selectedIds.length) return;
    const targets = [...selectedIds];
    const targetSet = new Set(targets);
    setBatchDeleteConfirm(false);
    setSelectedIds([]);

    // Optimistic UI update
    setItems(prev => prev.filter(it => !targetSet.has(it.image_id)));
    setTotal(t => Math.max(0, t - targets.length));

    try {
      const res = await diagnosisApi.batchDelete(targets);
      showToast(`✓ ${res.deleted_count ?? targets.length} rekam medis berhasil dihapus`);
      load();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus beberapa rekam medis', 'error');
      load();
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Riwayat Rekam Medis Diagnosis</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Total {total} rekam medis diagnosis tersimpan dari pemeriksaan pengguna publik.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={diagnosisApi.exportUrl()}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors shadow-sm"
          >
            <FileText size={14} className="text-indigo-400" />
            <span>Ekspor JSON</span>
          </a>

          {total > 0 && (
            <button
              onClick={() => setClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs font-semibold border border-rose-500/20 transition-all shadow-sm"
            >
              <Trash2 size={13} />
              <span>Bersihkan Semua</span>
            </button>
          )}

          <button
            onClick={load}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-lg">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari ID gambar, nama file, atau penyakit..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-9 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>

        <select
          value={diseaseFilter}
          onChange={e => setDisease(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
        >
          <option value="">Semua Penyakit</option>
          {DISEASES.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
        >
          <option value="">Semua Keparahan</option>
          <option value="Normal">Normal (Sehat)</option>
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi (Kritis)</option>
        </select>

        {(search || diseaseFilter || severityFilter) && (
          <button
            onClick={() => { setSearch(''); setDisease(''); setSeverityFilter(''); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800 border border-slate-700"
          >
            <X size={12} /> Reset Filter
          </button>
        )}
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-sm">
              {selectedIds.length}
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                {selectedIds.length} rekam medis dipilih
              </p>
              <p className="text-slate-400 text-xs">
                Pilihan aktif pada daftar riwayat pemeriksaan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleClearSelection}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
            >
              Batalkan Pilihan
            </button>
            <button
              onClick={() => setBatchDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <Trash2 size={14} />
              Hapus {selectedIds.length} Rekam Medis Terpilih
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-14 text-center text-slate-500 text-sm flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
            <p>Memuat rekam medis diagnosis...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-14 text-center">
            <ClipboardList size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold text-sm">
              {total === 0 ? 'Belum ada riwayat diagnosis tersimpan.' : 'Tidak ada hasil yang cocok dengan filter.'}
            </p>
            <p className="text-slate-500 text-xs mt-1">Diagnosis yang dilakukan pada website utama akan tercatat otomatis di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/60">
                  <th className="py-3.5 pl-4 pr-1 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleToggleSelectAllPage}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer accent-indigo-600 align-middle"
                      title={isAllPageSelected ? "Batalkan pilih semua di halaman ini" : "Pilih semua di halaman ini"}
                    />
                  </th>
                  <th className="py-3.5 pl-2 pr-2">Foto Pasien</th>
                  <th className="py-3.5 px-3">Kondisi Terdiagnosa</th>
                  <th className="py-3.5 px-3">Tingkat Keparahan</th>
                  <th className="py-3.5 px-3 min-w-[170px]">Confidence Softmax</th>
                  <th className="py-3.5 px-3">Waktu Pemeriksaan</th>
                  <th className="py-3.5 px-3">Nama Berkas</th>
                  <th className="py-3.5 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map(item => {
                  const isSelected = selectedIds.includes(item.image_id);
                  return (
                    <tr 
                      key={item.image_id} 
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        isSelected ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : ''
                      }`}
                    >
                      <td className="py-3 pl-4 pr-1 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.image_id)}
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer accent-indigo-600 align-middle"
                          title="Pilih rekam medis ini"
                        />
                      </td>
                      <td className="py-3 pl-2 pr-2">
                        <div
                          onClick={() => setDetail(item)}
                          className="w-11 h-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 cursor-pointer group-hover:border-indigo-500 transition-colors shrink-0 shadow"
                        >
                          <img
                            src={`/api/admin/diagnosis/image/${item.image_id}`}
                            alt={item.disease}
                            onError={(e) => { e.currentTarget.src = '/images/disease-healthy.jpg'; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${DISEASE_COLOR[item.disease] || 'bg-slate-800 text-slate-300'}`}>
                        {item.disease}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${SEVERITY_COLOR[item.severity] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {item.severity || 'Sedang'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <ConfidenceBar value={item.confidence || 0} />
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] max-w-[140px] truncate" title={item.filename}>
                      {item.filename || 'foto-kucing.jpg'}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetail(item)}
                          className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-colors"
                          title="Lihat Detail Rekam Medis"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                          title="Hapus Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-slate-400 text-xs">
            Menampilkan halaman <span className="font-semibold text-white">{page}</span> dari {totalPages} ({total} total riwayat)
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors text-xs"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pg = i + 1;
              if (totalPages > 5) {
                if (page <= 3) pg = i + 1;
                else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                else pg = page - 2 + i;
              }
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 text-xs font-semibold rounded-xl transition-all ${
                    page === pg
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors text-xs"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal item={detail} onClose={() => setDetail(null)} onRequestDelete={item => setDeleteTarget(item)} />

      {/* Modal Konfirmasi Hapus Record Tunggal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setDeleteTarget(null)}>
          <div className="bg-slate-900 rounded-3xl border border-rose-500/30 p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Hapus Rekam Medis?</h3>
                <p className="text-slate-400 text-xs">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
              </div>
            </div>
            
            <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800 text-xs space-y-1.5 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Penyakit:</span>
                <span className="font-bold text-white">{deleteTarget.disease}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File:</span>
                <span className="font-mono text-slate-300 truncate max-w-[180px]">{deleteTarget.filename || 'foto-kucing.jpg'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ID:</span>
                <span className="font-mono text-indigo-300 text-[11px] truncate max-w-[180px]">{deleteTarget.image_id}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Bersihkan Semua Riwayat */}
      {clearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setClearConfirm(false)}>
          <div className="bg-slate-900 rounded-3xl border border-rose-500/40 p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Bersihkan Semua Riwayat?</h3>
                <p className="text-slate-400 text-xs">Total {total} rekam medis akan dihapus secara permanen.</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 mb-5 leading-relaxed">
              Apakah Anda yakin ingin mengosongkan seluruh riwayat diagnosa klinik? Anda disarankan mengekspor ke file JSON terlebih dahulu jika data masih diperlukan.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setClearConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmClearAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                Bersihkan Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Massal (Batch Delete) */}
      {batchDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setBatchDeleteConfirm(false)}>
          <div className="bg-slate-900 rounded-3xl border border-rose-500/40 p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Hapus {selectedIds.length} Rekam Medis Terpilih?</h3>
                <p className="text-slate-400 text-xs">Semua rekam medis terpilih akan dihapus permanen.</p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 mb-5">
              <p>
                Anda akan menghapus total <span className="font-bold text-rose-400 font-mono text-sm">{selectedIds.length}</span> rekam jejak diagnosa klinik secara permanen.
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Berkas foto unggahan pasien terkait juga akan dihapus dari server.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBatchDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmBatchDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                Ya, Hapus Semua ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
