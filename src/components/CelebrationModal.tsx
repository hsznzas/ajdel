import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertToDirectImageUrl, type FirestoreMenuItem } from '../supabase';

// GIFs for celebration
const CELEBRATION_GIFS = [
  '/images/excited-ah.gif',
  '/images/arab-dance.gif',
];

interface CelebrationModalProps {
  item: FirestoreMenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ 
  item, 
  isOpen, 
  onClose, 
  lang 
}) => {
  if (!item) return null;

  // Pick a random GIF
  const celebrationGif = CELEBRATION_GIFS[Math.floor(Math.random() * CELEBRATION_GIFS.length)];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1f405f] to-[#153450] border border-white/20 rounded-3xl shadow-2xl"
          >
            {/* Celebration GIF Header */}
            <div className="relative flex justify-center pt-6 pb-2">
              <motion.img
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                src={celebrationGif}
                alt="Celebration!"
                className="w-24 h-24 object-contain rounded-xl"
              />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* "Sweets" Typography */}
            <div className="text-center mb-4">
              <h2 className="text-[#F2BF97] text-3xl font-bold font-serif tracking-wide">
                {lang === 'ar' ? '✨ حلويات ✨' : '✨ Sweets ✨'}
              </h2>
            </div>

            {/* Big Product Image */}
            <div className="px-6 mb-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 shadow-xl">
                {item.imageUrl ? (
                  <img 
                    src={convertToDirectImageUrl(item.imageUrl)} 
                    alt={lang === 'ar' ? item.nameAr : item.nameEn}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#F2BF97]/30 text-6xl">
                    🍰
                  </div>
                )}

                {/* Tags */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {item.isNew && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                      {lang === 'ar' ? 'جديد!' : 'New!'}
                    </span>
                  )}
                  {item.isBestSeller && (
                    <span className="px-3 py-1 bg-[#F2BF97] text-[#0b253c] text-sm font-bold rounded-full shadow-lg">
                      {lang === 'ar' ? '⭐ الأكثر مبيعاً' : '⭐ Best Seller'}
                    </span>
                  )}
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 rounded-xl shadow-lg">
                  <span className="text-[#0b253c] font-bold text-2xl">{item.deliveryPrice}</span>
                  <span className="text-[#0b253c]/60 text-sm ml-1">
                    {lang === 'ar' ? 'ريال' : 'SAR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="px-6 pb-8">
              {/* Name */}
              <h3 className="text-white text-2xl font-bold font-serif mb-3 text-center">
                {lang === 'ar' ? item.nameAr : item.nameEn}
              </h3>

              {/* Description */}
              <p className="text-white/60 text-center leading-relaxed mb-6 font-serif italic">
                {lang === 'ar' ? item.descriptionAr : item.descriptionEn}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs mb-1">
                    {lang === 'ar' ? 'التصنيف' : 'Category'}
                  </p>
                  <p className="text-white font-medium capitalize">{item.category}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-white/40 text-xs mb-1">
                    {lang === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}
                  </p>
                  <p className="text-[#F2BF97] font-bold">{item.deliveryPrice} SAR</p>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {item.isStoreExclusive && (
                  <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
                    {lang === 'ar' ? '🏪 حصري للمتجر' : '🏪 Store Exclusive'}
                  </span>
                )}
                {item.isPreRequestOnly && (
                  <span className="px-3 py-1.5 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30">
                    {lang === 'ar' ? '📋 طلب مسبق فقط' : '📋 Pre-request Only'}
                  </span>
                )}
              </div>

              {/* Available On */}
              {item.availableOn.length > 0 && (
                <div className="text-center">
                  <p className="text-white/40 text-xs mb-3">
                    {lang === 'ar' ? 'اطلب الآن من:' : 'Order now from:'}
                  </p>
                  <div className="flex justify-center gap-3">
                    {item.availableOn.map(aggId => (
                      <div 
                        key={aggId}
                        className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 p-2"
                      >
                        <img 
                          src={`/images/LINK_${aggId === 'hungerstation' ? 'HungerStation' : aggId.charAt(0).toUpperCase() + aggId.slice(1)}.png`}
                          alt={aggId}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Decorative Ribbon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-6 bg-[#F2BF97] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[#0b253c] text-xs font-bold">🎀 AJDEL</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationModal;

