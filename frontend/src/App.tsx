import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import Layout from '@/components/Shared/Layout';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/components/Dashboard/Dashboard';
import WorkSection from '@/components/Work/WorkSection';
import FinanceSection from '@/components/Finance/FinanceSection';
import LearningSection from '@/components/Learning/LearningSection';
import HealthSection from '@/components/Health/HealthSection';
import SportsSection from '@/components/Sports/SportsSection';
import TravelSection from '@/components/Travel/TravelSection';
import MediaSection from '@/components/Media/MediaSection';
import AISection from '@/components/AI/AISection';

const Protected = ({ children }: { children: React.ReactNode }) => {
  const token = useAppStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <Protected>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/work" element={<WorkSection />} />
                <Route path="/finance" element={<FinanceSection />} />
                <Route path="/learning" element={<LearningSection />} />
                <Route path="/health" element={<HealthSection />} />
                <Route path="/sports" element={<SportsSection />} />
                <Route path="/travel" element={<TravelSection />} />
                <Route path="/media" element={<MediaSection />} />
                <Route path="/ai" element={<AISection />} />
              </Routes>
            </Layout>
          </Protected>
        }
      />
    </Routes>
  );
}
