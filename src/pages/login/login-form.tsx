import z from "zod";
import React from "react";
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
import { useSession } from "@/components/context/auth-context";
import { toast } from "sonner";
import FormError from "@/components/error-form";
import axios from "axios";
import { Mail, Lock } from "lucide-react";

const LoginSchema = z.object({
  email: z.string().email({ message: "Correo inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useSession();
  const navigate = useNavigate();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | undefined>(undefined);

  // Verificación de si ya está logueado
  React.useEffect(() => {
    const authData = localStorage.getItem("auth");
    if (authData) {
      navigate("/");
    }
  }, [navigate]);

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      try {
        const response = await axios.post(`http://localhost:3001/signIn`, values);
        const data = response.data;
        signIn(data.user, data.accessToken, data.refreshToken);
        toast.success("¡Inicio de sesión exitoso!");
        navigate("/");
      } catch (error: any) {
        let message = "";
        if (error.response?.status === 401) {
          message = "Tus credenciales son incorrectas.";
        } else if (error.response?.data?.error) {
          message = error.response.data.error;
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
            <Lock className="text-white" size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Iniciar sesión</CardTitle>
          <CardDescription className="text-gray-500">
            Accede a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
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
                          autoComplete="current-password"
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
              {/* Botón de login */}
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]" disabled={isPending}>
                {isPending ? "Entrando..." : "Entrar"}
              </Button>
              {/* Enlaces */}
              <div className="text-center pt-4">
                <p className="text-gray-500 text-sm">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Crear cuenta
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
