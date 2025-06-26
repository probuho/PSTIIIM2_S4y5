import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";

export default function SightingDetail() {
  const { id } = useParams();
  // ...resto del contenido igual que antes...
  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      {/* ...contenido igual que antes... */}
    </div>
  );
} 