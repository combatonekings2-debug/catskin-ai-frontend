import { useState, useEffect } from 'react';
import {
  Stethoscope, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube,
  Camera, AlertTriangle, HelpCircle, ChevronRight, X, Sparkles, CheckCircle2,
  Info, ExternalLink, ShieldAlert, Heart, ChevronDown
} from 'lucide-react';
import { getSiteSettings } from '../services/api';

const DEFAULT_SETTINGS = {
  site_name: 'CatSkin AI',
  footer_description: 'Sistem diagnosa penyakit kulit kucing berbasis AI dengan CNN untuk hasil yang akurat dan terpercaya.',
  contact: {
    address: 'Jl. Teknologi No. 123, Kota Digital, Indonesia 40123',
    phone: '+62 812-3456-7890',
    email: 'support@catskin.ai'
  },
  social_links: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com'
  },
  education_menu: {
    title: 'Edukasi Kucing'
  },
  copyright_text: `© ${new Date().getFullYear()} CatSkin AI. All rights reserved.`,
  credit_text: 'Dibuat dengan ❤️ untuk kesehatan kucing kesayangan Anda.'
};

const FAQ_ITEMS = [
  {
    q: 'Apakah hasil diagnosa CatSkin AI bisa menggantikan dokter hewan?',
    a: 'Tidak. CatSkin AI dirancang sebagai sarana deteksi dini dan edukasi pertolongan pertama (skrining awal) berbasis model CNN dengan akurasi validasi 75.22%. Untuk penetapan diagnosis definitif, resep antibiotik/antijamur keras, dan tindakan medis lanjut, konsultasikan selalu dengan dokter hewan berizin.'
  },
  {
    q: 'Bagaimana cara sistem AI menganalisis penyakit kulit kucing?',
    a: 'Sistem menggunakan arsitektur Deep Learning Convolutional Neural Network (CNN) yang telah dilatih mengenali pola visual, tekstur lesi, kebotakan (alopesia), kerak, dan kemerahan dari 5 kategori kulit: Dermatitis, Flea Allergy Dermatitis (FAD), Healthy (Sehat), Ringworm, dan Scabies.'
  },
  {
    q: 'Mengapa foto saya ditolak atau terdeteksi bukan kulit kucing?',
    a: 'CatSkin AI dilengkapi filter cerdas Out-of-Distribution (OOD) Validator. Filter ini memastikan foto yang diunggah benar-benar bagian kulit atau bulu kucing yang terkena lesi, bukan foto manusia, ruangan, hewan lain, atau foto dengan pencahayaan terlalu gelap/buram, guna mencegah kesalahan diagnosa.'
  },
  {
    q: 'Apakah rekomendasi obat di website ini aman langsung digunakan?',
    a: 'Rekomendasi obat yang kami tampilkan mengacu pada panduan dokter hewan berlisensi sebagai pertolongan pertama dan perawatan sanitasi luar (misal: membersihkan area dengan antiseptik aman hewan atau mengisolasi kucing). Obat sistemik oral wajib diperoleh melalui resep dokter hewan.'
  },
  {
    q: 'Format gambar dan ukuran apa saja yang didukung?',
    a: 'Sistem mendukung format JPG, JPEG, PNG, dan WebP dengan ukuran file maksimal 5MB. Pastikan foto memiliki resolusi cukup dan fokus tajam pada area kulit yang bergejala.'
  }
];

const CLINIC_RED_FLAGS = [
  {
    title: 'Luka Bernanah & Berbau Menyengat',
    desc: 'Cairan kental berwarna kuning/kehijauan disertai bau busuk menandakan adanya infeksi sekunder bakteri berat yang berisiko menyebar ke jaringan dalam.'
  },
  {
    title: 'Penyebaran Agresif dalam 24–48 Jam',
    desc: 'Lesi atau kerak yang meluas sangat cepat ke area wajah, leher, telapak kaki, atau seluruh tubuh membutuhkan penanganan medis segera.'
  },
  {
    title: 'Kucing Demam, Lemas & Mogok Makan',
    desc: 'Infeksi kulit yang disertai gejala sistemik seperti suhu tubuh tinggi (>39.2°C), dehidrasi, lemas ekstrem (letargi), atau tidak mau makan lebih dari 24 jam.'
  },
  {
    title: 'Luka Robek Berdarah Akibat Garukan Ekstrem',
    desc: 'Garukan parah (sering akibat Scabies atau Flea Allergy akut) hingga kulit sobek terbuka lebar dan berdarah aktif, rentan mengalami sepsis atau infeksi darah.'
  },
  {
    title: 'Lesi Menyerang Area Mata atau Liang Telinga',
    desc: 'Infeksi jamur atau tungau yang mengenai kelopak mata, kornea, atau telinga bagian dalam dapat menyebabkan gangguan penglihatan atau infeksi telinga tengah (otitis).'
  }
];

const PHOTO_TIPS = [
  {
    num: '01',
    title: 'Pencahayaan Terang & Alami',
    desc: 'Gunakan cahaya matahari siang tidak langsung atau lampu ruangan yang terang. Hindari flash kamera berlebih yang bisa membuat lesi memutih/silau.'
  },
  {
    num: '02',
    title: 'Singkap Bulu di Sekitar Lesi',
    desc: 'Secara lembut singkap bulu yang menutupi area yang gatal/merah sehingga permukaan kulit dan tekstur kerak terlihat jelas di kamera.'
  },
  {
    num: '03',
    title: 'Jarak Optimal 10 – 15 cm',
    desc: 'Posisikan kamera smartphone dengan jarak sekitar 10 hingga 15 cm tegak lurus langsung menghadap ke titik lesi utama kulit kucing.'
  },
  {
    num: '04',
    title: 'Fokus Tajam & Tidak Buram (Blur)',
    desc: 'Ketuk layar pada bagian luka/kulit kucing untuk mengunci fokus kamera sebelum menekan tombol jepret. Pastikan tangan stabil saat memotret.'
  },
  {
    num: '05',
    title: 'Hindari Objek yang Menutupi',
    desc: 'Pastikan jari tangan, tali kekang, atau mainan tidak menutupi bagian luka agar sistem AI dapat menganalisis tekstur kulit dengan akurat.'
  }
];

const Footer = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeModal, setActiveModal] = useState(null); // 'photoTips' | 'clinicSigns' | 'faq' | null
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getSiteSettings().then((data) => {
      if (isMounted && data) {
        setSettings(prev => ({
          ...prev,
          ...data,
          contact: { ...prev.contact, ...(data.contact || {}) },
          social_links: { ...prev.social_links, ...(data.social_links || {}) },
          education_menu: { ...prev.education_menu, ...(data.education_menu || {}) }
        }));
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const scrollTo = (hash) => {
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEducationClick = (action) => {
    if (action === 'photoTips') {
      setActiveModal('photoTips');
    } else if (action === 'medicine') {
      scrollTo('#medicine');
    } else if (action === 'diseases') {
      scrollTo('#diseases');
    } else if (action === 'clinicSigns') {
      setActiveModal('clinicSigns');
    } else if (action === 'faq') {
      setActiveModal('faq');
    }
  };

  const quickLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Fitur', href: '#features' },
    { name: 'Cara Kerja', href: '#how-it-works' },
    { name: 'Demo Diagnosa', href: '#demo' },
    { name: '5 Penyakit Kulit', href: '#diseases' },
    { name: 'Rekomendasi Obat', href: '#medicine' },
  ];

  const educationLinks = [
    { name: 'Tips Foto Kulit Akurat', action: 'photoTips', badge: 'Panduan' },
    { name: 'Pertolongan Pertama Gatal', action: 'medicine', badge: 'Obat' },
    { name: 'Mengenal 5 Penyakit Kulit', action: 'diseases', badge: 'Penyakit' },
    { name: 'Kapan Harus ke Klinik Hewan', action: 'clinicSigns', badge: 'Penting' },
    { name: 'FAQ Diagnosa AI', action: 'faq', badge: 'Tanya Jawab' },
  ];

  const socialIcons = [
    { key: 'facebook', icon: Facebook, label: 'Facebook' },
    { key: 'twitter', icon: Twitter, label: 'Twitter / X' },
    { key: 'instagram', icon: Instagram, label: 'Instagram' },
    { key: 'youtube', icon: Youtube, label: 'Youtube' },
  ];

  return (
    <>
      <footer className="bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <span className="text-[20rem] font-bold text-white/[0.015] whitespace-nowrap">
            {settings.site_name || 'CatSkin AI'}
          </span>
        </div>

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 2xl:gap-12">
              {/* Kolom 1: Brand & Bio */}
              <div className="lg:col-span-1 space-y-5">
                <a
                  href="#hero"
                  onClick={(e) => { e.preventDefault(); scrollTo('#hero'); }}
                  className="flex items-center gap-2.5 group w-fit"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">
                    CatSkin<span className="text-blue-400">AI</span>
                  </span>
                </a>

                <p className="text-slate-400 text-sm leading-relaxed">
                  {settings.footer_description || DEFAULT_SETTINGS.footer_description}
                </p>

                <div className="flex gap-2.5 pt-1">
                  {socialIcons.map((s) => {
                    const url = settings.social_links?.[s.key] || '#';
                    return (
                      <a
                        key={s.key}
                        href={url}
                        target={url.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-sm"
                      >
                        <s.icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Kolom 2: Menu Cepat */}
              <div>
                <h4 className="font-bold text-base text-white tracking-wide mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Menu Cepat
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2.5 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-400 group-hover:scale-125 transition-all" />
                        <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kolom 3: Edukasi Pemilik Kucing (Rekomendasi 2) */}
              <div>
                <h4 className="font-bold text-base text-blue-400 tracking-wide mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  {settings.education_menu?.title || 'Edukasi Kucing'}
                </h4>
                <ul className="space-y-3">
                  {educationLinks.map((item, idx) => (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => handleEducationClick(item.action)}
                        className="w-full text-left text-slate-300 hover:text-white transition-colors text-sm flex items-center justify-between group py-0.5"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 group-hover:bg-teal-400 group-hover:scale-125 transition-all" />
                          <span className="group-hover:translate-x-1 transition-transform group-hover:text-blue-300">{item.name}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kolom 4: Kontak Kami */}
              <div>
                <h4 className="font-bold text-base text-white tracking-wide mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Kontak Kami
                </h4>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                      {settings.contact?.address || DEFAULT_SETTINGS.contact.address}
                    </span>
                  </li>

                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Phone className="w-4 h-4" />
                    </div>
                    <a
                      href={`tel:${(settings.contact?.phone || '').replace(/[^0-9+]/g, '')}`}
                      className="text-slate-300 hover:text-emerald-400 transition-colors text-xs sm:text-sm font-medium"
                    >
                      {settings.contact?.phone || DEFAULT_SETTINGS.contact.phone}
                    </a>
                  </li>

                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Mail className="w-4 h-4" />
                    </div>
                    <a
                      href={`mailto:${settings.contact?.email || DEFAULT_SETTINGS.contact.email}`}
                      className="text-slate-300 hover:text-amber-400 transition-colors text-xs sm:text-sm font-medium truncate"
                    >
                      {settings.contact?.email || DEFAULT_SETTINGS.contact.email}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Baris Bawah (Copyright & Kredit) */}
          <div className="border-t border-slate-800/90 bg-slate-950/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                <p className="text-center md:text-left">
                  {settings.copyright_text || DEFAULT_SETTINGS.copyright_text}
                </p>
                <p className="flex items-center gap-1.5 text-center">
                  {settings.credit_text || DEFAULT_SETTINGS.credit_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: TIPS FOTO KULIT AKURAT */}
      {/* ========================================================================= */}
      {activeModal === 'photoTips' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Panduan Foto Kulit Kucing Akurat</h3>
                  <p className="text-xs text-slate-400">Tips agar model AI dapat mendeteksi penyakit kulit dengan presisi tinggi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="space-y-4 mb-8">
              {PHOTO_TIPS.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {tip.num}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white">{tip.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 text-center sm:text-left">
                Format didukung: <strong>JPG, PNG, WebP</strong> (Maks 5MB)
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  scrollTo('#demo');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                Coba Upload Foto Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KAPAN HARUS KE KLINIK HEWAN (RED FLAGS) */}
      {/* ========================================================================= */}
      {activeModal === 'clinicSigns' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-slate-900 border border-rose-900/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tanda Bahaya (Red Flags) Infeksi Parah</h3>
                  <p className="text-xs text-rose-300">Gejala kritis yang membutuhkan tindakan darurat dokter hewan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Alert Banner */}
            <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-xs text-rose-200 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Peringatan Kesehatan Kucing:</strong> Sistem AI berfungsi untuk skrining awal. Jika kucing Anda menunjukkan salah satu kondisi di bawah, tunda pengobatan mandiri dan segera periksakan ke klinik hewan terdekat.
              </p>
            </div>

            {/* Red Flags List */}
            <div className="space-y-3.5 mb-8">
              {CLINIC_RED_FLAGS.map((flag, idx) => (
                <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <h4 className="text-sm font-semibold text-rose-200">{flag.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-4">{flag.desc}</p>
                </div>
              ))}
            </div>

            {/* Footer Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Jangan menunda bila kucing tampak lemas atau kesakitan hebat.
              </span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FAQ DIAGNOSA AI */}
      {/* ========================================================================= */}
      {activeModal === 'faq' && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">FAQ Diagnosa Kulit AI</h3>
                  <p className="text-xs text-slate-400">Pertanyaan umum seputar teknologi dan cara kerja CatSkin AI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Accordion List */}
            <div className="space-y-3 mb-8">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-white text-xs sm:text-sm font-semibold hover:text-blue-300 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                          Q
                        </span>
                        <span>{item.q}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Punya pertanyaan lain? Hubungi tim kami via email support.
              </span>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
              >
                Tutup FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
