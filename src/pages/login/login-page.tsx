import { LoginForm } from "./login-form";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-0">
      <div className="w-full max-w-[98vw] h-[600px] bg-white rounded-3xl shadow-2xl flex overflow-hidden mx-0">
        {/* Panel izquierdo: Bienvenida */}
        <div className="w-1/2 flex flex-col justify-center items-center bg-[#7da6fa] rounded-l-3xl text-white p-3">
          <h2 className="text-3xl font-extrabold mb-2 text-center">¡Hola, Bienvenido!</h2>
          <p className="mb-8 text-lg text-center">¿No tienes una cuenta?</p>
          <Link to="/register" className="border-2 border-white rounded-lg px-8 py-2 font-semibold hover:bg-white hover:text-blue-500 transition-colors">Registrarse</Link>
        </div>
        {/* Panel derecho: Formulario */}
        <div className="w-1/2 flex flex-col justify-center px-2 py-2">
          <h2 className="text-4xl font-extrabold mb-6 text-gray-800">Iniciar sesión</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
