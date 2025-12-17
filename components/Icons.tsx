import React, { useState } from 'react';

// LOGO: Uses /logo.png from the public folder with text fallback
export const DiesLogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex flex-col items-start leading-none ${className}`}>
        <span className="text-dies-blue font-black tracking-tighter text-xl md:text-2xl">DİES</span>
        <span className="text-dies-red font-bold text-[8px] md:text-[10px] tracking-widest mt-[-2px]">GAYRİMENKUL</span>
      </div>
    );
  }

  return (
    <img 
      src="/logo.png" 
      alt="Dies Gayrimenkul" 
      className={`object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
};

export const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
