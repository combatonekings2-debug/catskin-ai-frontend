import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Upload, Trash2, Search, Eye, X, RefreshCw, Image as ImageIcon,
  CheckCircle2, AlertTriangle, Filter, ChevronLeft, ChevronRight,
  LayoutGrid, List, Plus, Download, Sparkles
} from 'lucide-react';
import { datasetApi } from '../api';

const CLASSES = ['Dermatitis', 'Flea Allergy', 'Ringworm', 'Scabies', 'Healthy'];

const CLASS_COLORS = {
  'Dermatitis': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Flea Allergy': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'Ringworm': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Scabies': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Healthy': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function Badge({ label }) {
  return (
    <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${CLASS_COLORS[label] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      {label}
    </span>
  );
}

function PreviewModal({ item, onClose, onRequestDelete }) {
  if (!item) return null;
  const directUrl = datasetApi.fileUrl(item.category, item.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-slate-900/95 rounded-3xl border border-slate-700 p-6 max-w-lg w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <p className="text-white font-bold text-sm truncate max-w-[340px]">{item.filename}</p>
            <p className="text-slate-400 text-xs mt-0.5">{item.size_kb} KB · Kategori: {item.category}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <Badge label={item.category} />
          <span className="text-[11px] text-slate-400 font-mono">ID: {item.id}</span>
        </div>

        <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square flex items-center justify-center relative shadow-inner">
          <img
            src={directUrl}
            alt={item.filename}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to base64 api
              datasetApi.image(item.category, item.id)
                .then(r => { if (r?.base64) e.currentTarget.src = r.base64; })
                .catch(() => {});
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => { onRequestDelete(item); onClose(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600/80 bg-rose-500/10 border border-rose-500/20 text-xs font-semibold transition-all"
          >
            <Trash2 size={14} /> Hapus Citra
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ isOpen, onClose, uploadCat, setUploadCat, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  if (!isOpen) return null;

  const handleFiles = (files) => {
    const list = Array.from(files).filter(f => {
      const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });
    setSelectedFiles(prev => [...prev, ...list]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    let ok = 0;
    const errors = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        await datasetApi.upload(file, uploadCat);
        ok++;
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
      setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
    }

    setUploading(false);
    onUploadSuccess(ok, errors);
    setSelectedFiles([]);
    setProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Upload size={16} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Upload Foto ke Dataset Latih</h3>
              <p className="text-slate-400 text-xs">Tambahkan sampel citra untuk fine-tuning model CNN</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Target Category */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Kategori Penyakit:</label>
          <select
            value={uploadCat}
            onChange={e => setUploadCat(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-medium focus:border-indigo-500 focus:outline-none"
          >
            {CLASSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-950/60'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          <ImageIcon className="w-10 h-10 text-indigo-400 mx-auto mb-2 opacity-80" />
          <p className="text-white text-xs font-semibold">Tarik & lepas file gambar di sini, atau klik untuk memilih</p>
          <p className="text-slate-500 text-[11px] mt-1">Mendukung format JPG, PNG, atau WebP (bisa pilih banyak berkas sekaligus)</p>
        </div>

        {/* Selected Files Count */}
        {selectedFiles.length > 0 && (
          <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              <strong className="text-indigo-400 font-mono">{selectedFiles.length}</strong> file siap diunggah
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-[11px] text-rose-400 hover:underline"
            >
              Kosongkan
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Mengunggah...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            onClick={handleUploadSubmit}
            disabled={uploading || selectedFiles.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            {uploading ? 'Mengunggah...' : `Unggah (${selectedFiles.length}) Gambar`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DatasetPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCls, setFilterCls] = useState('');
  const [uploadCat, setUploadCat] = useState(CLASSES[0]);
  const [preview, setPreview] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = viewMode === 'grid' ? 18 : 15;

  const load = useCallback(() => {
    setLoading(true);
    datasetApi.list()
      .then(r => {
        setItems(r.items || []);
        setStats(r.stats || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [search, filterCls, viewMode]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetItem = deleteTarget;
    setDeleteTarget(null);
    if (preview?.id === targetItem.id) setPreview(null);

    // Optimistic update
    setItems(prev => prev.filter(it => it.id !== targetItem.id));
    setStats(prev => {
      const perClass = { ...prev.per_class };
      if (perClass[targetItem.category]) {
        perClass[targetItem.category] = Math.max(0, perClass[targetItem.category] - 1);
      }
      return {
        ...prev,
        total: Math.max(0, (prev.total || 1) - 1),
        per_class: perClass,
      };
    });

    try {
      await datasetApi.delete(targetItem.id);
      showToast(`Foto ${targetItem.filename} berhasil dihapus`);
      load();
    } catch (err) {
      showToast(err.message, 'error');
      load();
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllPage = () => {
    const isAllPageSelected = paginatedItems.length > 0 && paginatedItems.every(it => selectedIds.includes(it.id));
    if (isAllPageSelected) {
      const pageIds = new Set(paginatedItems.map(it => it.id));
      setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...paginatedItems.map(it => it.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filtered.map(it => it.id));
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
    setItems(prev => prev.filter(it => !targetSet.has(it.id)));
    setStats(prev => {
      const perClass = { ...prev.per_class };
      items.filter(it => targetSet.has(it.id)).forEach(it => {
        if (perClass[it.category]) {
          perClass[it.category] = Math.max(0, perClass[it.category] - 1);
        }
      });
      return {
        ...prev,
        total: Math.max(0, (prev.total || targets.length) - targets.length),
        per_class: perClass,
      };
    });

    try {
      const res = await datasetApi.batchDelete(targets);
      showToast(`✓ ${res.deleted_count ?? targets.length} citra dataset berhasil dihapus`);
      load();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus beberapa item', 'error');
      load();
    }
  };

  const onUploadSuccess = (ok, errors) => {
    load();
    if (ok > 0 && errors.length === 0) {
      showToast(`✓ ${ok} gambar berhasil diunggah ke kelas "${uploadCat}"`);
    } else if (ok > 0) {
      showToast(`✓ ${ok} berhasil, ${errors.length} gagal diunggah`, 'warn');
    } else {
      showToast(`Upload gagal: ${errors[0] || 'Terjadi kesalahan'}`, 'error');
    }
  };

  const filtered = items.filter(it =>
    (!filterCls || it.category === filterCls) &&
    (!search || it.filename.toLowerCase().includes(search.toLowerCase()) || it.category.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-600 text-white' :
          toast.type === 'warn' ? 'bg-amber-600 text-white' :
          'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Dataset Manager (Data Latih AI)</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Total {stats.total ?? 0} citra foto kulit kucing terkurasi untuk pelatihan model CNN MobileNetV2.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Galeri Foto"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Galeri</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Tabel Detail"
            >
              <List size={15} />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95"
          >
            <Plus size={15} />
            <span>Upload Foto Baru</span>
          </button>

          <button
            onClick={load}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setFilterCls('')}
          className={`rounded-2xl p-4 border text-left transition-all ${
            filterCls === ''
              ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
              : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
          }`}
        >
          <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Semua Kategori</p>
          <p className="text-white text-xl font-extrabold mt-1 font-mono">{stats.total ?? 0}</p>
        </button>

        {CLASSES.map(cls => (
          <button
            key={cls}
            onClick={() => setFilterCls(filterCls === cls ? '' : cls)}
            className={`rounded-2xl p-4 border text-left transition-all ${
              filterCls === cls
                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-[11px] font-medium truncate">{cls}</p>
              <span className={`w-2 h-2 rounded-full ${CLASS_COLORS[cls]?.split(' ')[0] || 'bg-slate-600'}`} />
            </div>
            <p className="text-white text-xl font-extrabold mt-1 font-mono">{stats.per_class?.[cls] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* Search and Filter info */}
      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-lg">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama berkas citra..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-9 pr-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>
        {(search || filterCls) && (
          <button
            onClick={() => { setSearch(''); setFilterCls(''); }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700"
          >
            <X size={12} /> Reset Filter
          </button>
        )}
        <span className="text-slate-400 text-xs ml-auto font-medium">
          Menampilkan <span className="text-white font-bold">{filtered.length}</span> gambar
        </span>
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
                {selectedIds.length} citra terpilih
              </p>
              <p className="text-slate-400 text-xs">
                {selectedIds.length === filtered.length ? 'Semua citra yang terfilter telah terpilih' : `Dari total ${filtered.length} citra hasil pencarian/filter`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedIds.length < filtered.length && (
              <button
                onClick={handleSelectAllFiltered}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
              >
                Pilih Semua Hasil Filter ({filtered.length})
              </button>
            )}
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
              Hapus {selectedIds.length} Citra Terpilih
            </button>
          </div>
        </div>
      )}

      {/* Dataset Content View: Grid or Table */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-3xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
          <p>Memuat daftar citra dataset...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
          <ImageIcon size={44} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">
            {items.length === 0 ? 'Belum ada dataset. Silakan upload gambar untuk memulai.' : 'Tidak ada hasil yang sesuai kriteria pencarian.'}
          </p>
          <p className="text-slate-500 text-xs mt-1">Coba ubah kata kunci pencarian atau kategori filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID GALLERY VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {paginatedItems.map(item => (
            <div
              key={item.id}
              className="group bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col relative"
            >
              {/* Image Thumbnail */}
              <div
                onClick={() => setPreview(item)}
                className="aspect-square bg-slate-950 overflow-hidden relative cursor-pointer flex items-center justify-center"
              >
                {/* Individual Checkbox on Grid */}
                <div 
                  className="absolute top-2.5 left-2.5 z-20"
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900/90 border-slate-600 focus:ring-0 cursor-pointer accent-indigo-600 shadow-md"
                    title="Pilih item ini"
                  />
                </div>
                <img
                  src={datasetApi.fileUrl(item.category, item.id)}
                  alt={item.filename}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder or base64
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg">
                    <Eye size={15} />
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <Badge label={item.category} />
                  <p className="text-slate-300 font-mono text-[11px] truncate mt-1.5" title={item.filename}>
                    {item.filename}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <span>{item.size_kb} KB</span>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Hapus Citra"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/60">
                  <th className="py-3.5 pl-4 pr-1 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedItems.length > 0 && paginatedItems.every(it => selectedIds.includes(it.id))}
                      onChange={handleToggleSelectAllPage}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer accent-indigo-600 align-middle"
                      title={paginatedItems.length > 0 && paginatedItems.every(it => selectedIds.includes(it.id)) ? "Batalkan pilih semua di halaman ini" : "Pilih semua di halaman ini"}
                    />
                  </th>
                  <th className="py-3.5 pl-2 pr-2 w-16">Pratinjau</th>
                  <th className="py-3.5 px-3">File Citra</th>
                  <th className="py-3.5 px-3">Kategori Diagnosis</th>
                  <th className="py-3.5 px-3">Ukuran</th>
                  <th className="py-3.5 px-3">Tanggal Unggah</th>
                  <th className="py-3.5 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedItems.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        isSelected ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : ''
                      }`}
                    >
                      <td className="py-2.5 pl-4 pr-1 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer accent-indigo-600 align-middle"
                          title="Pilih item ini"
                        />
                      </td>
                      <td className="py-2.5 pl-2 pr-2">
                        <div
                          onClick={() => setPreview(item)}
                          className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group-hover:border-indigo-500 transition-colors shrink-0"
                        >
                          <img
                            src={datasetApi.fileUrl(item.category, item.id)}
                            alt={item.filename}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                    <td className="py-3 px-3 text-slate-200 font-mono text-xs max-w-[280px] truncate">
                      <span className="truncate" title={item.filename}>{item.filename}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge label={item.category} />
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {item.size_kb} KB
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {item.uploaded_at?.slice(0, 10) || 'Bawaan Model'}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreview(item)}
                          className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-colors"
                          title="Lihat Pratinjau Citra"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                          title="Hapus Citra"
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
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-slate-400 text-xs">
            Halaman <span className="font-semibold text-white">{currentPage}</span> dari {totalPages} ({filtered.length} total gambar)
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors text-xs"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-white font-mono text-xs rounded-xl font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors text-xs"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PreviewModal item={preview} onClose={() => setPreview(null)} onRequestDelete={item => setDeleteTarget(item)} />
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        uploadCat={uploadCat}
        setUploadCat={setUploadCat}
        onUploadSuccess={onUploadSuccess}
      />

      {/* Modal Konfirmasi Hapus Citra Dataset */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setDeleteTarget(null)}>
          <div className="bg-slate-900 rounded-3xl border border-rose-500/30 p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Hapus Foto Dataset?</h3>
                <p className="text-slate-400 text-xs">File citra akan dihapus secara permanen dari server.</p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800 text-xs space-y-1.5 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Kategori:</span>
                <span className="font-bold text-white">{deleteTarget.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File:</span>
                <span className="font-mono text-slate-300 truncate max-w-[200px]">{deleteTarget.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ukuran:</span>
                <span className="font-mono text-slate-400">{deleteTarget.size_kb} KB</span>
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

      {/* Modal Konfirmasi Hapus Massal (Batch Delete) */}
      {batchDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setBatchDeleteConfirm(false)}>
          <div className="bg-slate-900 rounded-3xl border border-rose-500/40 p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Hapus {selectedIds.length} Citra Terpilih?</h3>
                <p className="text-slate-400 text-xs">Semua berkas terpilih akan dihapus permanen dari server.</p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 mb-5">
              <p>
                Anda akan menghapus total <span className="font-bold text-rose-400 font-mono text-sm">{selectedIds.length}</span> file citra dataset latih secara permanen.
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Berkas foto akan dihapus dari penyimpanan disk server.
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
