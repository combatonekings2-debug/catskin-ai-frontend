import { useEffect, useState, useCallback, useRef } from 'react';
import { HardDrive, Rocket, Download, Trash2, RefreshCw, CheckCircle2, AlertCircle, Cpu, Zap, ShieldCheck, Upload, Plus, X } from 'lucide-react';
import { modelsApi } from '../api';

function UploadModelModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await modelsApi.upload(file);
      onSuccess(`Model ${file.name} berhasil diunggah dan terdaftar!`);
      setFile(null);
      onClose();
    } catch (e) {
      alert(`Gagal upload: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Upload size={16} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Upload Bobot Model AI</h3>
              <p className="text-slate-400 text-xs">Impor file bobot dari Google Colab / Kaggle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-violet-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/60 transition-all"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".h5,.keras"
            className="hidden"
            onClick={e => e.stopPropagation()}
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
          <Cpu className="w-10 h-10 text-violet-400 mx-auto mb-2 opacity-80" />
          <p className="text-white text-xs font-semibold">
            {file ? file.name : 'Pilih berkas model (.h5 atau .keras)'}
          </p>
          <p className="text-slate-500 text-[11px] mt-1">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Maksimal ukuran 50 MB'}
          </p>
        </div>

        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all"
          >
            {uploading ? 'Mengunggah...' : 'Unggah & Daftarkan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModelsPage() {
  const [models, setModels]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const [deploying, setDeploying] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);

  const [modelToDelete, setModelToDelete] = useState(null);
  const [deletingModel, setDeletingModel] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    modelsApi.list().then(r => setModels(r.models || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDeploy = async (filename) => {
    setDeploying(filename);
    try {
      await modelsApi.deploy(filename);
      showToast(`Model ${filename} berhasil di-deploy sebagai model aktif produksi!`);
      load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setDeploying(null);
    }
  };

  const confirmDelete = async () => {
    if (!modelToDelete) return;
    setDeletingModel(true);
    setDeleteError(null);
    try {
      await modelsApi.delete(modelToDelete);
      showToast(`Model ${modelToDelete} berhasil dihapus`);
      setModelToDelete(null);
      setDeleteError(null);
      load();
    } catch (e) {
      setDeleteError(e.message);
      showToast(e.message, 'error');
    } finally {
      setDeletingModel(false);
    }
  };

  const activeModel = models.find(m => m.is_active);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 transition-all ${
          toast.type === 'error' ? 'bg-rose-500/90 text-white border border-rose-400/30 backdrop-blur-md' : 'bg-emerald-500/90 text-white border border-emerald-400/30 backdrop-blur-md'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Model AI & Weights Registry</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola versi bobot CNN, pilih model aktif untuk inferensi produksi, dan unduh backup .h5 / .keras</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-violet-600/25 transition-all"
          >
            <Plus size={15} />
            <span>Upload Model (.h5/.keras)</span>
          </button>
          <button onClick={load} className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-semibold">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Active Model Spotlight */}
      {activeModel && (
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-900/30 via-slate-900 to-indigo-900/20 border border-violet-500/40 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center shrink-0 shadow-inner">
                <Cpu size={28} className="text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Model Aktif di Produksi
                  </span>
                  <span className="text-xs text-slate-400">Dimuat di Memori Server</span>
                </div>
                <h3 className="text-white font-bold text-lg mt-1 font-mono tracking-tight">{activeModel.filename}</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Model ini saat ini bertugas mengeksekusi seluruh diagnosa penyakit kulit kucing dari kamera dan upload user di website publik.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={modelsApi.download(activeModel.filename)}
                download
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-all hover:border-slate-600 shadow-sm"
              >
                <Download size={14} /> Download Bobot ({activeModel.size_mb} MB)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Model Modal */}
      <UploadModelModal
        isOpen={uploadModal}
        onClose={() => setUploadModal(false)}
        onSuccess={(msg) => { showToast(msg); load(); }}
      />

      {/* Model List */}
      <div>
        <h2 className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-3">Daftar Versi Model Tersedia ({models.length})</h2>

        {loading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
            Memeriksa file bobot model...
          </div>
        ) : models.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <HardDrive size={38} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-sm">Belum ada model tersimpan di direktori backend.</p>
            <p className="text-slate-500 text-xs mt-1">Gunakan tab <b>Training Studio</b> untuk melatih model baru dengan dataset yang tersedia.</p>
          </div>
        ) : (
          <div className="grid gap-3.5">
            {models.map((model) => {
              const isKeras = model.filename.endsWith('.keras');
              return (
                <div
                  key={model.filename}
                  className={`bg-slate-900/80 backdrop-blur-md border rounded-2xl p-5 transition-all ${
                    model.is_active
                      ? 'border-violet-500/60 bg-gradient-to-r from-violet-950/20 to-slate-900/90 shadow-lg shadow-violet-900/10'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        model.is_active ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-slate-800/80 border-slate-700/50 text-slate-400'
                      }`}>
                        <HardDrive size={20} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-mono font-semibold text-sm">{model.filename}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isKeras ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isKeras ? 'Keras v3 Format' : 'HDF5 Format'}
                          </span>
                          {model.is_active && (
                            <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Aktif Digunakan
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            Ukuran: <strong className="text-slate-300 font-mono">{model.size_mb} MB</strong>
                          </span>
                          {model.accuracy && (
                            <span className="text-emerald-400 font-semibold">
                              Akurasi Uji: {model.accuracy.toFixed(1)}%
                            </span>
                          )}
                          {model.epochs && (
                            <span className="text-slate-400">
                              {model.epochs} Epochs
                            </span>
                          )}
                          <span className="text-slate-500 text-[11px]">
                            Disimpan: {model.created_at ? model.created_at.replace('T', ' ').slice(0, 16) : 'Tersedia'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {!model.is_active && (
                        <button
                          onClick={() => handleDeploy(model.filename)}
                          disabled={deploying === model.filename}
                          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-violet-900/30"
                        >
                          <Rocket size={13} className={deploying === model.filename ? 'animate-bounce' : ''} />
                          {deploying === model.filename ? 'Deploying...' : 'Deploy ke Produksi'}
                        </button>
                      )}
                      <a
                        href={modelsApi.download(model.filename)}
                        download
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium px-3 py-2 rounded-xl border border-slate-700/60 transition-colors"
                      >
                        <Download size={13} /> Unduh
                      </a>
                      {!model.is_active && (
                        <button
                          onClick={() => setModelToDelete(model.filename)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                          title="Hapus Model"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guide Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <h4 className="text-white font-bold text-sm">Alur Kerja Model Deployment</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/40">
                <p className="text-violet-400 font-bold mb-1">1. Latih di Training Studio</p>
                <p className="text-slate-400 leading-relaxed">Pilih hyperparameter (epoch, batch size, learning rate) lalu jalankan transfer learning MobileNetV2.</p>
              </div>
              <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/40">
                <p className="text-indigo-400 font-bold mb-1">2. Klik "Deploy ke Produksi"</p>
                <p className="text-slate-400 leading-relaxed">Backend akan memuat arsitektur bobot terpilih ke dalam memori TensorFlow/Keras secara instan tanpa restart.</p>
              </div>
              <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/40">
                <p className="text-emerald-400 font-bold mb-1">3. Langsung Aktif</p>
                <p className="text-slate-400 leading-relaxed">Pengguna website publik yang mendiagnosa foto kucing akan langsung dievaluasi menggunakan model yang baru dideploy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {modelToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={() => { setModelToDelete(null); setDeleteError(null); }}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <Trash2 size={24} />
            </div>
            <h3 className="text-white font-bold text-center text-base">Hapus File Model?</h3>
            <p className="text-slate-400 text-xs text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus file bobot <span className="text-white font-mono font-semibold">{modelToDelete}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            {deleteError && (
              <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center font-medium leading-relaxed">
                {deleteError}
              </div>
            )}

            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => { setModelToDelete(null); setDeleteError(null); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingModel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                {deletingModel ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

