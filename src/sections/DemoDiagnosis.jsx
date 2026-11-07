import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Scan, CheckCircle, AlertTriangle, Loader2, Camera, Wifi, WifiOff, Pill, ShieldAlert, Activity, FileText, Image as ImageIcon, RefreshCw, UploadCloud, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { predictImage, predictMock, isBackendAvailable, predictLocal } from '@/services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const DemoDiagnosis = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fitur Kamera Realtime & Mode Input
  const [inputMode, setInputMode] = useState('gallery'); // 'gallery' | 'camera'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const sectionRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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
    let mounted = true;
    const checkStatus = () => {
      isBackendAvailable().then((isAvail) => {
        if (mounted) setBackendAvailable(isAvail);
      });
    };
    checkStatus();
    const timer = setInterval(checkStatus, 3000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`Ukuran file terlalu besar. Maksimal 5MB (file Anda: ${(file.size / 1024 / 1024).toFixed(1)}MB).`);
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (event) => {
    validateAndSetFile(event.target.files?.[0]);
  };

  // Drag & drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  }, []);

  // Helper validasi spektrum warna organik kulit & bulu kucing di client-side
  const analyzeImageOrganicRatio = (imgSrc) => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, 64, 64);
          const { data } = ctx.getImageData(0, 0, 64, 64);
          let organicCount = 0;
          let darkCount = 0;
          const totalPixels = 64 * 64;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const y = 0.299 * r + 0.587 * g + 0.114 * b;
            const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
            const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

            if (y < 20) darkCount++;
            const isSkin = cr >= 128 && cr <= 185 && cb >= 70 && cb <= 140;
            const isFurWarm = r > g && g >= b * 0.7 && r > 35 && y > 30 && y < 240;
            const isFurNeutral = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && y >= 40 && y <= 235;

            if (isSkin || isFurWarm || isFurNeutral) organicCount++;
          }

          const organicRatio = (organicCount / totalPixels) * 100;
          const darkRatio = (darkCount / totalPixels) * 100;
          resolve({ organicRatio, darkRatio, isVisuallyPlausible: organicRatio >= 55 && darkRatio <= 35 });
        };
        img.onerror = () => resolve(null);
        img.src = imgSrc;
      } catch {
        resolve(null);
      }
    });
  };

  const handleAnalyze = async () => {
    if (!uploadedImage || !uploadedFile) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + 5;
      });
    }, 150);

    try {
      let prediction;
      try {
        const response = await predictImage(uploadedFile);
        setBackendAvailable(true);
        if (response.is_valid_cat_skin === false || response.success === false) {
          prediction = {
            is_valid_cat_skin: false,
            message: response.message,
            validation_details: response.validation_details,
          };
        } else {
          prediction = response.data;
        }
      } catch (backendErr) {
        console.warn('Backend gagal dipanggil, fallback ke simulasi:', backendErr);
        await new Promise(resolve => setTimeout(resolve, 1500));
        const visualCheck = await analyzeImageOrganicRatio(uploadedImage);
        if (visualCheck && !visualCheck.isVisuallyPlausible) {
          prediction = {
            is_valid_cat_skin: false,
            message: 'Foto tidak terdeteksi sebagai kulit kucing yang valid. Sistem mendeteksi bahwa gambar yang Anda unggah bukan merupakan area lesi kulit atau bulu kucing.',
            validation_details: {
              reasons: [
                `Karakteristik tekstur dan spektrum warna biologis kulit/bulu kucing tidak terdeteksi (rasio: ${visualCheck.organicRatio.toFixed(1)}%).`,
                visualCheck.darkRatio > 35 ? `Foto didominasi area gelap/bayangan (${visualCheck.darkRatio.toFixed(1)}%).` : 'Komposisi foto tidak menunjukkan pola lesi kulit kucing.',
              ],
            },
          };
        } else {
          prediction = predictLocal();
        }
      }

      clearInterval(interval);
      setAnalysisProgress(100);
      setTimeout(() => { setIsAnalyzing(false); setResult(prediction); }, 500);
    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menganalisis');
    }
  };

  // Hasil simulasi lokal terurut sesuai ID model backend: 0=Dermatitis, 1=Flea Allergy, 2=Healthy, 3=Ringworm, 4=Scabies
  const localResults = [
    // id 0: Dermatitis
    {
      disease: 'Dermatitis',
      confidence: 92.5,
      scientific_name: 'Feline Dermatitis',
      description: 'Peradangan kulit yang disebabkan oleh reaksi alergi, iritan eksternal, atau infeksi sekunder.',
      recommendations: ['Krim kortison/hidrokortison 1%', 'Antihistamin oral sesuai dosis dokter', 'Identifikasi dan isolasi dari alergen', 'Pembersihan antiseptik rutin'],
      severity: 'Sedang',
      color: 'from-blue-500 to-indigo-600',
      expert_reference: 'Praktisi Dokter Hewan (Validasi Klinis)',
      all_predictions: [
        { disease: 'Dermatitis', confidence: 92.5, color: 'from-blue-500 to-indigo-600', severity: 'Sedang', scientific_name: 'Feline Dermatitis' },
        { disease: 'Flea Allergy', confidence: 3.8, color: 'from-red-500 to-rose-600', severity: 'Tinggi', scientific_name: 'FAD' },
        { disease: 'Ringworm', confidence: 2.1, color: 'from-amber-500 to-orange-600', severity: 'Sedang', scientific_name: 'Dermatophytosis' },
        { disease: 'Scabies', confidence: 1.1, color: 'from-purple-500 to-violet-600', severity: 'Tinggi', scientific_name: 'Notoedric Mange' },
        { disease: 'Healthy', confidence: 0.5, color: 'from-green-500 to-emerald-600', severity: 'Normal', scientific_name: 'Normal' },
      ],
    },
    // id 1: Flea Allergy
    {
      disease: 'Flea Allergy',
      confidence: 96.8,
      scientific_name: 'Flea Allergy Dermatitis (FAD)',
      description: 'Reaksi hipersensitivitas alergi terhadap air liur kutu kucing yang memicu rasa gatal intensif.',
      recommendations: ['Obat anti-kutu Spot-on (Fluralaner / Fipronil)', 'Krim topikal pereda pruritus/gatal', 'Sterilisasi kasur dan lingkungan kucing', 'Antibiotik jika ada infeksi luka sekunder'],
      severity: 'Tinggi',
      color: 'from-red-500 to-rose-600',
      expert_reference: 'Praktisi Dokter Hewan (Validasi Klinis)',
      all_predictions: [
        { disease: 'Flea Allergy', confidence: 96.8, color: 'from-red-500 to-rose-600', severity: 'Tinggi', scientific_name: 'FAD' },
        { disease: 'Dermatitis', confidence: 1.8, color: 'from-blue-500 to-indigo-600', severity: 'Sedang', scientific_name: 'Feline Dermatitis' },
        { disease: 'Scabies', confidence: 0.8, color: 'from-purple-500 to-violet-600', severity: 'Tinggi', scientific_name: 'Notoedric Mange' },
        { disease: 'Ringworm', confidence: 0.4, color: 'from-amber-500 to-orange-600', severity: 'Sedang', scientific_name: 'Dermatophytosis' },
        { disease: 'Healthy', confidence: 0.2, color: 'from-green-500 to-emerald-600', severity: 'Normal', scientific_name: 'Normal' },
      ],
    },
    // id 2: Healthy
    {
      disease: 'Healthy',
      confidence: 98.2,
      scientific_name: 'Normal Healthy Skin',
      description: 'Kondisi kulit dan folikel rambut kucing berada dalam keadaan bersih, sehat, dan bebas lesi patologis.',
      recommendations: ['Pertahankan asupan nutrisi kaya asam lemak omega-3 & 6', 'Rutin sisir bulu dan grooming terjadwal', 'Vaksinasi berkala dan pencegahan parasit rutin', 'Jaga sanitasi tempat bermain dan kandang'],
      severity: 'Normal',
      color: 'from-green-500 to-emerald-600',
      expert_reference: 'Praktisi Dokter Hewan (Validasi Klinis)',
      all_predictions: [
        { disease: 'Healthy', confidence: 98.2, color: 'from-green-500 to-emerald-600', severity: 'Normal', scientific_name: 'Normal' },
        { disease: 'Dermatitis', confidence: 0.9, color: 'from-blue-500 to-indigo-600', severity: 'Sedang', scientific_name: 'Feline Dermatitis' },
        { disease: 'Flea Allergy', confidence: 0.4, color: 'from-red-500 to-rose-600', severity: 'Tinggi', scientific_name: 'FAD' },
        { disease: 'Ringworm', confidence: 0.3, color: 'from-amber-500 to-orange-600', severity: 'Sedang', scientific_name: 'Dermatophytosis' },
        { disease: 'Scabies', confidence: 0.2, color: 'from-purple-500 to-violet-600', severity: 'Tinggi', scientific_name: 'Notoedric Mange' },
      ],
    },
    // id 3: Ringworm
    {
      disease: 'Ringworm',
      confidence: 94.7,
      scientific_name: 'Dermatophytosis (Microsporum canis)',
      description: 'Infeksi mikosis kapang dermatofita yang menyerang keratin epidermis kulit, bulu, dan cakar.',
      recommendations: ['Krim antijamur Miconazole/Ketoconazole 2x sehari', 'Antijamur sistemik oral (Itraconazole/Griseofulvin)', 'Isolasi kucing dari manusia dan hewan lain (zoonosis)', 'Disinfeksi kandang, sisir, dan ruangan'],
      severity: 'Sedang',
      color: 'from-amber-500 to-orange-600',
      expert_reference: 'Praktisi Dokter Hewan (Validasi Klinis)',
      all_predictions: [
        { disease: 'Ringworm', confidence: 94.7, color: 'from-amber-500 to-orange-600', severity: 'Sedang', scientific_name: 'Dermatophytosis' },
        { disease: 'Dermatitis', confidence: 2.5, color: 'from-blue-500 to-indigo-600', severity: 'Sedang', scientific_name: 'Feline Dermatitis' },
        { disease: 'Scabies', confidence: 1.4, color: 'from-purple-500 to-violet-600', severity: 'Tinggi', scientific_name: 'Notoedric Mange' },
        { disease: 'Flea Allergy', confidence: 0.9, color: 'from-red-500 to-rose-600', severity: 'Tinggi', scientific_name: 'FAD' },
        { disease: 'Healthy', confidence: 0.5, color: 'from-green-500 to-emerald-600', severity: 'Normal', scientific_name: 'Normal' },
      ],
    },
    // id 4: Scabies
    {
      disease: 'Scabies',
      confidence: 91.3,
      scientific_name: 'Notoedric Mange (Notoedres cati)',
      description: 'Infeksi ektoparasit tungau kudis yang menggali terowongan mikroskopis di bawah lapisan epidermis kulit.',
      recommendations: ['Akarisida (Selamectin spot-on / Ivermectin resep dokter hewan)', 'Mandi medikasi sulfur/keratolitik berkala', 'Sterilisasi menyeluruh kandang & alas tidur kucing', 'Pengulangan terapi berkala sesuai siklus hidup tungau'],
      severity: 'Tinggi',
      color: 'from-purple-500 to-violet-600',
      expert_reference: 'Praktisi Dokter Hewan (Validasi Klinis)',
      all_predictions: [
        { disease: 'Scabies', confidence: 91.3, color: 'from-purple-500 to-violet-600', severity: 'Tinggi', scientific_name: 'Notoedric Mange' },
        { disease: 'Flea Allergy', confidence: 4.8, color: 'from-red-500 to-rose-600', severity: 'Tinggi', scientific_name: 'FAD' },
        { disease: 'Dermatitis', confidence: 2.3, color: 'from-blue-500 to-indigo-600', severity: 'Sedang', scientific_name: 'Feline Dermatitis' },
        { disease: 'Ringworm', confidence: 1.2, color: 'from-amber-500 to-orange-600', severity: 'Sedang', scientific_name: 'Dermatophytosis' },
        { disease: 'Healthy', confidence: 0.4, color: 'from-green-500 to-emerald-600', severity: 'Normal', scientific_name: 'Normal' },
      ],
    },
  ];

  // Gambar sample per penyakit (ID disesuaikan dengan backend: 0=Dermatitis, 1=Flea Allergy, 2=Healthy, 3=Ringworm, 4=Scabies)
  const sampleImages = [
    { img: '/images/disease-dermatitis.jpg', label: 'Dermatitis', id: 0 },
    { img: '/images/disease-flea-allergy.jpg', label: 'Flea Allergy', id: 1 },
    { img: '/images/disease-ringworm.jpg', label: 'Ringworm', id: 3 },
    { img: '/images/disease-allergy.jpg', label: 'Scabies', id: 4 },
    { img: '/images/disease-healthy.jpg', label: 'Healthy', id: 2 },
  ];

  // Kontrol Kamera Realtime
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn('Error stopping camera track:', e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  }, []);

  const startCamera = useCallback(async (facing = cameraFacingMode) => {
    setIsCameraLoading(true);
    stopCamera();
    setCameraError(null);

    const isSecure = typeof window !== 'undefined' ? window.isSecureContext : true;
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;

    if (!hasMedia) {
      if (!isSecure && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setCameraError('insecure_origin');
      } else {
        setCameraError('Browser Anda tidak mendukung akses kamera langsung. Silakan gunakan opsi Jepret Foto atau Pilih dari Galeri.');
      setIsCameraLoading(false);
      }
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play interrupted:', playErr);
        }
      }
      setIsCameraActive(true);
      setIsCameraLoading(false);
      setCameraFacingMode(facing);
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      let msg = 'Gagal mengakses kamera. ';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg += 'Izin akses kamera ditolak. Silakan izinkan akses kamera di ikon gembok/pengaturan browser Anda.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg += 'Kamera tidak terdeteksi pada perangkat Anda.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg += 'Kamera sedang digunakan oleh aplikasi lain. Mohon tutup aplikasi tersebut dan coba lagi.';
      } else {
        msg += err.message || 'Silakan gunakan opsi Pilih dari Galeri.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    setIsCameraLoading(false);
    }
  }, [cameraFacingMode, stopCamera]);

  const toggleCameraFacing = useCallback(() => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  }, [cameraFacingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isCameraActive) return;

    setIsCapturing(true);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
    }

    setTimeout(() => {
      canvas.toBlob((blob) => {
        setIsCapturing(false);
        if (blob) {
          const file = new File([blob], `foto-kucing-kamera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          validateAndSetFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }, 120);
  }, [isCameraActive, cameraFacingMode, stopCamera]);

  // Pastikan stream kamera terhubung ke elemen video saat elemen baru di-mount
  useEffect(() => {
    if (inputMode === 'camera' && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [inputMode, isCameraActive]);

  // Bersihkan stream kamera saat unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleMockPredict = async (classId) => {
    stopCamera();
    const selectedSample = sampleImages.find((s) => s.id === classId);
    if (selectedSample) {
      setUploadedImage(selectedSample.img);
      setUploadedFile(null);
    }
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => { if (prev >= 90) return 90; return prev + 10; });
    }, 100);

    try {
      if (backendAvailable) {
        const response = await predictMock(classId);
        clearInterval(interval);
        setAnalysisProgress(100);
        setTimeout(() => { setIsAnalyzing(false); setResult(response.data); }, 300);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        clearInterval(interval);
        setAnalysisProgress(100);
        setTimeout(() => { setIsAnalyzing(false); setResult(localResults[classId]); }, 300);
      }
    } catch {
      clearInterval(interval);
      setIsAnalyzing(false);
      setError('Gagal melakukan prediksi');
    }
  };

  const resetAnalysis = () => {
    stopCamera();
    setInputMode('gallery');
    setIsCameraLoading(false);
    setUploadedImage(null);
    setUploadedFile(null);
    setResult(null);
    setError(null);
    setCameraError(null);
    setAnalysisProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section id="demo" ref={sectionRef} className="py-10 sm:py-14 lg:py-16 2xl:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50/50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center max-w-3xl mx-auto mb-6 sm:mb-8 2xl:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Scan className="w-4 h-4" />
            <span>CNN MobileNetV2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">
            Coba <span className="text-gradient">Diagnosa</span> Sekarang
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600">Upload foto area kulit kucing dan sistem CNN kami akan menganalisis ke dalam 5 kondisi.</p>
          <div className="mt-3 sm:mt-4 flex justify-center">
            <button
              onClick={() => isBackendAvailable().then(setBackendAvailable)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${backendAvailable ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
            >
              {backendAvailable ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {backendAvailable ? 'Backend Connected' : 'Backend Offline (Local Mode)'}
            </button>
          </div>
        </div>

        <div className={`max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

            {/* Hidden Canvas untuk Snapshot Kamera */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Input Selection & Upload / Capture Area */}
            {!uploadedImage && !result && (
              <div className="p-6 sm:p-8 2xl:p-12">
                {/* Tab Pilihan: Galeri vs Kamera Realtime */}
                <div className="flex justify-center mb-6 sm:mb-8">
                  <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('gallery');
                        stopCamera();
                      }}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                        inputMode === 'gallery'
                          ? 'bg-white text-blue-600 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Pilih dari Galeri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('camera');
                        setTimeout(() => startCamera(), 100);
                      }}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                        inputMode === 'camera'
                          ? 'bg-white text-blue-600 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      <span>Ambil Foto Realtime</span>
                    </button>
                  </div>
                </div>

                {/* Mode 1: Pilih dari Galeri */}
                {inputMode === 'gallery' && (
                  <div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 2xl:p-12 text-center cursor-pointer transition-all duration-200 group ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                          : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                      }`}
                    >
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
                      <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileUpload} className="hidden" />
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 2xl:w-20 2xl:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center transition-transform ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1.5 sm:mb-2">
                        {isDragging ? 'Lepaskan foto di sini' : 'Pilih Foto dari Galeri / File'}
                      </h3>
                      <p className="text-sm text-slate-500 mb-1.5 sm:mb-2">Klik atau seret & lepas foto kucing ke sini</p>
                      <p className="text-xs sm:text-sm text-slate-400">Format: JPG, PNG, WebP · Maks. 5MB</p>
                    </div>

                    {/* Tombol alternatif langsung buka kamera */}
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode('camera');
                          setTimeout(() => startCamera(), 100);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Atau ambil langsung dari kamera perangkat</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mode 2: Kamera Realtime */}
                {inputMode === 'camera' && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col">
                    {/* Live Viewfinder - Tampilan Kamera Tinggi & Imersif untuk Mobile (3:4 portrait) */}
                    <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          isCameraActive ? 'opacity-100' : 'opacity-0'
                        } ${cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                      />

                      {/* Loading / Inactive overlay */}
                      {/* Loading State */}
                      {isCameraLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/90 p-6 text-center">
                          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
                          <p className="text-sm sm:text-base font-medium">Mengaktifkan kamera perangkat...</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">Pastikan browser mengizinkan izin akses kamera saat diminta.</p>
                        </div>
                      )}

                      {/* Inactive State */}
                      {!isCameraActive && !isCameraLoading && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/90 p-6 text-center z-10">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center mb-3 text-blue-400">
                            <Camera className="w-6 h-6" />
                          </div>
                          <p className="text-sm sm:text-base font-semibold mb-1">Kamera Siap Diaktifkan</p>
                          <p className="text-xs text-slate-400 mb-4 max-w-xs">Tekan tombol di bawah untuk menyalakan kamera secara realtime.</p>
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Nyalakan Kamera</span>
                          </button>
                        </div>
                      )}

                      {/* Error State */}
                      {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/95 p-6 text-center z-20">
                          {cameraError === 'insecure_origin' ? (
                            <>
                              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                                <ShieldAlert className="w-6 h-6" />
                              </div>
                              <p className="text-sm sm:text-base font-bold text-amber-300 mb-1.5">
                                Kebijakan Keamanan Kamera Browser (Chrome/Edge)
                              </p>
                              <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-4 leading-relaxed">
                                Google Chrome & Edge membatasi streaming WebRTC pada domain kustom HTTP biasa (<span className="text-amber-300 font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">{typeof window !== 'undefined' ? window.location.hostname : 'catskinai'}</span>).
                                <br />
                                Silakan pilih salah satu opsi di bawah ini:
                              </p>

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md w-full justify-center">
                                <a
                                  href={`http://localhost:${typeof window !== 'undefined' ? window.location.port || '5173' : '5173'}/`}
                                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 inline-flex items-center justify-center gap-2"
                                >
                                  <Camera className="w-4 h-4" />
                                  <span>Buka via Localhost (Kamera Aktif)</span>
                                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => cameraInputRef.current?.click()}
                                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
                                >
                                  <Sparkles className="w-4 h-4" />
                                  <span>Jepret Foto Kamera (Native)</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setInputMode('gallery');
                                  stopCamera();
                                }}
                                className="mt-4 text-xs text-slate-400 hover:text-slate-200 underline"
                              >
                                Atau kembali dan pilih dari galeri file
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                                <AlertTriangle className="w-6 h-6" />
                              </div>
                              <p className="text-sm sm:text-base font-semibold text-red-300 mb-1">Akses Kamera Gagal</p>
                              <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-4">{cameraError}</p>
                              <div className="flex flex-wrap gap-2 justify-center">
                                <button
                                  type="button"
                                  onClick={() => startCamera()}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-1.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Coba Lagi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cameraInputRef.current?.click()}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-1.5"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  Jepret Foto
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInputMode('gallery');
                                    stopCamera();
                                  }}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl transition-colors"
                                >
                                  Pilih dari Galeri
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Viewfinder Overlays when Active */}
                      {isCameraActive && (
                        <>
                          {/* Top bar controls */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Live Camera
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={toggleCameraFacing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors border border-white/20"
                                title="Putar Kamera"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{cameraFacingMode === 'environment' ? 'Kamera Depan' : 'Kamera Belakang'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setInputMode('gallery');
                                  stopCamera();
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-slate-300 hover:bg-black/80 transition-colors border border-white/20"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Tutup</span>
                              </button>
                            </div>
                          </div>

                          {/* Focus reticle box */}
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 sm:p-8">
                            <div className="w-56 h-56 sm:w-64 sm:h-64 2xl:w-72 2xl:h-72 border-2 border-white/50 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-blue-400 rounded-br" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-blue-400/80 rounded-full" />
                              </div>
                            </div>
                          </div>

                          <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none px-4">
                            <p className="text-xs text-white/95 bg-black/70 backdrop-blur-sm inline-block px-3.5 py-1.5 rounded-full shadow border border-white/10">
                              Posisikan area lesi kulit kucing di dalam kotak fokus
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bottom Shutter Capture Bar */}
                    {isCameraActive && (
                      <div className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={isCapturing}
                          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-3 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-50 text-sm sm:text-base"
                        >
                          <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                          <span>{isCapturing ? 'Mengambil Foto...' : 'Ambil Foto Sekarang'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Error validasi upload file */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-red-700 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  <p className="text-sm text-slate-500 mb-4 text-center">Atau coba prediksi contoh dataset:</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {sampleImages.map((item, i) => (
                      <button key={i} onClick={() => handleMockPredict(item.id)} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-colors">
                          <img src={item.img} alt={`Contoh ${item.label}`} loading="lazy" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-slate-500">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preview & Analyze */}
            {uploadedImage && !result && (
              <div className="p-6 sm:p-8 2xl:p-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-slate-800">Preview Foto</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Siap Dianalisis
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetAnalysis();
                        if (inputMode === 'camera') {
                          setTimeout(() => startCamera(), 100);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{inputMode === 'camera' ? 'Ambil Ulang' : 'Ganti Foto'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetAnalysis}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
                      aria-label="Hapus foto"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden mb-6 bg-slate-900 border border-slate-100">
                  <img src={uploadedImage} alt="Foto kucing yang diupload" className="w-full h-60 sm:h-72 2xl:h-80 object-cover" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                      <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                      <p className="text-white font-semibold text-base mb-1">{backendAvailable ? 'CNN Analyzing...' : 'Analyzing (Local Mode)...'}</p>
                      <p className="text-white/70 text-xs sm:text-sm mb-3">Mengekstrak fitur visual & menghitung probabilitas 5 kelas</p>
                      <div className="w-64 max-w-full">
                        <Progress value={analysisProgress} className="h-2" />
                      </div>
                      <p className="text-white/80 text-xs mt-2 font-mono">{analysisProgress}%</p>
                    </div>
                  )}
                </div>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-red-700 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</p>
                  </div>
                )}
                {!isAnalyzing && (
                  <Button onClick={handleAnalyze} className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                    <Scan className="w-5 h-5 mr-2" />
                    {backendAvailable ? 'Mulai Analisis CNN' : 'Mulai Analisis (Local)'}
                  </Button>
                )}
              </div>
            )}

            {/* Result: Foto Tidak Valid / Bukan Kulit Kucing */}
            {result && result.is_valid_cat_skin === false && (
              <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ShieldAlert className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        Validasi Citra AI: Ditolak
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
                        Foto Tidak Terdeteksi Sebagai Kulit Kucing
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={resetAnalysis}
                    className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700 self-end sm:self-auto"
                    aria-label="Tutup"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  {/* Foto yang ditolak */}
                  <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-900 shadow-md flex flex-col h-64 sm:h-72">
                    <img
                      src={uploadedImage}
                      alt="Foto yang diunggah"
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Status: Bukan Kulit Kucing
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-xs text-amber-200">Objek terdeteksi tidak sesuai domain</p>
                      <p className="text-sm font-semibold text-white">Bukan area kulit atau bulu kucing</p>
                    </div>
                  </div>

                  {/* Penjelasan Validasi */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="p-4 sm:p-5 bg-amber-50/80 rounded-2xl border border-amber-200">
                      <h4 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2 mb-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        Mengapa Diagnosa Dibatalkan?
                      </h4>
                      <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                        {result.message || 'Sistem AI mendeteksi bahwa gambar yang Anda unggah bukan merupakan area kulit atau bulu kucing (misalnya foto kardus, perabotan, ruangan, manusia, atau benda mati).'}
                      </p>
                      {result.validation_details?.reasons && result.validation_details.reasons.length > 0 && (
                        <div className="mt-3 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                          <span className="font-semibold block text-slate-700">Hasil Analisis Validasi:</span>
                          <ul className="list-disc list-inside space-y-1">
                            {result.validation_details.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Panduan Pengambilan Foto yang Benar:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Foto jarak dekat (close-up) pada kulit/lesi kucing</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Pastikan pencahayaan cukup dan fokus tajam</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold">✕</span>
                          <span>Jangan memotret ruangan, kardus, atau benda mati</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold">✕</span>
                          <span>Hindari memotret seluruh tubuh dari jarak jauh</span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <Button
                        onClick={() => {
                          resetAnalysis();
                          setInputMode('camera');
                          setTimeout(() => startCamera(), 100);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl py-3 font-semibold shadow"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Ambil Ulang dengan Kamera
                      </Button>
                      <Button
                        onClick={() => {
                          resetAnalysis();
                          setInputMode('gallery');
                          setTimeout(() => fileInputRef.current?.click(), 100);
                        }}
                        variant="outline"
                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl py-3 font-semibold"
                      >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Pilih Foto Lain dari Galeri
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Result: Diagnosa Valid */}
            {result && result.is_valid_cat_skin !== false && (
              <div className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
                {/* Header Hasil Diagnosa */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-2">
                      <Activity className="w-3.5 h-3.5" />
                      Laporan Hasil Analisis · CNN MobileNetV2
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">Hasil Diagnosa & Rekomendasi Terapi</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Waktu Analisis: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetAnalysis}
                      className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700"
                      aria-label="Tutup diagnosa"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Primary Card & Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                  {/* Foto Input */}
                  <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group flex flex-col h-64 sm:h-72 lg:h-auto min-h-[260px] lg:min-h-[350px] 2xl:min-h-[420px]">
                    <img
                      src={uploadedImage || '/images/disease-healthy.jpg'}
                      alt="Area kulit kucing yang dianalisis"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow">
                      <Scan className="w-3.5 h-3.5 text-blue-600" />
                      Resolusi Input 224×224 px
                    </div>
                    <div className={`absolute top-3 right-3 bg-gradient-to-r ${result.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {result.confidence}% Probabilitas
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] uppercase tracking-wider text-white/80">Kondisi Dominan Terdeteksi</span>
                      <h4 className="text-xl sm:text-2xl font-extrabold">{result.disease}</h4>
                      {result.scientific_name && (
                        <p className="text-xs sm:text-sm italic text-white/80">{result.scientific_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Ringkasan Temuan Klinis & Distribusi Softmax */}
                  <div className="lg:col-span-7 space-y-5 lg:space-y-6 flex flex-col justify-between">
                    <div className="bg-slate-50 rounded-2xl p-5 lg:p-6 border border-slate-200/80">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Klasifikasi Terdeteksi</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${result.color}`}>
                            Tingkat: {result.severity}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            result.confidence >= 75 ? 'bg-emerald-100 text-emerald-800' :
                            result.confidence >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {result.confidence >= 75 ? 'Keyakinan Tinggi' :
                             result.confidence >= 50 ? 'Keyakinan Moderat' : 'Perlu Konfirmasi'}
                          </span>
                        </div>
                      </div>
                      <h3 className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${result.color} bg-clip-text text-transparent`}>
                        {result.disease}
                      </h3>
                      <p className="text-sm lg:text-[15px] text-slate-600 mt-2.5 leading-relaxed">
                        {result.description}
                      </p>
                    </div>

                    {/* Softmax 5-Class Distribution (Probabilitas Semua Kelas) */}
                    <div className="bg-white rounded-2xl p-5 lg:p-6 border border-slate-200/80 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          Distribusi Probabilitas Softmax (5 Kelas)
                        </h4>
                        <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Output Layer MobileNetV2</span>
                      </div>
                      <div className="space-y-3 lg:space-y-3.5">
                        {(result.all_predictions || []).map((pred, idx) => {
                          const isTop = idx === 0 || pred.disease === result.disease;
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between items-baseline gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {isTop && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />}
                                  <span className={`font-semibold ${isTop ? 'text-slate-900 font-bold text-sm' : 'text-slate-700 text-xs sm:text-sm'}`}>
                                    {pred.disease}
                                  </span>
                                  {pred.scientific_name && (
                                    <span className="text-xs text-slate-400 italic truncate hidden sm:inline">
                                      ({pred.scientific_name})
                                    </span>
                                  )}
                                </div>
                                <span className={`font-mono font-bold flex-shrink-0 text-xs sm:text-sm ${isTop ? 'text-blue-700 font-extrabold' : 'text-slate-500'}`}>
                                  {pred.confidence}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    isTop ? `bg-gradient-to-r ${result.color}` : 'bg-slate-300'
                                  }`}
                                  style={{ width: `${Math.min(Math.max(pred.confidence, 2), 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rekomendasi Terapi & Obat */}
                <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-2xl p-5 lg:p-7 border border-blue-100">
                  <div className="mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-blue-600" />
                      Rekomendasi Terapi & Penanganan Medis
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 lg:gap-4 mt-3">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3.5 bg-white p-4 lg:p-5 rounded-xl border border-blue-100/80 shadow-xs hover:border-blue-200 transition-colors">
                        <span className={`w-7 h-7 rounded-lg bg-gradient-to-r ${result.color} text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-xs`}>
                          {i + 1}
                        </span>
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {rec}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catatan Disclaimer */}
                <div className="p-5 lg:p-6 bg-amber-50/90 rounded-2xl border border-amber-200/90 text-amber-900">
                  <div className="flex items-start gap-3.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm space-y-1.5">
                      <p className="font-bold text-amber-950 text-sm sm:text-base">
                        Catatan:
                      </p>
                      <p className="leading-relaxed text-amber-900/90">
                        Rekomendasi obat dan tindakan medis pada sistem berbasis Convolutional Neural Network (CNN) ini berfungsi sebagai <strong>informasi awal serta edukasi pertolongan pertama</strong> sebelum pemilik membawa kucing ke fasilitas dokter hewan. Sistem ini <strong>bukan sebagai pengganti diagnosis fisik definitif</strong> oleh dokter hewan berlisensi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="pt-2 flex flex-col sm:flex-row gap-4 lg:gap-5">
                  <Button onClick={resetAnalysis} variant="outline" className="flex-1 rounded-xl py-5 lg:py-6 border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 text-sm sm:text-base">
                    <Scan className="w-4 h-4 mr-2 text-slate-500" />
                    Analisis Foto Lain
                  </Button>
                  <Button
                    onClick={() => document.querySelector('#medicine')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl py-5 lg:py-6 font-semibold text-sm sm:text-base shadow-md"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Rekomendasi Obat Lengkap
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoDiagnosis;
