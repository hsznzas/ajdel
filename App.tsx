import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, View } from './types';
import type { FirestoreMenuItem } from './src/firebase';
import Background from './components/Background';
import MenuDeck from './src/components/MenuDeck';
import CelebrationModal from './src/components/CelebrationModal';
import FloatingActionButton from './src/components/FloatingActionButton';
import { LINKS, MENU_DATA, UI_STRINGS } from './constants';
import { 
  trackHomepageView, 
  trackMenuView, 
  trackDeliveryLinkClick, 
  trackLocationClick 
} from './utils/tiktokPixel';

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
  const [pendingLinkId, setPendingLinkId] = useState<string | null>(null);
  const [currentGif, setCurrentGif] = useState<string>('');
  
  // New states for dynamic menu
  const [selectedItem, setSelectedItem] = useState<FirestoreMenuItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Store open/closed status
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  
  // Track if user has scrolled to aggregators section
  const [hasReachedAggregators, setHasReachedAggregators] = useState(false);
  
  // Ref for aggregators section
  const aggregatorsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Track page views for TikTok Pixel
  useEffect(() => {
    if (view === 'home') {
      trackHomepageView();
    } else if (view === 'menu') {
      trackMenuView();
    }
  }, [view]);

  // Handle redirect after celebration GIF - deep link priority for mobile
  useEffect(() => {
    if (showCelebration && pendingLinkId) {
      const timer = setTimeout(() => {
        const link = LINKS.find(l => l.id === pendingLinkId);
        if (!link) return;

        // Priority: Try deep link first (for mobile apps)
        if (link.deepLink) {
          window.location.href = link.deepLink;
          // Fallback to web URL after 1.5s if app doesn't open
          setTimeout(() => {
            window.location.href = link.url;
          }, 1500);
        } else {
          // No deep link, use web URL
          window.location.href = link.url;
        }

        setShowCelebration(false);
        setPendingLinkId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, pendingLinkId]);

  // Preload all celebration GIFs on mount for instant display
  useEffect(() => {
    CELEBRATION_GIFS.forEach((gifSrc) => {
      const img = new Image();
      img.src = gifSrc;
    });
  }, []);

  // Intersection Observer to detect when user reaches aggregators section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHasReachedAggregators(entry.isIntersecting);
        });
      },
      { threshold: 0.3 } // Trigger when 30% of section is visible
    );

    if (aggregatorsRef.current) {
      observer.observe(aggregatorsRef.current);
    }

    return () => observer.disconnect();
  }, [view]);

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const handleLinkClick = (isInternal: boolean, linkId: string, linkName?: string) => {
    // Don't allow clicks when store is closed (except for location)
    if (!isStoreOpen && linkId !== 'location') {
      return;
    }
    
    if (isInternal) {
      setView('menu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Track TikTok Pixel event for external link clicks
      if (linkId === 'location') {
        trackLocationClick();
      } else if (linkId && linkName) {
        // Track delivery platform clicks as InitiateCheckout (high purchase intent)
        trackDeliveryLinkClick(linkId, linkName);
      }
      
      // Randomly select a celebration GIF
      const randomGif = CELEBRATION_GIFS[Math.floor(Math.random() * CELEBRATION_GIFS.length)];
      setCurrentGif(randomGif);
      // Show celebration GIF, then redirect after 2 seconds
      setPendingLinkId(linkId);
      setShowCelebration(true);
    }
  };

  // Cancel redirect when clicking on background
  const handleCancelRedirect = () => {
    setShowCelebration(false);
    setPendingLinkId(null);
  };

  // Handle view details from MenuDeck
  const handleViewDetails = (item: FirestoreMenuItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Scroll to aggregators section
  const scrollToAggregators = () => {
    aggregatorsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle store open status change from FAB
  const handleOpenStatusChange = useCallback((isOpen: boolean) => {
    setIsStoreOpen(isOpen);
  }, []);

  // Check if a button should be disabled (delivery apps only, not location)
  const isButtonDisabled = (linkId: string) => {
    if (linkId === 'location') return false; // Location always enabled
    return !isStoreOpen || showCelebration;
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
          <h1 className="text-[#F2BF97] text-3xl font-bold opacity-90 tracking-tight">
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

            {/* Dynamic Menu Deck - ABOVE aggregator buttons */}
            <MenuDeck 
              lang={lang} 
              onViewDetails={handleViewDetails}
            />
            
            {/* Aggregators Section */}
            <div ref={aggregatorsRef} id="aggregators" className="space-y-4 sm:space-y-6 animate-fadeIn pb-32">
              {/* Section Label */}
              <div className="text-center mb-6">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                  {lang === 'ar' ? 'اطلب عبر' : 'Order via'}
                </p>
                <div className="w-12 h-0.5 bg-[#F2BF97]/30 mx-auto" />
              </div>
              
              {LINKS.map(link => {
                const disabled = isButtonDisabled(link.id);
                const isDeliveryApp = link.id !== 'location';
                
                return (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.isInternal || false, link.id, link.label.en)}
                    disabled={disabled}
                    className={`
                      w-full relative border py-3 sm:py-4 px-4 sm:px-6 
                      rounded-2xl sm:rounded-[2rem] text-base sm:text-xl font-bold shadow-lg 
                      transition-all duration-500 group flex items-center justify-between gap-3 sm:gap-4
                      ${disabled && isDeliveryApp
                        ? 'bg-gray-500/20 border-gray-500/30 text-gray-400 cursor-not-allowed opacity-50'
                        : `shimmer-btn ${link.shimmerClass} border-white/40 hover:bg-white/20 text-[#F2BF97] hover:-translate-y-1.5 active:translate-y-0.5 active:scale-[0.98]`
                      }
                    `}
                  >
                    {/* App Icon */}
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-md flex-shrink-0 ${disabled && isDeliveryApp ? 'grayscale opacity-50' : 'bg-white/50'}`}>
                      <img 
                        src={link.icon} 
                        alt={link.label[lang]} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="relative z-10 flex-1 text-center">{link.label[lang]}</span>
                    <svg 
                      className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all duration-500 ${
                        disabled && isDeliveryApp 
                          ? 'opacity-20' 
                          : 'opacity-30 group-hover:opacity-100 group-hover:translate-x-1.5'
                      } ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1.5' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                    
                    {/* Closed Overlay for delivery apps */}
                    {disabled && isDeliveryApp && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl sm:rounded-[2rem]">
                        <span className="text-gray-300 text-sm font-medium">
                          {lang === 'ar' ? 'مغلق الآن' : 'Closed Now'}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
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

      {/* Floating Action Button - Centered Capsule */}
      <FloatingActionButton 
        onClick={scrollToAggregators}
        lang={lang}
        onOpenStatusChange={handleOpenStatusChange}
        hasReachedAggregators={hasReachedAggregators}
      />

      {/* Celebration/Details Modal */}
      <CelebrationModal
        item={selectedItem}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="w-full max-w-lg py-16 flex flex-col items-center gap-10 mt-auto">
        <div className="flex gap-12 justify-center">
          <a href="https://instagram.com/ajdel.sa" target="_blank" rel="noopener noreferrer" className="text-[#F2BF97] opacity-50 hover:opacity-100 hover:scale-125 transition-all duration-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="https://tiktok.com/@ajdel.sa" target="_blank" rel="noopener noreferrer" className="text-[#F2BF97] opacity-50 hover:opacity-100 hover:scale-125 transition-all duration-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
            </svg>
          </a>
          <a href="https://snapchat.com/add/ajdel.sa" target="_blank" rel="noopener noreferrer" className="text-[#F2BF97] opacity-50 hover:opacity-100 hover:scale-125 transition-all duration-300">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.166 3c.796 0 3.495.223 4.769 3.073.426.954.322 2.591.236 3.942l-.014.211c-.006.088-.012.175-.016.256-.01.164.073.252.13.279a.395.395 0 0 0 .167.041c.193 0 .466-.093.813-.211.142-.048.287-.073.43-.073.216 0 .418.054.589.161.246.154.384.397.384.667 0 .509-.545.808-1.063.997-.11.04-.225.076-.339.112-.384.12-.819.256-.96.553-.073.154-.058.341.047.557l.013.027c.083.178 2.035 4.37-.586 5.176-.297.092-.549.133-.78.133-.334 0-.614-.086-.875-.168l-.062-.02c-.259-.083-.507-.161-.834-.161-.122 0-.247.012-.378.038-.474.093-.899.395-1.34.71l-.033.024c-.325.232-.694.495-1.108.653-.248.095-.505.143-.763.143-.256 0-.512-.047-.758-.142-.414-.159-.784-.422-1.109-.654l-.033-.024c-.44-.315-.865-.617-1.339-.71a2.128 2.128 0 0 0-.378-.038c-.327 0-.575.078-.834.162l-.063.019c-.26.082-.54.168-.875.168-.23 0-.482-.041-.78-.133-2.62-.807-.669-4.999-.586-5.176l.013-.027c.105-.216.12-.403.047-.557-.141-.297-.576-.433-.96-.553a6.514 6.514 0 0 1-.339-.112c-.518-.189-1.063-.488-1.063-.997 0-.27.138-.513.384-.667a1.09 1.09 0 0 1 .59-.161c.142 0 .287.025.429.073.347.118.62.211.813.211a.394.394 0 0 0 .167-.041c.057-.027.14-.115.13-.279l-.016-.256-.014-.211c-.086-1.351-.19-2.988.236-3.942C8.505 3.223 11.204 3 12 3h.166z"/>
            </svg>
          </a>
        </div>
        
        <div className="text-center text-[#ECDAD2] text-sm opacity-60 font-medium tracking-wide">
          <p>Malqa, Riyadh, Saudi Arabia</p>
          <div className="flex items-center justify-center gap-5 mt-3">
            <span>Admin@ajdel.sa</span>
            <div className="w-1.5 h-1.5 bg-[#ECDAD2] rounded-full opacity-40"></div>
            <span>00966533484918</span>
          </div>
        </div>

        <div className="mt-6 text-[#ECDAD2] text-[10px] opacity-40 font-bold uppercase tracking-[0.4em]">
          &copy; MMXXIV AJDEL LUXE PASTRY
        </div>

        {/* Hidden Admin Link */}
        <a 
          href="/admin-login"
          className="text-[#ECDAD2]/10 text-[8px] hover:text-[#ECDAD2]/30 transition-colors cursor-pointer select-none"
        >
          ·
        </a>
      </footer>
    </div>
  );
};

export default App;
