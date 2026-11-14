import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Activity, Pill } from 'lucide-react';
import { getDatasetInfo } from '@/services/api';

const Statistics = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ accuracy: '0,00', diseases: 0, protocols: 0 });
  const [targets, setTargets] = useState({ accuracy: 74.12, diseases: 5, protocols: 15 });
  const sectionRef = useRef(null);

  useEffect(() => {
    // Sinkronkan angka akurasi secara dinamis dengan model aktif di backend
    getDatasetInfo()
      .then((data) => {
        if (data && data.accuracy) {
          setTargets((prev) => ({
            ...prev,
            accuracy: Number(data.accuracy) || 74.12,
            diseases: data.total_classes || 5,
            protocols: 15,
          }));
        }
      })
      .catch(() => {
        // Fallback default sesuai evaluasi model_kulit_kucing_v2_final.keras (74.12%)
        setTargets({ accuracy: 74.12, diseases: 5, protocols: 15 });
      });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentAcc = targets.accuracy * easeOut;
        setCounts({
          accuracy: step >= steps ? '74,12' : currentAcc.toFixed(2).replace('.', ','),
          diseases: Math.round(targets.diseases * easeOut),
          protocols: Math.round(targets.protocols * easeOut),
        });
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [isVisible, targets]);

  const stats = [
    {
      label: 'Akurasi Diagnosa',
      value: counts.accuracy,
      suffix: '%',
      icon: TrendingUp,
      description: 'Tingkat keakuratan sistem CNN kami',
      color: 'from-green-400 to-emerald-600',
      ringColor: '#10b981',
      percentage: typeof counts.accuracy === 'string' ? parseFloat(counts.accuracy.replace(',', '.')) : counts.accuracy, // 74,12% terisi
    },
    {
      label: 'Kondisi Dataset',
      value: counts.diseases,
      suffix: ' Kondisi',
      icon: Activity,
      description: 'Dermatitis, Flea Allergy, Ringworm, Scabies, Healthy',
      color: 'from-blue-400 to-blue-600',
      ringColor: '#3b82f6',
      percentage: 100, // 5 dari 5 kondisi terlatih penuh
    },
    {
      label: 'Panduan Edukasi Obat',
      value: counts.protocols,
      suffix: '+',
      icon: Pill,
      description: 'Protokol terapi obat topikal, oral & pertolongan pertama',
      color: 'from-purple-400 to-purple-600',
      ringColor: '#8b5cf6',
      percentage: 100, // Lingkaran terisi penuh
    },
  ];

  const RADIUS = 48;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const calculateStrokeDashoffset = (percent) => {
    const clamped = Math.max(0, Math.min(percent >= 100 ? 99.9 : percent, 100));
    return CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  };

  return (
    <section ref={sectionRef} className="py-10 sm:py-14 lg:py-16 2xl:py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-6 sm:mb-8 2xl:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-white mb-2 sm:mb-4">
            Statistik <span className="text-gradient">CatSkin AI</span>
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-300">Angka-angka yang menunjukkan komitmen kami dalam memberikan layanan diagnosa terbaik.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-7 2xl:p-8 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-5 sm:mb-6 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 128 128">
                    {/* Background Ring Track */}
                    <circle
                      cx="64"
                      cy="64"
                      r={RADIUS}
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="7"
                    />
                    {/* Foreground Animated Progress Ring */}
                    <circle
                      cx="64"
                      cy="64"
                      r={RADIUS}
                      fill="none"
                      stroke={stat.ringColor}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={calculateStrokeDashoffset(stat.percentage)}
                      className="transition-all duration-1000 ease-out"
                      style={{
                        filter: `drop-shadow(0 0 6px ${stat.ringColor}50)`,
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      <stat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    <span className="text-xl sm:text-2xl text-slate-400">{stat.suffix}</span>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-slate-200 mb-1">{stat.label}</div>
                  <div className="text-xs sm:text-sm text-slate-400">{stat.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-16 text-center transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-slate-300 mb-6">Manfaatkan kecerdasan buatan untuk deteksi dini dan panduan perawatan tepat bagi kucing kesayangan Anda.</p>
          <a
            href="#demo"
            onClick={(e) => { e.preventDefault(); document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-full hover:from-blue-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Mulai Diagnosa Sekarang
            <TrendingUp className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
