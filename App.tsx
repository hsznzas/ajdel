import React, { useState, useEffect } from 'react';
import { Language, View } from './types';
import Background from './components/Background';
import { LINKS, MENU_DATA, UI_STRINGS } from './constants';

// Array of celebration GIFs to randomly choose from
const CELEBRATION_GIFS = [
  '/images/arab-arabic.gif',
  '/images/arab-dance.gif',
  '/images/arab-dancing-muslim-dancing.gif',
  '/images/arab-habibi.gif',
  '/images/arab-party-arab-men.gif',
  '/images/bugcat-tutu.gif',
  '/images/cheers-new-york.gif',
  '/images/dance-saudi.gif',
  '/images/excited-ah.gif',
  '/images/excited-im-so-excited.gif',
  '/images/happy-japanese-anime.gif',
  '/images/happy.gif',
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [view, setView] = useState<View>('home');
  const [showCelebration, setShowCelebration] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [currentGif, setCurrentGif] = useState<string>('');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Handle redirect after celebration GIF
  useEffect(() => {
    if (showCelebration && pendingUrl) {
      const timer = setTimeout(() => {
        window.open(pendingUrl, '_blank', 'noopener,noreferrer');
        setShowCelebration(false);
        setPendingUrl(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, pendingUrl]);

  // Preload all celebration GIFs on mount for instant display
  useEffect(() => {
    CELEBRATION_GIFS.forEach((gifSrc) => {
      const img = new Image();
      img.src = gifSrc;
    });
  }, []);

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const handleLinkClick = (isInternal: boolean, url: string) => {
    if (isInternal) {
      setView('menu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Randomly select a celebration GIF
      const randomGif = CELEBRATION_GIFS[Math.floor(Math.random() * CELEBRATION_GIFS.length)];
      setCurrentGif(randomGif);
      // Show celebration GIF, then redirect after 2 seconds
      setPendingUrl(url);
      setShowCelebration(true);
    }
  };

  // Cancel redirect when clicking on background
  const handleCancelRedirect = () => {
    setShowCelebration(false);
    setPendingUrl(null);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-6 md:p-12 ${lang === 'ar' ? 'font-ar' : 'font-en'}`}>
      <Background />

      {/* Header / Language Switcher */}
      <div className="w-full max-w-lg flex justify-end mb-10">
        <button 
          onClick={toggleLang}
          className="bg-white/30 backdrop-blur-md border border-white/40 px-6 py-2 rounded-full text-[#012842] font-bold shadow-sm active:scale-95 transition-all hover:bg-white/50"
        >
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-lg flex-1 flex flex-col items-center">
        {/* Brand Logo */}
        <div className="mb-14 text-center">
          <div className="w-36 h-36 bg-white/30 backdrop-blur-2xl border border-white/40 rounded-full flex items-center justify-center shadow-2xl mb-6 mx-auto relative group overflow-hidden">
            <img 
              src="/images/BrandLogoGif.gif" 
              alt="AJDEL Logo" 
              className="w-full h-full object-cover relative z-10"
            />
          </div>
          <h1 className="text-[#012842] text-3xl font-bold opacity-90 tracking-tight">
            {lang === 'ar' ? 'أجدل' : 'AJDEL'}
          </h1>
          <p className="text-[#012842] text-sm opacity-60 mt-2 uppercase tracking-[0.3em]">
            {lang === 'ar' ? 'حلويات فاخرة' : 'Premium Pastries'}
          </p>
        </div>

        {view === 'home' ? (
          <div className="w-full relative">
            {/* Celebration GIF Overlay - appears on top of buttons */}
            {showCelebration && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn p-4"
                onClick={handleCancelRedirect}
              >
                <div 
                  className="bg-white/40 backdrop-blur-2xl border border-white/50 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-8 shadow-2xl flex flex-col items-center gap-4 sm:gap-6 max-w-[90vw] sm:max-w-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img 
                    src={currentGif} 
                    alt="Celebration!" 
                    className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-xl sm:rounded-2xl"
                  />
                  {/* Loading Progress Bar */}
                  <div className="w-full h-1.5 sm:h-2 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#012842] rounded-full"
                      style={{
                        animation: 'loadingProgress 2s linear forwards'
                      }}
                    />
                  </div>
                  {/* Cancel hint for mobile */}
                  <p className="text-[#012842]/50 text-xs sm:text-sm">
                    {lang === 'ar' ? 'اضغط في الخارج للإلغاء' : 'Tap outside to cancel'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Buttons - stay in place */}
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              {LINKS.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.isInternal || false, link.url)}
                  disabled={showCelebration}
                  className={`w-full shimmer-btn ${link.shimmerClass} bg-white/25 backdrop-blur-xl border border-white/40 hover:bg-white/40 text-[#012842] py-3 sm:py-4 px-4 sm:px-6 rounded-2xl sm:rounded-[2rem] text-base sm:text-xl font-bold shadow-lg hover:-translate-y-1.5 active:translate-y-0.5 active:scale-[0.98] transition-all duration-500 group flex items-center justify-between gap-3 sm:gap-4 disabled:pointer-events-none`}
                >
                  {/* App Icon - circular like mobile app icons */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-white/50">
                    <img 
                      src={link.icon} 
                      alt={link.label[lang]} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="relative z-10 flex-1 text-center">{link.label[lang]}</span>
                  <svg 
                    className={`w-5 h-5 sm:w-6 sm:h-6 opacity-30 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-1.5 flex-shrink-0 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1.5' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full animate-slideUp">
             <button 
              onClick={() => setView('home')}
              className="mb-10 flex items-center gap-4 text-[#012842] opacity-60 hover:opacity-100 font-bold transition-all group"
            >
              <div className={`p-2.5 bg-white/20 rounded-full backdrop-blur-md group-hover:bg-white/40 transition-all ${lang === 'ar' ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-lg">{UI_STRINGS[lang].back}</span>
            </button>

            <div className="bg-white/10 backdrop-blur-3xl border border-white/30 rounded-[3rem] p-10 shadow-2xl overflow-hidden mb-16">
              <div className="flex justify-between items-end mb-12 border-b border-white/20 pb-8">
                <div>
                  <h2 className="text-[#012842] text-3xl font-bold">
                    {lang === 'ar' ? 'قائمة الطعام' : 'The Menu'}
                  </h2>
                  <p className="text-[#012842] text-sm opacity-50 uppercase tracking-widest mt-2">
                    {lang === 'ar' ? 'مختاراتنا اليومية' : 'Daily Selection'}
                  </p>
                </div>
              </div>
              <ul className="space-y-8">
                {MENU_DATA.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center gap-6 text-[#012842] group">
                    <span className="text-lg font-medium opacity-80 group-hover:opacity-100 transition-opacity">{item.name[lang]}</span>
                    <div className="flex-1 border-b border-dashed border-[#012842]/10 h-0 translate-y-2 opacity-30" />
                    <span className="font-bold text-xl whitespace-nowrap">
                      {item.price} <span className="text-xs opacity-60 font-medium ml-1.5 uppercase">{UI_STRINGS[lang].currency}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg py-16 flex flex-col items-center gap-10 mt-auto">
        <div className="flex gap-12 justify-center">
          <a href="https://instagram.com" target="_blank" className="text-[#012842] opacity-40 hover:opacity-100 hover:scale-125 transition-all duration-300">
             <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
          </a>
          <a href="https://tiktok.com" target="_blank" className="text-[#012842] opacity-40 hover:opacity-100 hover:scale-125 transition-all duration-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
          </a>
          <a href="https://snapchat.com" target="_blank" className="text-[#012842] opacity-40 hover:opacity-100 hover:scale-125 transition-all duration-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-4.97 0-9 4.03-9 9 0 1.25.26 2.45.72 3.53l-1.72 5.47 5.47-1.72c1.08.46 2.28.72 3.53.72 4.97 0 9-4.03 9-9s-4.03-9-9-9zm4.5 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-4.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-4.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </a>
        </div>
        
        <div className="text-center text-[#012842] text-sm opacity-40 font-medium tracking-wide">
          <p>Malqa, Riyadh, Saudi Arabia</p>
          <div className="flex items-center justify-center gap-5 mt-3">
            <span>info@ajdel.sa</span>
            <div className="w-1.5 h-1.5 bg-[#012842] rounded-full opacity-20"></div>
            <span>+966 50 000 0000</span>
          </div>
        </div>

        <div className="mt-6 text-[#012842] text-[10px] opacity-25 font-bold uppercase tracking-[0.4em]">
          &copy; MMXXIV AJDEL LUXE PASTRY
        </div>
      </footer>
    </div>
  );
};

export default App;