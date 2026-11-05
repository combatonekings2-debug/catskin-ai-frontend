import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import OverviewPage    from './pages/OverviewPage';
import DatasetPage     from './pages/DatasetPage';
import TrainingPage    from './pages/TrainingPage';
import ModelsPage      from './pages/ModelsPage';
import DiagnosisPage   from './pages/DiagnosisPage';
import SettingsPage    from './pages/SettingsPage';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route index          element={<OverviewPage />}  />
        <Route path="dataset"   element={<DatasetPage />}   />
        <Route path="training"  element={<TrainingPage />}  />
        <Route path="models"    element={<ModelsPage />}    />
        <Route path="diagnosis" element={<DiagnosisPage />} />
        <Route path="settings"  element={<SettingsPage />}  />
      </Routes>
    </AdminLayout>
  );
}
