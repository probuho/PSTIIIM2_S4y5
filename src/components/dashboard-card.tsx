import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Gamepad2, MessageSquare, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  gradient: string;
}

export function DashboardCard({ title, description, icon, route, color, gradient }: DashboardCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            {icon}
          </div>
          <ArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200" size={20} />
        </div>
        <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={() => navigate(route)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200"
        >
          Explorar
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardGrid() {
  const cards = [
    {
      title: "Comunidad",
      description: "Conecta con otros jugadores y comparte experiencias",
      icon: <Users className="text-blue-600" size={24} />,
      route: "/community",
      color: "bg-blue-100",
      gradient: "bg-gradient-to-br from-blue-400 to-purple-500"
    },
    {
      title: "Juegos",
      description: "Disfruta de emocionantes juegos y desafíos",
      icon: <Gamepad2 className="text-green-600" size={24} />,
      route: "/games",
      color: "bg-green-100",
      gradient: "bg-gradient-to-br from-green-400 to-blue-500"
    },
    {
      title: "Chat",
      description: "Comunícate en tiempo real con otros usuarios",
      icon: <MessageSquare className="text-purple-600" size={24} />,
      route: "/chat",
      color: "bg-purple-100",
      gradient: "bg-gradient-to-br from-purple-400 to-pink-500"
    },
    {
      title: "Logros",
      description: "Revisa tus logros y estadísticas",
      icon: <Trophy className="text-yellow-600" size={24} />,
      route: "/achievements",
      color: "bg-yellow-100",
      gradient: "bg-gradient-to-br from-yellow-400 to-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {cards.map((card, index) => (
        <DashboardCard key={index} {...card} />
      ))}
    </div>
  );
} 