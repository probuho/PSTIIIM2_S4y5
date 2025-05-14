import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { verifiedSightings } from "./data";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "@/components/context/auth-context";
import React from "react";

export default function CommunityPage() {
  const { session } = useSession();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!session) navigate("/login");
  }, [session]);

  return (
    <div className="flex flex-col gap-4">
      <Label className="text-3xl">Foro de la Comunidad</Label>
      <Card className="bg-slate-100">
        <CardHeader>
          <span className="w-4 h-4 text-2xl">👁️</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label>VERIFICADO POR LA COMUNIDAD</Label>
          <span>Resumen de Avistamientos Verificados</span>
          <p className="text-muted-foreground">
            Observaciones recientes de vida silvestre verificadas por nuestra
            red de exploradores.
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {verifiedSightings.map((item) => (
          <Card key={item.id} className="bg-slate-100">
            <CardHeader>
              <span className="text-4xl h-8 w-8">{item.icon}</span>
            </CardHeader>
            <CardContent className="flex-1">
              <CardTitle>{item.title}</CardTitle>
              <span className="text-muted-foreground">{item.description}</span>
              <div className="ml-auto">
                <Button type="button" asChild>
                  <Link to={item.action.link}>{item.action.text}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
