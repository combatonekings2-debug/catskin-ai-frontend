import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Shield, Cpu, Database, Stethoscope, Activity } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: '1.134', label: 'Citra Dataset (Kaggle & Roboflow)', icon: Database },
    { value: '5', label: 'Kelas Kondisi Kulit', icon: Shield },
    { value: 'MobileNetV2', label: 'Arsitektur CNN (Uji 75.2%)', icon: Cpu },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[100dvh] flex flex-col justify-center pt-24 pb-12 sm:pt-28 sm:pb-12 md:pt-32 md:pb-16 lg:min-h-[calc(100vh-2.5rem)] lg:pt-28 lg:pb-12 xl:pt-32 xl:pb-16 2xl:min-h-screen 2xl:pt-36 2xl:pb-20 overflow-hidden neural-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-100/50 to-transparent rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 items-center">
          <div className={`space-y-4 sm:space-y-5 lg:space-y-5 xl:space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-blue-100 rounded-full text-blue-700 text-xs sm:text-sm font-medium animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Powered by CNN MobileNetV2</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-slate-800 leading-tight animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Diagnosa Penyakit Kulit{' '}
              <span className="text-gradient">Kucing</span> & Rekomendasi{' '}
              <span className="text-gradient">Obat</span>
            </h1>

            <p className="text-xs sm:text-sm lg:text-sm xl:text-base text-slate-600 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
              Sistem berbasis web menggunakan <strong>Convolutional Neural Network (CNN)</strong> dengan arsitektur <strong>MobileNetV2</strong> untuk
              mengidentifikasi kondisi kulit kucing dan memberikan rekomendasi obat sebagai panduan penanganan awal.
            </p>

            <div className="flex flex-wrap gap-2.5 sm:gap-3.5 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <Button
                onClick={() => scrollToSection('#demo')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-full px-5 sm:px-6 xl:px-8 py-3.5 sm:py-4 xl:py-5 text-xs sm:text-sm xl:text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                Mulai Diagnosa Sekarang
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => scrollToSection('#how-it-works')}
                variant="outline"
                size="lg"
                className="rounded-full px-5 sm:px-6 xl:px-8 py-3.5 sm:py-4 xl:py-5 text-xs sm:text-sm xl:text-base border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
              >
                <Play className="w-4 h-4 mr-1.5" />
                Pelajari Alur Sistem
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 pt-1 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0">
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-[11px] sm:text-xs text-slate-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="relative max-w-[320px] sm:max-w-[360px] lg:max-w-[380px] xl:max-w-[420px] 2xl:max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-400 rounded-3xl blur-2xl opacity-30 animate-pulse-glow" />
              <div className="relative bg-white rounded-3xl p-2.5 sm:p-3 xl:p-4 shadow-2xl">
                <img
                  src="/images/hero-cat.jpg"
                  alt="Kucing sehat sebagai ilustrasi diagnosa CatSkin AI"
                  loading="eager"
                  className="w-full aspect-square rounded-2xl object-cover shadow-inner"
                />
                <div className="absolute -left-2 sm:-left-4 lg:-left-5 top-1/4 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-100 flex items-center justify-center">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-800">MobileNetV2</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">Akurasi Uji 75.2%</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-2 sm:-right-4 bottom-1/4 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-800">Validasi Klinis</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">(Dokter Hewan)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
