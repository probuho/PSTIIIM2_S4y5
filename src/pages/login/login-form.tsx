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
import { useSession, type User } from "@/components/context/auth-context";
import FormError from "@/components/error-form";
import axios from "axios";
import { API_ENDPOINTS } from "../../lib/config";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useSession();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | undefined>(undefined);
  const navigate = useNavigate();

  React.useEffect(() => {
    setTimeout(() => {
      setError(undefined);
    }, 2000);
  }, [error]);

  React.useEffect(() => {
    const authData = localStorage.getItem("auth");
    if (authData) {
      navigate("/");
    }
  }, [navigate]);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      try {
        const response = await axios.post(API_ENDPOINTS.SIGN_IN, {
          email: values.email,
          password: values.password,
        });

        const data = response.data as {
          user: User;
          accessToken: string;
          refreshToken: string;
        };
        signIn(data.user, data.accessToken, data.refreshToken);
        navigate("/");
      } catch (error: any) {
        const message = error.response
          ? error.response.data.error
          : error.message;
        setError(message);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-col items-center">
          <CardTitle>Inicia Sesión</CardTitle>
          <CardDescription>
            Ingrese su correo electrónico para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john.doe@movilnet.com.ve"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Contraseña</FormLabel>
                        <Link
                          to="/reset"
                          className="ml-auto text-xs underline-offset-2 hover:underline"
                        >
                          Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="*******"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormError message={error} />
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={isPending}>
                    Login
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="underline underline-offset-4">
                  Registrarse
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
