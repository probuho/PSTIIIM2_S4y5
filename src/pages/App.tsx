import Layout from "@/pages/layout";
import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home/home-page";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}

export default App;
