import React from "react";

interface TooltipProviderProps {
  children: React.ReactNode;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-2 rounded text-xs bottom-full left-1/2 transform -translate-x-1/2 mb-1">
        {content}
      </div>
    </div>
  );
}