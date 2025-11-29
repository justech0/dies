import React from 'react';

export const DiesLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Left Roof - Red */}
    <path d="M4 28L22 8L40 28" stroke="#D90429" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Chimney on Left Roof (Red) */}
    <path d="M10 20V10" stroke="#D90429" strokeWidth="4" strokeLinecap="round"/>

    {/* Right Roof - CurrentColor - Slightly offset to right and back */}
    <path d="M30 22L46 6L62 22" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Windows (4 squares) - Centered under left roof area */}
    {/* Top Row */}
    <rect x="17" y="32" width="4" height="4" fill="currentColor" />
    <rect x="23" y="32" width="4" height="4" fill="currentColor" />
    {/* Bottom Row */}
    <rect x="17" y="38" width="4" height="4" fill="currentColor" />
    <rect x="23" y="38" width="4" height="4" fill="currentColor" />
  </svg>
);

export const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);