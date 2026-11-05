import { useEffect, useState, useRef } from 'react';
import {
  Play, Square, RefreshCw, BrainCircuit, CheckCircle2, AlertCircle,
  Cpu, Layers, Sparkles, BookOpen, BarChart3, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { trainingApi } from '../api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const CHART_STYLE = {
  contentStyle: { background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12, color: '#f8fafc' },
  labelStyle: { color: '#94a3b8' },
};

function Slider({ label, min, max, step = 1, value, onChange, fmt = v => v, desc }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-300 font-semibold">{label}</span>
        <span className="text-indigo-400 font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30">
          {fmt(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-colors"
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>Min: {min}</span>
        {desc && <span className="text-slate-400">{desc}</span>}
        <span>Maks: {max}</span>
      </div>
    </div>
  );
}

export default function TrainingPage() {
  const [config, setConfig] = useState({ epochs: 12, batch_size: 32, learning_rate: 0.001, mode: 'real' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      setStatus(await trainingApi.status());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (status?.status === 'training') {
      pollRef.current = setInterval(fetchStatus, 1500);
    }
    return () => clearInterval(pollRef.current);
  }, [status?.status]);

  const handleStart = async () => {
    setLoading(true);
    try {
      await trainingApi.start(config);
      await fetchStatus();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await trainingApi.stop();
      await fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const isTraining = status?.status === 'training';
  const isCompleted = status?.status === 'completed';
  const isError = status?.status === 'error';

  // Build chart data
  const chartData = (status?.train_acc || []).map((_, i) => ({
    epoch: i + 1,
    train_acc: status.train_acc[i],
    val_acc: status.val_acc?.[i],
    train_loss: status.train_loss?.[i],
    val_loss: status.val_loss?.[i],
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-xl font-extrabold tracking-tight">AI Training Studio (MobileNetV2)</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Konfigurasi hyperparameter, jalankan pelatihan model deep learning, dan amati kurva konvergensi secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isTraining
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isTraining ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            Status: {isTraining ? 'Sedang Melatih' : isCompleted ? 'Pelatihan Selesai' : 'Siap Latih'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Hyperparameter Config Panel */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <p className="text-white font-bold text-sm flex items-center gap-2">
              <BrainCircuit size={17} className="text-indigo-400" />
              Konfigurasi Hyperparameter
            </p>
            <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-full">
              MobileNetV2
            </span>
          </div>

          {/* Mode Pelatihan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Mode Pelatihan</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                config.mode === 'real'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {config.mode === 'real' ? 'TensorFlow AI Asli' : 'Simulasi Ringan'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfig(c => ({ ...c, mode: 'real' }))}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  config.mode === 'real'
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md shadow-indigo-500/20 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Zap size={14} className={config.mode === 'real' ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>Pelatihan Nyata</span>
                </div>
                <p className="text-[10px] leading-tight text-slate-400">
                  Melatih TensorFlow dengan 1.134 dataset & simpan model ke disk.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setConfig(c => ({ ...c, mode: 'simulation' }))}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  config.mode === 'simulation'
                    ? 'bg-amber-950/50 border-amber-500/80 shadow-md shadow-amber-500/20 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Sparkles size={14} className={config.mode === 'simulation' ? 'text-amber-400' : 'text-slate-500'} />
                  <span>Simulasi Demo</span>
                </div>
                <p className="text-[10px] leading-tight text-slate-400">
                  Visualisasi grafik cepat tanpa beban komputasi CPU/GPU laptop.
                </p>
              </button>
            </div>
          </div>

          {/* Epoch Slider */}
          <Slider
            label="Total Epoch (Iterasi)"
            min={5}
            max={30}
            value={config.epochs}
            onChange={v => setConfig(c => ({ ...c, epochs: v }))}
            desc="Saran: 10 - 14"
          />

          {/* Batch Size Selection */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Batch Size</span>
              <span className="text-slate-400 text-[11px] font-mono">Sampel per step</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[8, 16, 32, 64].map(bs => (
                <button
                  key={bs}
                  type="button"
                  onClick={() => setConfig(c => ({ ...c, batch_size: bs }))}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    config.batch_size === bs
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {bs}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Rate Selection */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Learning Rate (Adam)</span>
              <span className="text-slate-400 text-[11px] font-mono">Kecepatan belajar</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0.01, 0.001, 0.0001].map(lr => (
                <button
                  key={lr}
                  type="button"
                  onClick={() => setConfig(c => ({ ...c, learning_rate: lr }))}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    config.learning_rate === lr
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {lr}
                </button>
              ))}
            </div>
          </div>

          {/* Training Buttons */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            {!isTraining ? (
              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold py-3 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95"
              >
                <Play size={15} />
                <span>{loading ? 'Menyiapkan Pipeline...' : config.mode === 'real' ? 'Mulai Pelatihan Nyata (AI)' : 'Mulai Simulasi Demo'}</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold py-3 rounded-2xl shadow-lg shadow-rose-600/30 transition-all animate-pulse"
              >
                <Square size={15} />
                <span>Hentikan Proses Training</span>
              </button>
            )}

            <button
              onClick={fetchStatus}
              className="w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-xs py-2 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Perbarui Status Real-Time</span>
            </button>

            {/* Note & cancel notice */}
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-semibold">💡 Tips:</span> Anda bisa menghentikan training kapan saja dengan mengklik tombol merah <strong className="text-rose-400">Hentikan Proses Training</strong>. Jika perangkat Anda terasa berat, Anda dapat beralih ke <strong>Simulasi Demo</strong>.
            </div>
          </div>
        </div>

        {/* Right: Real-time Graphs or Architecture & Readiness Guide */}
        <div className="lg:col-span-8 space-y-5">
          {/* Status Live Banner */}
          <div
            className={`rounded-3xl p-5 border flex items-start gap-4 transition-all shadow-xl ${
              isTraining
                ? 'bg-indigo-950/40 border-indigo-500/40'
                : isCompleted
                ? 'bg-emerald-950/30 border-emerald-500/30'
                : isError
                ? 'bg-rose-950/30 border-rose-500/30'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            {isCompleted ? (
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
            ) : isError ? (
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isTraining ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}>
                <BrainCircuit size={20} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-white text-sm font-bold">
                  {status?.message || 'Studio Pelatihan Model Siap'}
                </h3>
                {isTraining && (
                  <span className="text-indigo-400 font-mono font-bold text-xs bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30">
                    Epoch {status?.current_epoch || 1} / {status?.total_epochs || config.epochs}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-1">
                {isTraining
                  ? 'Sedang melakukan feed-forward, kalkulasi loss fungsi, dan optimasi gradien bobot model CNN...'
                  : isCompleted
                  ? `Pelatihan selesai dengan sukses. Akurasi evaluasi validasi terbaik mencapai: ${status?.best_accuracy ? status.best_accuracy.toFixed(1) + '%' : 'Tinggi'}.`
                  : 'Pilih mode dan hyperparameter di sebelah kiri lalu klik tombol Mulai Training.'}
              </p>
              {status?.model_saved && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    File Model: {status.model_saved}
                  </span>
                  <a
                    href="/admin/models"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 flex items-center gap-1"
                  >
                    Buka Model Management &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar (Visible during or after training) */}
          {(isTraining || isCompleted) && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Total Progres Pelatihan</span>
                <span className="text-indigo-400 font-mono font-bold">{status?.progress ?? 0}% Selesai</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                  }`}
                  style={{ width: `${status?.progress ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Live Charts (If training has curve data) */}
          {chartData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Accuracy Chart */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <p className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 size={15} className="text-indigo-400" /> Kurva Akurasi (%)
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gTrain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="epoch" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip {...CHART_STYLE} formatter={v => `${v?.toFixed(1)}%`} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="train_acc" name="Train Acc" stroke="#8b5cf6" fill="url(#gTrain)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="val_acc" name="Val Acc" stroke="#22d3ee" fill="url(#gVal)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Loss Chart */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <p className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 size={15} className="text-amber-400" /> Kurva Nilai Loss
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gTL" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gVL" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="epoch" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip {...CHART_STYLE} formatter={v => v?.toFixed(4)} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="train_loss" name="Train Loss" stroke="#f59e0b" fill="url(#gTL)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="val_loss" name="Val Loss" stroke="#f43f5e" fill="url(#gVL)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Idle Spec Cards: Architecture Breakdown & Training Readiness */
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-white text-sm font-bold">Spesifikasi Arsitektur Model CNN (MobileNetV2)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <p className="text-slate-400 text-[11px] mb-1 font-medium">Base Backbone</p>
                    <p className="text-white font-bold font-mono">MobileNetV2 (ImageNet Pretrained)</p>
                    <p className="text-slate-500 text-[10px] mt-1">Inverted Residual & Linear Bottleneck</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <p className="text-slate-400 text-[11px] mb-1 font-medium">Resolusi Input & Normalisasi</p>
                    <p className="text-white font-bold font-mono">224 × 224 × 3 px (Rescale 1/255.0)</p>
                    <p className="text-slate-500 text-[10px] mt-1">Format warna standard RGB</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <p className="text-slate-400 text-[11px] mb-1 font-medium">Head Classifier Ber-regularisasi Tinggi</p>
                    <p className="text-white font-bold font-mono text-[11px]">BatchNorm → Drop(0.4) → Dense(128, L2) → Drop(0.3)</p>
                    <p className="text-slate-500 text-[10px] mt-1">L2 Weight Decay + Dual Dropout proteksi anti-overfitting</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <p className="text-slate-400 text-[11px] mb-1 font-medium">Strategi Pelatihan & Proteksi</p>
                    <p className="text-white font-bold font-mono text-[11px]">Selective 12-Layer Tuning + Label Smoothing 0.1</p>
                    <p className="text-slate-500 text-[10px] mt-1">Hanya 12 layer teratas diadaptasi, model terbaik otomatis dipulihkan</p>
                  </div>
                </div>
              </div>

              {/* Training Dataset Readiness Checklist */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white text-sm font-bold">Kesiapan Dataset Pelatihan (1.134 Citra)</h3>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    ✓ Terverifikasi
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-[10px]">Dermatitis</p>
                    <p className="text-white font-bold font-mono text-sm mt-0.5">213</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-[10px]">Flea Allergy</p>
                    <p className="text-white font-bold font-mono text-sm mt-0.5">227</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-[10px]">Ringworm</p>
                    <p className="text-white font-bold font-mono text-sm mt-0.5">226</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-[10px]">Scabies</p>
                    <p className="text-white font-bold font-mono text-sm mt-0.5">233</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-[10px]">Healthy</p>
                    <p className="text-white font-bold font-mono text-sm mt-0.5">235</p>
                  </div>
                </div>

                <p className="text-slate-400 text-xs mt-4 leading-relaxed">
                  Data latih dipecah otomatis menggunakan rasio <strong>80% Train : 20% Validation</strong> dengan augmentasi gambar (Random Flip, Rotation 15°, dan Zoom) untuk memaksimalkan generalisasi model terhadap lesi klinis di lapangan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
