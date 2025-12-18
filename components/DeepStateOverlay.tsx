/**
 * Deep State Overlay Component
 * Visual effects for Syndicate access or when targeted by an attack
 * Features: CRT scanlines, glitch effect, scrolling marquee
 */

import React, { useEffect, useState } from 'react';

interface DeepStateOverlayProps {
  /** When true, shows the overlay */
  isVisible: boolean;
  /** Callback when overlay should close (optional) */
  onClose?: () => void;
  /** Duration in ms before auto-close (0 = manual close only) */
  autoCloseDuration?: number;
}

export const DeepStateOverlay: React.FC<DeepStateOverlayProps> = ({
  isVisible,
  onClose,
  autoCloseDuration = 0,
}) => {
  const [glitchOpacity, setGlitchOpacity] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      const shouldGlitch = Math.random() > 0.7;
      if (shouldGlitch) {
        setGlitchOpacity(0.1);
        setTimeout(() => setGlitchOpacity(0), 100);
      }
    }, 200);

    // Auto-close timer
    let autoCloseTimer: NodeJS.Timeout | null = null;
    if (autoCloseDuration > 0 && onClose) {
      autoCloseTimer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
    }

    return () => {
      clearInterval(glitchInterval);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [isVisible, autoCloseDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Scanlines - CRT effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
          mixBlendMode: 'color-burn',
          opacity: 0.6,
        }}
      />

      {/* Glitch flash */}
      <div
        className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-100"
        style={{
          opacity: glitchOpacity,
        }}
      />

      {/* Top marquee banner */}
      <div className="absolute top-0 left-0 right-0 bg-board-red text-board-navy overflow-hidden h-8 flex items-center">
        <div className="flex whitespace-nowrap animate-marquee-scroll">
          <span className="font-board-grit text-sm font-bold px-4 animate-jitter">
            /// UNAUTHORIZED ACCESS DETECTED /// SURVEILLANCE ACTIVE ///
          </span>
          <span className="font-board-grit text-sm font-bold px-4 animate-jitter">
            /// UNAUTHORIZED ACCESS DETECTED /// SURVEILLANCE ACTIVE ///
          </span>
          <span className="font-board-grit text-sm font-bold px-4 animate-jitter">
            /// UNAUTHORIZED ACCESS DETECTED /// SURVEILLANCE ACTIVE ///
          </span>
          <span className="font-board-grit text-sm font-bold px-4 animate-jitter">
            /// UNAUTHORIZED ACCESS DETECTED /// SURVEILLANCE ACTIVE ///
          </span>
        </div>
      </div>

      {/* Bottom marquee banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-board-red text-board-navy overflow-hidden h-8 flex items-center">
        <div className="flex whitespace-nowrap animate-marquee-scroll-reverse">
          <span className="font-board-grit text-sm font-bold px-4 animate-jitter">
            /// UNAUTHORIZED ACCESS DETECTED /// SURVEILLANCE ACTIVE ///
          </span>
          <span className="font-board-grit text-sm font-bold px-4 animate-jitter">
            /// UNAUTHORIZED ACCESS DETECTED /// SURVEILLANCE ACTIVE ///
          </span>
          <span className="font-board-grit text-sm font-bold px-4 animate-jitter">
            /// UNAUTHORIZED ACCESS DETECTED /// SURVEILLANCE ACTIVE ///
          </span>
          <span className="font-board-grit text-sm font-bold px-4 animate-jitter">
            /// UNAUTHORIZED ACCESS DETECTED /// SURVEILLANCE ACTIVE ///
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marquee-scroll-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes jitter {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          75% {
            transform: translateX(2px);
          }
        }

        .animate-marquee-scroll {
          animation: marquee-scroll 15s linear infinite;
        }

        .animate-marquee-scroll-reverse {
          animation: marquee-scroll-reverse 15s linear infinite;
        }

        .animate-jitter {
          animation: jitter 0.1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
