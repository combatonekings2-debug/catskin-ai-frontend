import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Import komponen landing page secara langsung untuk menghindari chunk loading waterfalls & layar putih di mobile
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import DiseaseTypes from './sections/DiseaseTypes';
import DemoDiagnosis from './sections/DemoDiagnosis';
import MedicineRecommendation from './sections/MedicineRecommendation';
import Statistics from './sections/Statistics';
import Footer from './sections/Footer';

// Hanya halaman Admin (yang berukuran besar ~550KB) yang di-lazy load
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navigation />
      <main className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <DiseaseTypes />
        <DemoDiagnosis />
        <MedicineRecommendation />
        <Statistics />
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4" />
                <div className="text-white text-base font-medium">Memuat Dashboard Admin...</div>
              </div>
            }
          >
            <AdminDashboard />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
