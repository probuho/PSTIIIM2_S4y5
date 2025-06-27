import { useState } from "react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "../register/register-form";
import { Link, useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Si el usuario ya está autenticado, puedes redirigirlo aquí si lo deseas
  // useEffect(() => { ... });

  return (
    <div className="min-h-screen flex items-center justify-center bg-white pt-0">
      <div className="w-full max-w-[98vw] h-[600px] bg-white rounded-3xl shadow-2xl flex overflow-hidden mx-0">
        {/* Panel izquierdo: Formulario */}
        <div className="w-1/2 flex flex-col justify-center px-2 py-2">
          <h2 className="text-4xl font-extrabold mb-6 text-gray-800">
            {isLogin ? "Iniciar sesión" : "Registro"}
          </h2>
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
        {/* Panel derecho: Bienvenida / Cambio */}
        <div className="w-1/2 flex flex-col justify-center items-center bg-[#7da6fa] rounded-r-3xl text-white p-3">
          <h2 className="text-3xl font-extrabold mb-2 text-center">
            {isLogin ? "¡Bienvenido de nuevo!" : "¡Hola, bienvenido!"}
          </h2>
          <p className="mb-8 text-lg text-center">
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
          </p>
          <button
            className="border-2 border-white rounded-lg px-8 py-2 font-semibold hover:bg-white hover:text-blue-500 transition-colors"
            onClick={() => setIsLogin((prev) => !prev)}
          >
            {isLogin ? "Registrarse" : "Iniciar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
