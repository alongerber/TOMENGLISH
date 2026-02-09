import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { AchievementToast } from './components/ui/AchievementToast';
import { Welcome } from './routes/Welcome';
import { Home } from './routes/Home';
import { MagicELab } from './games/MagicELab';
import { SentenceBuilder } from './games/SentenceBuilder';
import { PriceTag } from './games/PriceTag';
import { Vocabulary } from './games/Vocabulary';
import { BossLevel } from './games/BossLevel';
import { MockTest } from './games/MockTest';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const playerName = useGameStore((s) => s.playerName);
  if (!playerName) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  const quietMode = useGameStore((s) => s.quietMode);
  const pendingAchievement = useGameStore((s) => s.pendingAchievement);
  const dismissAchievement = useGameStore((s) => s.dismissAchievement);

  return (
    <div className={`${quietMode ? 'quiet-mode' : ''} app-background`}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/magic-e" element={<RequireAuth><MagicELab /></RequireAuth>} />
          <Route path="/sentences" element={<RequireAuth><SentenceBuilder /></RequireAuth>} />
          <Route path="/prices" element={<RequireAuth><PriceTag /></RequireAuth>} />
          <Route path="/vocabulary" element={<RequireAuth><Vocabulary /></RequireAuth>} />
          <Route path="/boss/:category" element={<RequireAuth><BossLevel /></RequireAuth>} />
          <Route path="/mock-test" element={<RequireAuth><MockTest /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global achievement toast */}
      <AchievementToast achievement={pendingAchievement} onDone={dismissAchievement} />
    </div>
  );
}

export default App;
