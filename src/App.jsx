import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

const Navigation = lazy(() => import('./sections/Navigation'));
const Hero = lazy(() => import('./sections/Hero'));
const Features = lazy(() => import('./sections/Features'));
const HowItWorks = lazy(() => import('./sections/HowItWorks'));
const DiseaseTypes = lazy(() => import('./sections/DiseaseTypes'));
const DemoDiagnosis = lazy(() => import('./sections/DemoDiagnosis'));
const MedicineRecommendation = lazy(() => import('./sections/MedicineRecommendation'));
const Statistics = lazy(() => import('./sections/Statistics'));
const Footer = lazy(() => import('./sections/Footer'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Suspense fallback={null}>
        <Navigation />
        <main className="relative z-10">
          <Hero />
          <Suspense fallback={<div className="h-96" />}><Features /></Suspense>
          <Suspense fallback={<div className="h-96" />}><HowItWorks /></Suspense>
          <Suspense fallback={<div className="h-96" />}><DiseaseTypes /></Suspense>
          <Suspense fallback={<div className="h-96" />}><DemoDiagnosis /></Suspense>
          <Suspense fallback={<div className="h-96" />}><MedicineRecommendation /></Suspense>
          <Suspense fallback={<div className="h-96" />}><Statistics /></Suspense>
          <Suspense fallback={<div className="h-24" />}><Footer /></Suspense>
        </main>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/*" element={
        <Suspense fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-white text-lg">Loading Admin...</div>
          </div>
        }>
          <AdminDashboard />
        </Suspense>
      } />
    </Routes>
  );
}

export default App;
