import { useEffect, useRef, useState } from 'react';
import { Zap, Target, Pill, History, HeartPulse, Layers, BrainCircuit } from 'lucide-react';

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Zap, title: 'Diagnosa Cepat', description: 'Upload foto dan dapatkan hasil analisis dalam hitungan detik.', color: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-50' },
    { icon: Target, title: 'Akurasi Tinggi', description: 'CNN Model MobileNetV2 dengan tingkat akurasi 75% yang telah dilatih dan dioptimalkan dengan dataset klinis.', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { icon: Pill, title: 'Rekomendasi Obat', description: 'Dapatkan saran pengobatan yang tepat berdasarkan hasil diagnosa.', color: 'from-teal-400 to-teal-600', bgColor: 'bg-teal-50' },
    { icon: History, title: 'Riwayat Diagnosa', description: 'Simpan dan pantau perkembangan kondisi kucing Anda.', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50' },
    { icon: HeartPulse, title: 'Panduan Pertolongan Pertama', description: 'Langkah sanitasi darurat, pencegahan penularan (zoonosis), dan isolasi mandiri yang aman sebelum dibawa ke klinik hewan.', color: 'from-rose-400 to-red-500', bgColor: 'bg-rose-50' },
    { icon: Layers, title: 'Klasifikasi 5 Kondisi', description: 'Mendeteksi 5 kondisi kulit: Dermatitis, Flea Allergy, Healthy (Sehat), Ringworm (Kurap), dan Scabies (Kudis).', color: 'from-indigo-400 to-indigo-600', bgColor: 'bg-indigo-50' },
  ];

  return (
    <section id="features" ref={sectionRef} className="py-10 sm:py-14 lg:py-16 2xl:py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-6 sm:mb-8 2xl:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <BrainCircuit className="w-4 h-4" />
            <span>Fitur Unggulan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">
            Teknologi AI Canggih untuk{' '}
            <span className="text-gradient">Kesehatan Kucing</span>
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">
            Kami menggabungkan kecerdasan buatan dengan keahlian veteriner untuk memberikan solusi diagnosa yang akurat.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 xl:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-2xl p-5 sm:p-6 2xl:p-8 shadow-md hover:shadow-xl transition-all duration-500 card-hover ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-5 transform group-hover:scale-105 transition-all duration-500`}>
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              <div className={`absolute -bottom-2 -right-2 w-24 h-24 ${feature.bgColor} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />
            </div>
          ))}
        </div>

        <div className={`mt-16 text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-slate-600 mb-4">Ingin mencoba fitur-fitur unggulan kami?</p>
          <a
            href="#demo"
            onClick={(e) => { e.preventDefault(); document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Coba Demo Sekarang
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Features;
