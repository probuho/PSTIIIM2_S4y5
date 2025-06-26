import React from "react";

export function ProgressBar({ progreso }: { progreso: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-violet-500 h-4 rounded-full transition-all"
        style={{ width: `${progreso}%` }}
      />
    </div>
  );
} 