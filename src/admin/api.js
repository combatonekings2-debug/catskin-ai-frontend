/**
 * Admin API â€” semua panggilan ke backend CatSkin AI
 * Menggunakan URL relatif agar berjalan lewat Vite proxy (dev)
 * maupun di production tanpa perlu set VITE_API_URL.
 */

const BASE = import.meta.env.VITE_API_URL || '';
const DIRECT_BACKEND = 'https://andrea-william-tonight-customers.trycloudflare.com';

async function request(path, options = {}) {
  const fetchOptions = {
    cache: 'no-store',
    ...options,
  };
  try {
    const res = await fetch(`${BASE}${path}`, fetchOptions);
    const ct = res.headers.get('content-type') || '';
    if (res.ok) {
      if (res.status === 204) return { success: true };
      if (ct.includes('application/json')) return await res.json();
      return res.json().catch(() => ({ success: true }));
    }
  } catch {
    // Fallback langsung ke port 8000 jika proxy Vite tidak merespons
  }

  const directRes = await fetch(`${DIRECT_BACKEND}${path}`, fetchOptions);
  if (!directRes.ok) {
    const err = await directRes.json().catch(() => ({ detail: directRes.statusText }));
    throw new Error(err.detail || 'Request gagal');
  }
  if (directRes.status === 204) return { success: true };
  return directRes.json().catch(() => ({ success: true }));
}

// â”€â”€ Dataset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const datasetApi = {
  list:        ()                 => request('/api/admin/dataset'),
  delete:      (id)               => request(`/api/admin/dataset/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  batchDelete: (ids)              => request('/api/admin/dataset/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  }),
  image:       (category, id)     => request(`/api/admin/dataset/image/${encodeURIComponent(category)}/${id}`),
  fileUrl:     (category, id)     => `${BASE}/api/admin/dataset/file/${encodeURIComponent(category)}/${id}`,
  upload:      (file, category)   => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', category);
    return request('/api/admin/dataset/upload', { method: 'POST', body: fd });
  },
};

// â”€â”€ Training â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const trainingApi = {
  start:  (config) => request('/api/admin/training/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  }),
  status: ()       => request('/api/admin/training/status'),
  stop:   ()       => request('/api/admin/training/stop', { method: 'POST' }),
};

// â”€â”€ Models â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const modelsApi = {
  list:     ()         => request('/api/admin/models'),
  deploy:   (filename) => request(`/api/admin/models/${encodeURIComponent(filename)}/deploy`, { method: 'POST' }),
  delete:   (filename) => request(`/api/admin/models/${encodeURIComponent(filename)}`, { method: 'DELETE' }),
  download: (filename) => `${BASE}/api/admin/models/${encodeURIComponent(filename)}/download`,
  upload:   (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/api/admin/models/upload', { method: 'POST', body: fd });
  },
};

// â”€â”€ Diagnosis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const diagnosisApi = {
  list:   (params = {}) => {
    const qs = new URLSearchParams({
      page:           params.page           ?? 1,
      limit:          params.limit          ?? 10,
      search:         params.search         ?? '',
      disease_filter: params.disease_filter ?? '',
    }).toString();
    return request(`/api/admin/diagnosis?${qs}`);
  },
  delete:      (id)  => request(`/api/admin/diagnosis/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  batchDelete: (ids) => request('/api/admin/diagnosis/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  }),
  clear:       ()    => request('/api/admin/diagnosis/clear', { method: 'POST' }),
  imageUrl:    (id)  => `${BASE}/api/admin/diagnosis/image/${id}`,
  exportUrl:   ()    => `${BASE}/api/admin/diagnosis/export`,
  testDiagnose: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/api/predict', { method: 'POST', body: fd });
  },
};

// â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const statsApi = {
  get: () => request('/api/admin/stats'),
};

// â”€â”€ Site & Footer Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const settingsApi = {
  get:    ()        => request('/api/settings'),
  update: (payload) => request('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
};

