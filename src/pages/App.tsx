import Layout from "@/pages/layout";
import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home/home-page";
import AuthPage from "./login/login-page";
import { SessionProvider } from "@/components/context/auth-context";
import CommunityPage from "./community/community-page";
import GamePage from "./games/game-page";
import ProfilePage from "./profile/profile-age";
import SightingsPage from "./sightings/sightings-page";
import SightingDetail from "./sightings/sighting-detail";
import MemoryPage from "./games/memory/memory-page";
import CrosswordPage from "./games/crossword/crossword-page";
import QuizPage from "./games/quiz/quiz-page";
import HangmanPage from "./games/hangman/hangman-page";
import RoutesPage from "./routes/routes-page";
import SpeciesPage from "./especies/species-page";

function App() {
  return (
    <SessionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/games" element={<GamePage />} />
          <Route path="/games/memory" element={<MemoryPage />} />
          <Route path="/games/crossword" element={<CrosswordPage />} />
          <Route path="/games/quiz" element={<QuizPage />} />
          <Route path="/games/hangman" element={<HangmanPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/sightings" element={<SightingsPage />} />
          <Route path="/sightings/:id" element={<SightingDetail />} />
          <Route path="/especies" element={<SpeciesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </SessionProvider>
  );
}

export default App;
