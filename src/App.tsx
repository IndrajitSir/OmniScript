import { MainDashboard } from './components/MainDashboard';
import { ComposerProvider } from './state';

export default function App() {
  return (
    <ComposerProvider>
      <MainDashboard />
    </ComposerProvider>
  );
}
