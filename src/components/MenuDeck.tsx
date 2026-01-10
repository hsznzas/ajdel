import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenuItems, incrementViewCount, type FirestoreMenuItem } from '../supabase';
import { ttqViewContent } from '../../utils/tiktokPixel';

// Aggregator data
const AGGREGATOR_INFO: Record<string, { name: string; nameAr: string; logo: string; color: string }> = {
  jahez: { name: 'Jahez', nameAr: 'جاهز', logo: '/images/LINK_Jahez.png', color: '#d11928' },
  hungerstation: { name: 'HungerStation', nameAr: 'هنقرستيشن', logo: '/images/LINK_HungerStation.png', color: '#ffcc00' },
  keeta: { name: 'Keeta', nameAr: 'كيتا', logo: '/images/LINK_Keeta.png', color: '#ffd700' },
  ninja: { name: 'Ninja', nameAr: 'نينجا', logo: '/images/LINK_Ninja.png', color: '#00c6bf' },
};

// Easter egg celebration emojis
const CELEBRATION_EMOJIS = ['🎉', '✨', '🎊', '💫', '🌟', '🎀', '💝', '🍰', '🧁', '🍩'];

// Fallback Image Component with Peach Placeholder
const ImageWithFallback: React.FC<{
  src: string;
  alt: string;
  name: string;
  large?: boolean;
}> = ({ src, alt, name, large }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className={`w-full h-full bg-[#F2BF97]/20 flex items-center justify-center ${large ? 'min-h-[200px]' : ''}`}>
        <span className={`text-[#F2BF97] font-bold text-center px-2 ${large ? 'text-lg' : 'text-xs'}`}>
          {name.slice(0, large ? 30 : 10)}
        </span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={`absolute inset-0 bg-[#F2BF97]/10 flex items-center justify-center`}>
          <div className="w-6 h-6 border-2 border-[#F2BF97] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img 
        src={src} 
        alt={alt}
        className={`w-full h-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
};

interface MenuDeckProps {
  lang: 'ar' | 'en';
  onViewDetails: (item: FirestoreMenuItem) => void;
}

// Generate fake social proof
const generateSocialProof = () => ({
  rating: (4 + Math.random()).toFixed(1),
  reviews: Math.floor(Math.random() * 86) + 12,
});

const MenuDeck: React.FC<MenuDeckProps> = ({ lang, onViewDetails }) => {
  const [menuItems, setMenuItems] = useState<FirestoreMenuItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [socialProof] = useState<Record<string, { rating: string; reviews: number }>>({});
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const [currentEmoji, setCurrentEmoji] = useState<string>('🎉');
  const emojiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const items = await getMenuItems();
      // Only show available items
      setMenuItems(items.filter(item => item.isAvailable));
      setLoading(false);
    };
    fetchItems();
  }, []);

  // Get or generate social proof for an item
  const getSocialProof = (itemId: string) => {
    if (!socialProof[itemId]) {
      socialProof[itemId] = generateSocialProof();
    }
    return socialProof[itemId];
  };

  const handleCardClick = async (item: FirestoreMenuItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      setShowEmoji(null);
    } else {
      setExpandedId(item.id);
      
      // Show celebration emoji easter egg
      const randomEmoji = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)];
      setCurrentEmoji(randomEmoji);
      setShowEmoji(item.id);
      
      // Clear any existing timeout
      if (emojiTimeoutRef.current) {
        clearTimeout(emojiTimeoutRef.current);
      }
      
      // Hide emoji after 3 seconds
      emojiTimeoutRef.current = setTimeout(() => {
        setShowEmoji(null);
      }, 3000);
      
      // Track view in Firestore
      await incrementViewCount(item.id);
      
      // Track TikTok Pixel ViewContent
      ttqViewContent({
        contents: [{
          content_id: item.id,
          content_type: 'product',
          content_name: item.nameEn,
        }]
      });
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emojiTimeoutRef.current) {
        clearTimeout(emojiTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-[#F2BF97] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (menuItems.length === 0) {
    return null; // Don't show anything if no items
  }

  return (
    <div className="w-full mb-10">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-[#F2BF97] text-xl font-bold mb-2">
          {lang === 'ar' ? 'قائمتنا' : 'Our Menu'}
        </h2>
        <div className="w-16 h-0.5 bg-[#F2BF97]/30 mx-auto" />
      </div>

      {/* Menu Cards Stack */}
      <div className="space-y-3">
        <AnimatePresence>
          {menuItems.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const proof = getSocialProof(item.id);
            const primaryAggregator = item.availableOn[0];
            const aggInfo = primaryAggregator ? AGGREGATOR_INFO[primaryAggregator] : null;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  layout: { duration: 0.3, ease: 'easeOut' }
                }}
                className="w-full"
              >
                <motion.div
                  layout
                  onClick={() => handleCardClick(item)}
                  className={`
                    relative overflow-hidden cursor-pointer
                    bg-white/10 backdrop-blur-xl border border-white/20 
                    rounded-2xl shadow-lg
                    transition-colors duration-300
                    ${isExpanded ? 'bg-white/15' : 'hover:bg-white/15'}
                  `}
                >
                  {/* Collapsed View */}
                  <motion.div 
                    layout="position"
                    className="flex items-start gap-3 p-4"
                  >
                    {/* Thumbnail */}
                    <motion.div 
                      layout
                      className={`
                        flex-shrink-0 rounded-xl overflow-hidden relative
                        ${isExpanded ? 'w-0 h-0 opacity-0' : 'w-16 h-16'}
                      `}
                      transition={{ duration: 0.2 }}
                    >
                      <ImageWithFallback 
                        src={item.imageUrl}
                        alt={lang === 'ar' ? item.nameAr : item.nameEn}
                        name={lang === 'ar' ? item.nameAr : item.nameEn}
                      />
                    </motion.div>

                    {/* Content: Name, Description, Price & Apps */}
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <h3 className="text-white font-bold text-base truncate mb-1">
                        {lang === 'ar' ? item.nameAr : item.nameEn}
                      </h3>
                      
                      {/* One-line Description (collapsed only) */}
                      {!isExpanded && (
                        <p className="text-white/50 text-xs truncate mb-2">
                          {lang === 'ar' ? item.descriptionAr : item.descriptionEn}
                        </p>
                      )}
                      
                      {/* Price & Available Apps Row */}
                      {!isExpanded && (
                        <div className="flex items-center justify-between gap-2">
                          {/* Price */}
                          <span className="text-[#F2BF97] font-bold text-sm">
                            {item.deliveryPrice} {lang === 'ar' ? 'ريال' : 'SAR'}
                          </span>
                          
                          {/* Available Apps (mini logos) */}
                          {item.availableOn.length > 0 && (
                            <div className="flex items-center gap-1">
                              {item.availableOn.slice(0, 4).map(aggId => {
                                const info = AGGREGATOR_INFO[aggId];
                                if (!info) return null;
                                return (
                                  <img 
                                    key={aggId}
                                    src={info.logo} 
                                    alt={info.name} 
                                    className="w-5 h-5 rounded-md"
                                    title={lang === 'ar' ? info.nameAr : info.name}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expand Arrow */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mt-1"
                    >
                      <svg 
                        className="w-4 h-4 text-[#F2BF97]" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          {/* High-res Image with Celebration Emoji Easter Egg */}
                          <div className="relative rounded-xl overflow-hidden mb-4 aspect-[4/3]">
                            <ImageWithFallback 
                              src={item.imageUrl}
                              alt={lang === 'ar' ? item.nameAr : item.nameEn}
                              name={lang === 'ar' ? item.nameAr : item.nameEn}
                              large
                            />
                            
                            {/* Celebration Emoji Easter Egg */}
                            <AnimatePresence>
                              {showEmoji === item.id && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0, y: 20 }}
                                  animate={{ scale: 1, opacity: 1, y: 0 }}
                                  exit={{ scale: 0, opacity: 0, y: -20 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                  <motion.span 
                                    className="text-6xl drop-shadow-2xl"
                                    animate={{ 
                                      rotate: [0, -10, 10, -10, 0],
                                      scale: [1, 1.2, 1]
                                    }}
                                    transition={{ 
                                      duration: 0.5, 
                                      repeat: 2,
                                      repeatDelay: 0.5
                                    }}
                                  >
                                    {currentEmoji}
                                  </motion.span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Tags Overlay */}
                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                              {item.isNew && (
                                <span className="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-lg shadow-lg">
                                  {lang === 'ar' ? 'جديد' : 'New'}
                                </span>
                              )}
                              {item.isBestSeller && (
                                <span className="px-2 py-1 bg-[#F2BF97] text-[#0c2d3d] text-xs font-bold rounded-lg shadow-lg">
                                  {lang === 'ar' ? 'الأكثر مبيعاً' : 'Best Seller'}
                                </span>
                              )}
                              {item.isStoreExclusive && (
                                <span className="px-2 py-1 bg-purple-500/90 text-white text-xs font-bold rounded-lg shadow-lg">
                                  {lang === 'ar' ? 'حصري للمتجر' : 'Store Exclusive'}
                                </span>
                              )}
                              {item.isPreRequestOnly && (
                                <span className="px-2 py-1 bg-orange-500/90 text-white text-xs font-bold rounded-lg shadow-lg">
                                  {lang === 'ar' ? 'طلب مسبق' : 'Pre-request Only'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Name & Description */}
                          <div className="mb-4">
                            <h3 className="text-white font-bold text-xl mb-1 font-serif">
                              {lang === 'ar' ? item.nameAr : item.nameEn}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed font-serif italic">
                              {lang === 'ar' ? item.descriptionAr : item.descriptionEn}
                            </p>
                          </div>

                          {/* Price & Social Proof */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-[#F2BF97] font-bold text-2xl">
                                {item.deliveryPrice}
                              </span>
                              <span className="text-[#F2BF97]/60 text-sm ml-1">
                                {lang === 'ar' ? 'ريال' : 'SAR'}
                              </span>
                            </div>

                            {/* Fake Social Proof */}
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg 
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(Number(proof.rating)) ? 'text-yellow-400' : 'text-white/20'}`}
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-white/40 text-xs">
                                {proof.rating} ({proof.reviews})
                              </span>
                            </div>
                          </div>

                          {/* Aggregator Info with Delivery Prices */}
                          {item.availableOn.length > 0 && (
                            <div className="mb-4">
                              <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">
                                {lang === 'ar' ? 'متوفر للتوصيل عبر:' : 'Order via delivery:'}
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {item.availableOn.map(aggId => {
                                  const info = AGGREGATOR_INFO[aggId];
                                  if (!info) return null;
                                  return (
                                    <div 
                                      key={aggId}
                                      className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                                    >
                                      <img 
                                        src={info.logo} 
                                        alt={info.name} 
                                        className="w-6 h-6 rounded"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <span className="text-white text-sm block truncate">
                                          {lang === 'ar' ? info.nameAr : info.name}
                                        </span>
                                        <span className="text-[#F2BF97] text-xs font-bold">
                                          {item.deliveryPrice} {lang === 'ar' ? 'ر.س' : 'SAR'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(item);
                            }}
                            className="w-full py-3 bg-[#F2BF97] text-[#012842] font-bold rounded-xl hover:bg-[#ECDAD2] active:scale-[0.98] transition-all shadow-lg"
                          >
                            {lang === 'ar' ? 'عرض التفاصيل' : 'View Specs'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MenuDeck;
