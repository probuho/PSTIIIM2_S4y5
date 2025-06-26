import { User, AtSign, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const container = document.querySelector(".container");
  const registerBtn = document.querySelector(".register-btn");
  const loginBtn = document.querySelector(".login-btn");

  registerBtn?.addEventListener("click", () => {
    container?.classList.add("active");
  });

  loginBtn?.addEventListener("click", () => {
    container?.classList.remove("active");
  });

  return (
    <div className="container">
      <div className="form-box login">
        <form action="#">
          <h1>Iniciar sesión</h1>
          <div className="input-box">
            <input type="text" placeholder="Usuario" required />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Contraseña" required />
            <i className="bx bxs-lock-alt"></i>
          </div>
          <div className="forgot-link">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
          <button type="submit" className="btn">
            Entrar
          </button>
        </form>
      </div>

      <div className="form-box register">
        <form action="#">
          <h1>Registro</h1>
          <div className="input-box relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={20} />
            </span>
            <input type="text" placeholder="Usuario" required className="pl-14" />
          </div>
          <div className="input-box relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <AtSign size={20} />
            </span>
            <input type="text" placeholder="Nickname" required className="pl-14" />
          </div>
          <div className="input-box relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={20} />
            </span>
            <input type="email" placeholder="Correo electrónico" required className="pl-14" />
          </div>
          <div className="input-box relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={20} />
            </span>
            <input type="password" placeholder="Contraseña" required className="pl-14" />
          </div>
          <button type="submit" className="btn">
            Registrarse
          </button>
        </form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>¡Hola, bienvenido!</h1>
          <p>¿No tienes una cuenta?</p>
          <button className="btn register-btn">Registrarse</button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>¡Bienvenido de nuevo!</h1>
          <p>¿Ya tienes una cuenta?</p>
          <button className="btn login-btn">Entrar</button>
        </div>
      </div>
    </div>
  );
}
