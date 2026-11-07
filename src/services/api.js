/**
 * API Service untuk CatSkin AI
 * URL relatif â€” request diteruskan lewat Vite proxy ke backend.
 */

const API_BASE_URL = '/api';
const DIRECT_BACKEND_URL = 'https://sing-low-attended-simpson.trycloudflare.com/api';

async function requestWithFallback(endpoint, options = {}) {
  // Coba lewat proxy terlebih dahulu
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    // Pastikan response bukan HTML (kasus jika fallback ke index.html Vite saat 404)
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Abaikan dan coba langsung ke port 8000
  }

  // Fallback langsung ke backend FastAPI di 127.0.0.1:8000
  const directRes = await fetch(`${DIRECT_BACKEND_URL}${endpoint}`, options);
  if (!directRes.ok) {
    const err = await directRes.json().catch(() => ({}));
    throw new Error(err.detail || 'Gagal berkomunikasi dengan server backend');
  }
  return await directRes.json();
}

export async function predictImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    return await requestWithFallback('/predict', {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function predictMock(classId) {
  const query = classId !== undefined ? `?class_id=${classId}` : '';
  try {
    return await requestWithFallback(`/predict/mock${query}`, { method: 'POST' });
  } catch (error) {
    console.error('Mock API Error:', error);
    throw error;
  }
}

export async function getDatasetInfo() {
  try {
    return await requestWithFallback('/dataset/info');
  } catch (error) {
    console.error('Dataset Info Error:', error);
    throw error;
  }
}

export async function healthCheck() {
  try {
    return await requestWithFallback('/health');
  } catch {
    return { status: 'offline', model_loaded: false };
  }
}

export async function isBackendAvailable() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        return data?.status === 'healthy';
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    // fallback check
  }

  try {
    const directRes = await fetch(`${DIRECT_BACKEND_URL}/health`);
    if (directRes.ok) {
      const data = await directRes.json();
      return data?.status === 'healthy';
    }
  } catch {
    return false;
  }
  return false;
}

export const LOCAL_DATASET = [
  {
    disease: 'Dermatitis',
    confidence: 92.5,
    description: 'Peradangan kulit yang disebabkan oleh alergi atau iritan.',
    recommendations: ['Krim kortison 1% 2x sehari', 'Antihistamin', 'Hindari alergen', 'Jaga kebersihan area'],
    severity: 'Sedang',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    disease: 'Flea Allergy',
    confidence: 96.8,
    description: 'Reaksi alergi terhadap air liur kutu.',
    recommendations: ['Obat anti-kutu (Frontline)', 'Krim anti-gatal', 'Sterilkan lingkungan', 'Antibiotik jika infeksi'],
    severity: 'Tinggi',
    color: 'from-red-500 to-rose-600',
  },
  {
    disease: 'Ringworm',
    confidence: 94.7,
    description: 'Infeksi jamur pada kulit dan bulu kucing.',
    recommendations: ['Krim Miconazole 2x sehari', 'Griseofulvin oral', 'Jaga kebersihan', 'Isolasi kucing'],
    severity: 'Sedang',
    color: 'from-amber-500 to-orange-600',
  },
  {
    disease: 'Scabies',
    confidence: 89.3,
    description: 'Infeksi tungau yang menggali ke dalam kulit.',
    recommendations: ['Ivermectin sesuai dosis', 'Shampoo benzoyl peroxide', 'Sterilkan lingkungan', 'Pengobatan berulang 2 minggu'],
    severity: 'Tinggi',
    color: 'from-purple-500 to-violet-600',
  },
  {
    disease: 'Healthy',
    confidence: 98.2,
    description: 'Kondisi kulit dan bulu kucing dalam keadaan normal.',
    recommendations: ['Pola makan sehat', 'Rutin grooming', 'Vaksinasi rutin', 'Jaga kebersihan lingkungan'],
    severity: 'Normal',
    color: 'from-green-500 to-emerald-600',
  },
];

export function predictLocal() {
  const randomIndex = Math.floor(Math.random() * LOCAL_DATASET.length);
  return LOCAL_DATASET[randomIndex];
}

export async function getSiteSettings() {
  try {
    return await requestWithFallback('/settings');
  } catch (error) {
    console.error('Settings API Error:', error);
    return null;
  }
}

