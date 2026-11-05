import { useEffect, useRef, useState } from 'react';
import { Upload, Brain, FileCheck, Pill } from 'lucide-react';

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 4);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const steps = [
    { number: '01', icon: Upload, title: 'Upload Foto', description: 'Ambil foto jelas area kulit kucing yang bermasalah dan upload ke sistem kami.', image: '/images/step-upload.jpg', color: 'from-blue-500 to-blue-600' },
    { number: '02', icon: Brain, title: 'AI Analisis', description: 'Sistem CNN kami akan menganalisis pola dan fitur visual pada foto.', image: '/images/step-analysis.jpg', color: 'from-teal-500 to-teal-600' },
    { number: '03', icon: FileCheck, title: 'Hasil Diagnosa', description: 'Dapatkan hasil diagnosa dengan tingkat kepercayaan dan informasi detail.', image: '/images/step-result.jpg', color: 'from-purple-500 to-purple-600' },
    { number: '04', icon: Pill, title: 'Rekomendasi Obat', description: 'Terima saran pengobatan yang sesuai termasuk jenis obat dan dosis.', image: '/images/step-medicine.jpg', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-10 sm:py-14 lg:py-16 2xl:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-6 sm:mb-8 2xl:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 rounded-full text-teal-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Brain className="w-4 h-4" />
            <span>Proses Sederhana</span>
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">
            Cara Kerja <span className="text-gradient">Sistem</span>
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">Hanya dengan 4 langkah mudah, Anda bisa mendapatkan diagnosa penyakit kulit kucing.</p>
        </div>

        <div className="space-y-8 sm:space-y-10 2xl:space-y-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`space-y-4 sm:space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg`}>
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">{step.title}</h3>
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed">{step.description}</p>
                <div className="flex items-center gap-2">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        i === activeStep ? 'w-8 bg-gradient-to-r from-blue-500 to-teal-500' : i < activeStep ? 'w-2 bg-teal-400' : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <div className="relative bg-slate-100 rounded-3xl overflow-hidden shadow-xl">
                    <img src={step.image} alt={step.title} className="w-full h-60 sm:h-72 2xl:h-80 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="text-white">
                        <div className="text-xs sm:text-sm opacity-80">Langkah {step.number}</div>
                        <div className="text-sm sm:text-base font-semibold">{step.title}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
