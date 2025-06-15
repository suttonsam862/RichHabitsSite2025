// Simple icon placeholder - no external dependencies
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const Icon = ({ size = 24, className = '' }: IconProps) => (
  <span className={`inline-block w-${Math.floor(size/4)} h-${Math.floor(size/4)} ${className}`} style={{width: size, height: size}}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1"/>
    </svg>
  </span>
);

// Export common icon names as the same component for compatibility
export const ShoppingCart = Icon;
export const Menu = Icon;
export const X = Icon;
export const Plus = Icon;
export const Minus = Icon;
export const Check = Icon;
export const ChevronDown = Icon;
export const ChevronRight = Icon;
export const ChevronLeft = Icon;
export const Star = Icon;
export const Users = Icon;
export const User = Icon;
export const Calendar = Icon;
export const MapPin = Icon;
export const ArrowRight = Icon;
export const ArrowLeft = Icon;
export const Trash2 = Icon;
export const Search = Icon;
export const AlertCircle = Icon;
export const CheckCircle = Icon;
export const Loader2 = Icon;
export const Info = Icon;
export const Upload = Icon;
export const Trophy = Icon;
export const Heart = Icon;
export const DollarSign = Icon;
export const MoreHorizontal = Icon;
export const ChevronUp = Icon;
export const ChevronDown = Icon;
export const Check = Icon;
export const Circle = Icon;
export const Dot = Icon;
export const GripVertical = Icon;
export const PanelLeft = Icon;
export const ShoppingBag = Icon;
export const CreditCard = Icon;