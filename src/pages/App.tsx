import Layout from "@/pages/layout";
import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home/home-page";
<<<<<<< HEAD
import GamePage from "@/pages/games/game-page";
import MemoryPage from "@/pages/games/memory/memory-page";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamePage />} />
        <Route path="/games/memory" element={<MemoryPage />} />
      </Routes>
    </Layout>
=======
import LoginPage from "./login/login-page";
import { SessionProvider } from "@/components/context/auth-context";
import RegisterPage from "./register/register-page";
import CommunityPage from "./community/community-page";

function App() {
  return (
    <SessionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Routes>
      </Layout>
    </SessionProvider>
>>>>>>> authentication
  );
}

export default App;
