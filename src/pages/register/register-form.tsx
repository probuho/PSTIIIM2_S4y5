import z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import { useSession } from "@/components/context/auth-context";
import { toast } from "sonner";
import FormError from "@/components/error-form";
import axios from "axios";
import { Mail, Lock, User, UserCheck, AtSign } from "lucide-react";

const RegisterSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  surname: z.string().min(1, { message: "El apellido es obligatorio" }),
  nickname: z.string().min(1, { message: "El nickname es obligatorio" }),
  email: z.string().email({ message: "Correo inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

// const { VITE_BACKEND_URL } = process.env;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useSession();
  const navigate = useNavigate();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | undefined>(undefined);

  // Verificación de si ya se esta registrado
  React.useEffect(() => {
    const authData = localStorage.getItem("auth");
    if (authData) {
      navigate("/"); // Redirecciona si ya esta iniciada la sesión
    }
  }, [navigate]);

  const form = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", surname: "", nickname: "", email: "", password: "" },
  });

  const onSubmit = (values) => {
    startTransition(async () => {
      try {
        const response = await axios.post(`http://localhost:3001/signUp`, {
          nombre: values.name,
          apellido: values.surname,
          nickname: values.nickname,
          email: values.email,
          password: values.password,
        });
        if (response.status === 200) {
          const data = response.data;
          signIn(data.user, data.accessToken, data.refreshToken);
          toast.success("¡Registro exitoso! Bienvenido/a a la comunidad.");
          navigate("/");
        } else {
          const data = response.data;
          toast.error(data.error || "Ocurrió un error, por favor intenta de nuevo.");
        }
      } catch (error) {
        let message = "";
        if (error.response?.status === 400) {
          message = "El correo o nickname ya está registrado.";
        } else if (error.response?.data?.error) {
          // Si es un error técnico de Prisma/MongoDB, mostrar mensaje amigable y loguear el técnico
          if (error.response.data.error.includes("replica set")) {
            message = "No se pudo crear el usuario. Por favor, contacta al administrador.";
            console.error("Error técnico:", error.response.data.error);
          } else {
            message = error.response.data.error;
          }
        } else {
          message = "Ocurrió un error, por favor intenta de nuevo.";
        }
        toast.error(message);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full bg-white rounded-xl shadow-lg border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="text-white" size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Crear Cuenta</CardTitle>
          <CardDescription className="text-gray-500">
            Completa tus datos para unirte a la comunidad
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="text"
                          placeholder="Nombre"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 w-full"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              {/* Apellido */}
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="text"
                          placeholder="Apellido"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 w-full"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              {/* Nickname */}
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="text"
                          placeholder="Nickname"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 w-full"
                        />
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="email"
                          placeholder="Correo electrónico"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 w-full"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              {/* Contraseña */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="password"
                          placeholder="Contraseña"
                          autoComplete="new-password"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 w-full"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              <FormError message={error} />

              {/* Botón de registro */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={isPending}
              >
                {isPending ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>

              {/* Enlace para ir al login */}
              <div className="text-center pt-4">
                <p className="text-gray-500 text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
