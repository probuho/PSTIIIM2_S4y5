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

const RegisterSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  nickname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
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

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      surname: "",
      nickname: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    startTransition(async () => {
      try {
        const response = await axios.post(`http://localhost:4000/signUp`, {
          nombre: values.name,
          apellido: values.surname,
          nickname: values.nickname,
          email: values.email,
          password: values.password,
        });

        if (response.status === 200) {
          const data = response.data as {
            user: any;
            accessToken: string;
            refreshToken: string;
          };
          signIn(data.user, data.accessToken, data.refreshToken);
          navigate("/profile");
        } else {
          const data = response.data as { error: string };
          setError(data.error);
        }
      } catch (error) {
        toast.error(error as string);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-col items-center">
          <CardTitle>Registrate</CardTitle>
          <CardDescription>
            Ingrese tu información para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="nickname">Usuario</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="JohnDoe"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name">Nombre</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="surname">Apellido</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Doe"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                      <FormLabel>Contraseña</FormLabel>
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
                    Register
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Ya tienes un cuenta?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Inicia Sesion
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
