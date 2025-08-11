import React from "react";

interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ current, max, className = "", showLabel = true }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  // Calcular el color del degradado basado en el porcentaje
  const getGradientColor = (percent: number) => {
    if (percent > 60) return "from-green-500 to-green-400";
    if (percent > 30) return "from-yellow-500 to-orange-400";
    return "from-red-500 to-red-400";
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Tiempo Restante</span>
          <span className="text-sm font-bold text-gray-900">{current}s</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-full bg-gradient-to-r ${getGradientColor(percentage)} transition-all duration-300 ease-out rounded-full shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Indicador de tiempo crítico */}
      {percentage <= 20 && (
        <div className="mt-2 text-center">
          <span className="text-xs font-medium text-red-600 animate-pulse">
            ⚠️ ¡Tiempo crítico!
          </span>
        </div>
      )}
    </div>
  );
}
