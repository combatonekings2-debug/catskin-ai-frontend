import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Application Error caught by ErrorBoundary:', error, errorInfo);

    const errorMessage = error?.message || String(error);
    const isChunkOrImportError =
      errorMessage.includes('dynamically imported module') ||
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('Importing a module script failed') ||
      errorMessage.includes('Unexpected token \'<\'');

    // Jika ini adalah kesalahan modul/chunk akibat pembaruan versi (stale cache),
    // otomatis muat ulang halaman sekali untuk mendapatkan berkas versi terbaru.
    if (isChunkOrImportError) {
      const reloadKey = 'catskin_chunk_reload_timestamp';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      // Izinkan reload otomatis jika belum pernah reload dalam 15 detik terakhir
      if (!lastReload || now - Number(lastReload) > 15000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }

  handleManualReload = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  handleGoHome = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">Pembaruan Sistem Tersedia</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Terdapat berkas pembaruan terbaru di aplikasi CatSkin AI. Silakan tekan tombol di bawah untuk memuat tampilan terbaru.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={this.handleManualReload}
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-all active:scale-95"
              >
                Ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
