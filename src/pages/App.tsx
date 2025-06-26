import Layout from "@/pages/layout";
import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home/home-page";
import LoginPage from "./login/login-page";
import { SessionProvider } from "@/components/context/auth-context";
import RegisterPage from "./register/register-page";
import CommunityPage from "./community/community-page";
import GamePage from "./games/game-page";
import ProfilePage from "./profile/profile-page";
import SightingsPage from "./sightings/sightings-page";
import SightingDetail from "./sightings/sighting-detail";
import MemoryPage from "./games/memory/memory-page";
import RoutesPage from "./routes/routes-page";

function App() {
  return (
    <SessionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/games" element={<GamePage />} />
          <Route path="/games/memory" element={<MemoryPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/sightings" element={<SightingsPage />} />
          <Route path="/sightings/:id" element={<SightingDetail />} />
          <Route path="/especies" element={<div className="text-center p-10"><h1 className="text-2xl font-bold">Especies</h1><p className="text-muted-foreground">Página en construcción</p></div>} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </SessionProvider>
  );
}

export default App;
