import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Stethoscope, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DiseaseTypes = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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

  const diseases = [
    {
      name: 'Dermatitis',
      tabLabel: 'Dermatitis',
      scientificName: 'Feline Dermatitis',
      description: 'Peradangan kulit pada kucing yang disebabkan oleh reaksi alergi, iritan eksternal, atau infeksi sekunder.',
      symptoms: ['Kulit kemerahan', 'Gatal berlebihan / pruritus', 'Kulit mengelupas', 'Kerak & luka lecet'],
      severity: 'Sedang',
      image: '/images/disease-dermatitis.jpg',
      color: 'from-blue-500 to-indigo-600',
      treatment: 'Krim kortison/hidrokortison 1%, antihistamin, hindari paparan alergen, pembersihan rutin',
    },
    {
      name: 'Flea Allergy',
      tabLabel: 'Flea Allergy',
      scientificName: 'Flea Allergy Dermatitis (FAD)',
      description: 'Reaksi hipersensitivitas alergi terhadap air liur kutu kucing yang memicu rasa gatal intensif dan peradangan parah.',
      symptoms: ['Gatal parah di area punggung/ekor', 'Bulu rontok & botak', 'Luka garukan basah', 'Kotoran kutu hitam'],
      severity: 'Tinggi',
      image: '/images/disease-flea-allergy.jpg',
      color: 'from-red-500 to-rose-600',
      treatment: 'Obat anti-kutu Spot-on (Fluralaner / Fipronil), pembersihan lingkungan, antiseptik gatal',
    },
    {
      name: 'Ringworm (Kurap)',
      tabLabel: 'Ringworm',
      scientificName: 'Dermatophytosis (Microsporum canis)',
      description: 'Infeksi mikosis jamur dermatofita yang menyerang keratin kulit, folikel bulu, dan kuku kucing (bersifat zoonosis).',
      symptoms: ['Lesi melingkar (ring-like)', 'Bulu patah membentuk pola pitak', 'Kulit berkerak & bersisik', 'Gatal ringan hingga sedang'],
      severity: 'Sedang',
      image: '/images/disease-ringworm.jpg',
      color: 'from-amber-500 to-orange-600',
      treatment: 'Antijamur topikal (Miconazole / Ketoconazole), antijamur oral (Itraconazole), isolasi kucing',
    },
    {
      name: 'Scabies (Kudis)',
      tabLabel: 'Scabies',
      scientificName: 'Notoedric Mange (Notoedres cati)',
      description: 'Penyakit kulit yang sangat menular akibat infestasi tungau mikroskopis yang menggali terowongan di bawah epidermis.',
      symptoms: ['Gatal luar biasa hebat', 'Kerak tebal abu-abu di telinga & wajah', 'Kulit berkerut menebal', 'Kerontokan bulu parah'],
      severity: 'Tinggi',
      image: '/images/disease-allergy.jpg',
      color: 'from-purple-500 to-violet-600',
      treatment: 'Akarisida (Selamectin spot-on / Ivermectin resep dokter hewan), mandi sulfur, sterilisasi kandang',
    },
    {
      name: 'Healthy (Sehat)',
      tabLabel: 'Healthy',
      scientificName: 'Normal Healthy Skin',
      description: 'Kondisi kulit dan folikel bulu kucing dalam keadaan normal, bersih, berkilau, dan bebas dari lesi patologis.',
      symptoms: ['Bulu berkilau & lebat', 'Kulit bersih tanpa ruam', 'Tidak ada gatal abnormal', 'Kucing aktif dan bugar'],
      severity: 'Normal',
      image: '/images/disease-healthy.jpg',
      color: 'from-green-500 to-emerald-600',
      treatment: 'Pertahankan nutrisi omega-3 & 6, rutin grooming dan sisir bulu, vaksinasi terjadwal',
    },
  ];

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % diseases.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + diseases.length) % diseases.length);

  const getCardStyle = (index) => {
    const diff = index - activeIndex;
    const normalizedDiff = ((diff + diseases.length) % diseases.length);
    if (normalizedDiff === 0) return { transform: 'translateX(0) scale(1)', opacity: 1, zIndex: 10 };
    if (normalizedDiff === 1 || normalizedDiff === -diseases.length + 1) return { transform: 'translateX(60%) scale(0.85)', opacity: 0.6, zIndex: 5 };
    if (normalizedDiff === diseases.length - 1 || normalizedDiff === -1) return { transform: 'translateX(-60%) scale(0.85)', opacity: 0.6, zIndex: 5 };
    return { transform: 'translateX(0) scale(0.7)', opacity: 0, zIndex: 0 };
  };

  return (
    <section id="diseases" ref={sectionRef} className="py-10 sm:py-14 lg:py-16 2xl:py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-100/40 to-transparent rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-6 sm:mb-8 2xl:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 rounded-full text-rose-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Stethoscope className="w-4 h-4" />
            <span>Dataset Penyakit</span>
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">
            5 Jenis Kondisi yang{' '}
            <span className="text-gradient">Dapat Dideteksi</span>
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">Sistem CNN kami dilatih dengan dataset 5 jenis kondisi kulit kucing.</p>
        </div>

        <div className={`relative h-[440px] sm:h-[480px] 2xl:h-[600px] transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            {diseases.map((disease, index) => (
              <div
                key={index}
                className="absolute w-full max-w-md 2xl:max-w-lg transition-all duration-500 ease-out"
                style={getCardStyle(index)}
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="relative h-44 sm:h-52 2xl:h-60">
                    <img src={disease.image} alt={disease.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${disease.color}`}>
                      {disease.severity === 'Normal' ? 'Sehat' : disease.severity}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">{disease.name}</h3>
                      <p className="text-white/70 text-xs sm:text-sm italic">{disease.scientificName}</p>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{disease.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        Gejala:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {disease.symptoms.map((symptom, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{symptom}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-slate-600">Pengobatan:</span>
                          <p className="text-xs text-slate-700">{disease.treatment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors">
            <ChevronRight className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {diseases.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-gradient-to-r from-blue-500 to-teal-500' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
            />
          ))}
        </div>

        <div className={`mt-12 grid grid-cols-2 md:grid-cols-5 gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {diseases.map((disease, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${index === activeIndex ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${disease.color} flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white text-lg font-bold">{index + 1}</span>
              </div>
              <p className={`text-sm font-medium text-center ${index === activeIndex ? 'text-blue-700 font-semibold' : 'text-slate-600'}`}>
                {disease.tabLabel || disease.name}
              </p>
            </button>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Coba Deteksi Sekarang
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DiseaseTypes;
