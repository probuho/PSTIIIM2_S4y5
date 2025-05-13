import Layout from "@/pages/layout";
import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home/home-page";
import LoginPage from "./login/login-page";
import { SessionProvider } from "@/components/context/auth-context";
import RegisterPage from "./register/register-page";

function App() {
  return (
    <SessionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Layout>
    </SessionProvider>
  );
}

export default App;
