import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  lang: 'ar' | 'en';
  onOpenStatusChange?: (isOpen: boolean) => void;
  hasReachedAggregators?: boolean;
}

interface BusinessStatus {
  isOpen: boolean;
  countdown: string;
  message: { ar: string; en: string };
}

// Business Hours Configuration (GMT+3 Saudi Arabia)
const BUSINESS_HOURS = {
  // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  regular: { open: 11, close: 24 }, // 11 AM - 12 AM (midnight)
  friday: { open: 16, close: 24 },  // 4 PM - 12 AM (Friday)
};

// Get current time in Saudi Arabia (GMT+3)
function getSaudiTime(): Date {
  const now = new Date();
  // Convert to UTC, then add 3 hours for GMT+3
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const saudiTime = new Date(utc + (3 * 60 * 60 * 1000));
  return saudiTime;
}

function getBusinessStatus(): BusinessStatus {
  const now = getSaudiTime();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  const currentTimeInSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;

  // Determine today's hours
  const isFriday = dayOfWeek === 5;
  const todayHours = isFriday ? BUSINESS_HOURS.friday : BUSINESS_HOURS.regular;
  
  const openTimeInSeconds = todayHours.open * 3600;
  const closeTimeInSeconds = todayHours.close * 3600; // 24 * 3600 = midnight

  // Check if currently open
  const isOpen = currentTimeInSeconds >= openTimeInSeconds && currentTimeInSeconds < closeTimeInSeconds;

  let secondsRemaining: number;
  let message: { ar: string; en: string };

  if (isOpen) {
    // Store is OPEN - countdown to closing
    secondsRemaining = closeTimeInSeconds - currentTimeInSeconds;
    message = { ar: 'نغلق بعد', en: 'We Close After' };
  } else {
    // Store is CLOSED - countdown to opening
    if (currentTimeInSeconds < openTimeInSeconds) {
      // Before opening today
      secondsRemaining = openTimeInSeconds - currentTimeInSeconds;
    } else {
      // After closing, calculate time until tomorrow's opening
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = tomorrow.getDay();
      const isTomorrowFriday = tomorrowDay === 5;
      const tomorrowHours = isTomorrowFriday ? BUSINESS_HOURS.friday : BUSINESS_HOURS.regular;
      
      // Seconds until midnight + seconds from midnight to opening
      const secondsUntilMidnight = closeTimeInSeconds - currentTimeInSeconds;
      const tomorrowOpenSeconds = tomorrowHours.open * 3600;
      secondsRemaining = secondsUntilMidnight + tomorrowOpenSeconds;
    }
    message = { ar: 'نفتح بعد', en: 'We Open At' };
  }

  // Format countdown as H:MM:SS
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const countdown = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return { isOpen, countdown, message };
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick, 
  lang, 
  onOpenStatusChange,
  hasReachedAggregators = false
}) => {
  const [status, setStatus] = useState<BusinessStatus>(getBusinessStatus);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus = getBusinessStatus();
      setStatus(newStatus);
      onOpenStatusChange?.(newStatus.isOpen);
    }, 1000);

    // Initial callback
    onOpenStatusChange?.(status.isOpen);

    return () => clearInterval(interval);
  }, [onOpenStatusChange]);

  const handleClick = () => {
    if (status.isOpen) {
      onClick();
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
      whileHover={status.isOpen ? { scale: 1.02 } : {}}
      whileTap={status.isOpen ? { scale: 0.98 } : {}}
      onClick={handleClick}
      disabled={!status.isOpen}
      className={`
        fixed bottom-6 left-0 right-0 mx-auto w-fit z-50
        px-4 py-2 rounded-full
        flex items-center gap-2
        shadow-lg
        transition-colors duration-300
        ${status.isOpen 
          ? 'bg-[#F2BF97] shadow-[#F2BF97]/30 cursor-pointer' 
          : 'bg-gray-500/50 cursor-not-allowed'
        }
      `}
      aria-label={lang === 'ar' ? 'اطلب الآن' : 'Order Now'}
    >
      {/* Compact mode when user has reached aggregators - just show status */}
      {hasReachedAggregators ? (
        <div className={`text-sm font-medium flex items-center gap-2 ${status.isOpen ? 'text-[#0b253c]' : 'text-white/70'}`}>
          <span>{lang === 'ar' ? status.message.ar : status.message.en}</span>
          <span className="font-mono font-bold">{status.countdown}</span>
        </div>
      ) : (
        <>
          {/* All in one line: Status/Countdown | Order Now | Arrow */}
          <div className={`flex items-center gap-2 text-sm ${status.isOpen ? 'text-[#0b253c]' : 'text-white/70'}`}>
            {/* Status & Countdown */}
            <span className={`font-medium ${status.isOpen ? 'text-[#0b253c]/70' : 'text-white/50'}`}>
              {lang === 'ar' ? status.message.ar : status.message.en}
            </span>
            <span className={`font-mono font-bold ${status.isOpen ? 'text-[#0b253c]' : 'text-white/60'}`}>
              {status.countdown}
            </span>
            
            {/* Divider */}
            <span className="opacity-30">|</span>
            
            {/* Order Now - Language specific */}
            <span className="font-bold">
              {lang === 'ar' ? 'اطلب الآن' : 'Order Now'}
            </span>
          </div>

          {/* Arrow Icon - Animated bounce */}
          <motion.div
            animate={status.isOpen ? { y: [0, 2, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className={`flex-shrink-0 ${status.isOpen ? 'text-[#0b253c]' : 'text-white/30'}`}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </motion.div>
        </>
      )}
    </motion.button>
  );
};

export default FloatingActionButton;
