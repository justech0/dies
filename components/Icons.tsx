import React from 'react';

// LOGO UPDATE:
// Bu bileşen artık projenizin 'public' klasöründeki 'logo.png' dosyasını çeker.
// Logonuzu değiştirmek için proje ana dizinindeki public klasörüne 'logo.png' isminde dosyanızı atmanız yeterlidir.
export const DiesLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="/logo.png" 
    alt="Dies Gayrimenkul" 
    className={`object-contain ${className}`}
    onError={(e) => {
      // Eğer logo yüklenemezse (dosya yoksa) geçici bir metin gösterir veya varsayılan bir imaj kullanır
      e.currentTarget.style.display = 'none';
      // Yedek metin gösterimi parent element tarafından yönetilebilir veya buraya fallback eklenebilir.
    }}
  />
);

export const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);