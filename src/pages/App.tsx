import Layout from "@/pages/layout";
import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home/home-page";
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
  );
}

export default App;
