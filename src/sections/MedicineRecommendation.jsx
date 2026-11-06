import { useEffect, useRef, useState } from 'react';
import { Pill, Shield, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const MedicineRecommendation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
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
      name: 'Dermatitis', icon: '🔴', color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50',
      description: 'Peradangan kulit yang menyebabkan kemerahan, gatal, dan iritasi.',
      medicines: [
        { name: 'Hydrocortisone Cream 1%', type: 'Topikal', dosage: '2-3x sehari', duration: '5-7 hari', note: 'Oleskan tipis pada area meradang, hindari area mata' },
        { name: 'Prednisolone', type: 'Oral', dosage: '1-2 mg/kg per hari', duration: '5-10 hari', note: 'Hanya dengan resep dokter hewan' },
        { name: 'Chlorpheniramine', type: 'Oral', dosage: '2-4 mg per kucing, 2x sehari', duration: '7-14 hari', note: 'Antihistamin untuk mengurangi gatal' },
        { name: 'Cetirizine', type: 'Oral', dosage: '5 mg per kucing, 1x sehari', duration: '7-14 hari', note: 'Antihistamin generasi kedua' },
        { name: 'Shampoo Medis (Chlorhexidine)', type: 'Topikal', dosage: '2x seminggu', duration: '3-4 minggu', note: 'Biarkan 5-10 menit sebelum dibilas' },
        { name: 'Omega-3 Supplement', type: 'Suplemen', dosage: 'Sesuai berat badan', duration: 'Jangka panjang', note: 'Membantu memperbaiki kondisi kulit dari dalam' },
      ],
    },
    {
      name: 'Flea Allergy Dermatitis', icon: '🟠', color: 'from-orange-500 to-amber-600', bgColor: 'bg-orange-50',
      description: 'Reaksi alergi parah terhadap gigitan kutu.',
      medicines: [
        { name: 'Selamectin (Revolution)', type: 'Spot-on', dosage: 'Sesuai berat badan', duration: 'Setiap bulan', note: 'Aplikasikan di pangkal leher' },
        { name: 'Fipronil (Frontline)', type: 'Spot-on', dosage: 'Sesuai berat badan', duration: 'Setiap bulan', note: 'Efektif membunuh kutu dewasa dan telur' },
        { name: 'Imidacloprid (Advantage)', type: 'Spot-on', dosage: 'Sesuai berat badan', duration: 'Setiap bulan', note: 'Mulai bekerja dalam 12 jam' },
        { name: 'Prednisolone', type: 'Oral', dosage: '1-2 mg/kg per hari', duration: '5-7 hari', note: 'Untuk meredakan reaksi alergi akut' },
        { name: 'Dexamethasone', type: 'Injeksi', dosage: 'Sesuai dokter', duration: 'Dosis tunggal', note: 'Hanya oleh dokter hewan untuk kasus parah' },
        { name: 'Lufenuron (Program)', type: 'Oral', dosage: 'Sesuai berat badan', duration: 'Setiap bulan', note: 'Mencegah perkembangan telur kutu' },
      ],
    },
    {
      name: 'Ringworm (Kurap)', icon: '🟡', color: 'from-yellow-500 to-lime-600', bgColor: 'bg-yellow-50',
      description: 'Infeksi jamur dermatofita yang menyebabkan bercak melingkar dan kerontokan bulu.',
      medicines: [
        { name: 'Itraconazole', type: 'Oral', dosage: '5-10 mg/kg per hari', duration: '3-4 minggu', note: 'Pantau fungsi liver, berikan dengan makanan' },
        { name: 'Griseofulvin', type: 'Oral', dosage: '25-50 mg/kg per hari', duration: '4-6 minggu', note: 'Berikan dengan makanan berlemak' },
        { name: 'Terbinafine', type: 'Oral', dosage: '30-40 mg/kg per hari', duration: '4-6 minggu', note: 'Alternatif jika itraconazole tidak tersedia' },
        { name: 'Miconazole Cream 2%', type: 'Topikal', dosage: '2x sehari', duration: '4-6 minggu', note: 'Gunakan sarung tangan saat mengoles' },
        { name: 'Clotrimazole Cream', type: 'Topikal', dosage: '2-3x sehari', duration: '4-6 minggu', note: 'Kombinasikan dengan terapi oral' },
        { name: 'Lime Sulfur Dip', type: 'Topikal', dosage: '1x seminggu', duration: '4-6 minggu', note: 'Encerkan 1:16, hindari kontak mata' },
        { name: 'Shampoo Antijamur (Ketoconazole)', type: 'Topikal', dosage: '2x seminggu', duration: '4-6 minggu', note: 'Biarkan 5 menit sebelum dibilas' },
      ],
    },
    {
      name: 'Scabies (Kudis)', icon: '🟤', color: 'from-amber-700 to-yellow-800', bgColor: 'bg-amber-50',
      description: 'Infeksi tungau Notoedres cati yang menyebabkan gatal ekstrem dan kerontokan bulu.',
      medicines: [
        { name: 'Ivermectin', type: 'Injeksi/Oral', dosage: '0.2-0.3 mg/kg', duration: 'Ulang tiap 2 minggu (3x)', note: 'Konsultasi dokter, hati-hati pada kucing sensitif' },
        { name: 'Selamectin (Revolution)', type: 'Spot-on', dosage: 'Sesuai berat badan', duration: 'Ulang tiap 2-4 minggu', note: 'Pilihan lebih aman dibanding ivermectin' },
        { name: 'Doramectin', type: 'Injeksi', dosage: '0.2 mg/kg', duration: 'Ulang tiap 2 minggu', note: 'Hanya oleh dokter hewan' },
        { name: 'Lime Sulfur Dip', type: 'Topikal', dosage: '1x seminggu', duration: '4-6 minggu', note: 'Encerkan 1:16, efektif membunuh tungau' },
        { name: 'Amitraz', type: 'Topikal', dosage: 'Sesuai dokter', duration: 'Sesuai kondisi', note: 'Hanya dengan pengawasan dokter hewan' },
        { name: 'Prednisolone', type: 'Oral', dosage: '0.5-1 mg/kg per hari', duration: '3-5 hari', note: 'Hanya untuk meredakan gatal parah sementara' },
        { name: 'Antibiotik (Amoxicillin)', type: 'Oral', dosage: '10-20 mg/kg, 2x sehari', duration: '7-14 hari', note: 'Jika ada infeksi sekunder bakteri' },
      ],
    },
    {
      name: 'Healthy (Sehat)', icon: '🟢', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50',
      description: 'Kulit kucing dalam kondisi sehat. Cukup perawatan rutin.',
      medicines: [
        { name: 'Omega-3 & Omega-6', type: 'Suplemen', dosage: 'Sesuai berat badan', duration: 'Rutin harian', note: 'Menjaga kilap bulu dan kesehatan kulit' },
        { name: 'Vitamin E', type: 'Suplemen', dosage: '50-100 IU per hari', duration: 'Rutin harian', note: 'Antioksidan untuk kesehatan kulit' },
        { name: 'Biotin', type: 'Suplemen', dosage: 'Sesuai produk', duration: 'Rutin harian', note: 'Mendukung pertumbuhan bulu yang sehat' },
        { name: 'Shampoo Kucing Rutin', type: 'Topikal', dosage: '1x sebulan', duration: 'Rutin', note: 'Gunakan shampoo khusus kucing' },
        { name: 'Antiparasit Pencegahan', type: 'Spot-on', dosage: 'Sesuai berat badan', duration: 'Setiap bulan', note: 'Pencegahan kutu dan tungau secara rutin' },
      ],
    },
  ];

  return (
    <section id="medicine" ref={sectionRef} className="py-10 sm:py-14 lg:py-16 2xl:py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-t from-blue-50/50 to-transparent" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-teal-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-6 sm:mb-8 2xl:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 rounded-full text-teal-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Pill className="w-4 h-4" />
            <span>Rekomendasi Pengobatan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">
            Pilihan <span className="text-gradient">Pengobatan</span> per Penyakit
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">Rekomendasi obat berdasarkan hasil diagnosa penyakit kulit kucing Anda.</p>
        </div>

        <div className="space-y-4">
          {diseases.map((disease, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`p-4 sm:p-5 2xl:p-6 bg-gradient-to-r ${disease.color} cursor-pointer`}
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl sm:text-4xl">{disease.icon}</span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{disease.name}</h3>
                      <p className="text-white/80 text-xs sm:text-sm">{disease.medicines.length} rekomendasi obat</p>
                    </div>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                    {expandedCard === index ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                  </div>
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-500 ${expandedCard === index ? 'max-h-[1200px]' : 'max-h-0'}`}>
                <div className="p-4 sm:p-5 2xl:p-6">
                  <p className="text-slate-600 mb-6">{disease.description}</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {disease.medicines.map((med, i) => (
                      <div key={i} className={`p-4 ${disease.bgColor} rounded-xl border border-slate-100`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-800 text-sm">{med.name}</h4>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${disease.color} whitespace-nowrap`}>{med.type}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                          <div><span className="text-slate-500">Dosis:</span><p className="text-slate-700 font-medium">{med.dosage}</p></div>
                          <div><span className="text-slate-500">Durasi:</span><p className="text-slate-700 font-medium">{med.duration}</p></div>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600">{med.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {expandedCard !== index && (
                <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-5">
                  <div className="flex flex-wrap gap-2">
                    {disease.medicines.map((med, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">{med.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-amber-800 mb-2">Peringatan Penting</h4>
              <p className="text-amber-700 text-sm leading-relaxed">
                Informasi pengobatan di atas hanya untuk referensi. Selalu konsultasikan dengan dokter hewan
                sebelum memberikan obat apa pun kepada kucing Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedicineRecommendation;
