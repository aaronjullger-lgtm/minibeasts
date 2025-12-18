import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, AscensionOffer } from '../../types';
import { createAscensionOffer, performAscension, saveUserProfile } from '../../services/profileService';

interface AscensionAltarProps {
  userProfile: UserProfile;
  currentGrit: number;
  currentSeason: number;
  onAscend: (newGrit: number, prestigeMultiplier: number) => void;
  onClose: () => void;
}

export const AscensionAltar: React.FC<AscensionAltarProps> = ({
  userProfile,
  currentGrit,
  currentSeason,
  onAscend,
  onClose
}) => {
  const [offer, setOffer] = useState<AscensionOffer | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [burnProgress, setBurnProgress] = useState(0);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    const ascensionOffer = createAscensionOffer(currentGrit, currentSeason);
    setOffer(ascensionOffer);
  }, [currentGrit, currentSeason]);

  const handleAcceptOffer = () => {
    setShowConfirmation(true);
  };

  const handleConfirmAscension = () => {
    setShowConfirmation(false);
    setIsBurning(true);
    
    // Animate burning process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setBurnProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Complete ascension
        setTimeout(() => {
          const updatedProfile = performAscension(userProfile, currentGrit, currentSeason);
          saveUserProfile(updatedProfile);
          
          setIsBurning(false);
          setShowGlow(true);
          
          // Show glow effect, then complete
          setTimeout(() => {
            const newGrit = 0; // Grit is burned
            const multiplier = updatedProfile.prestigeLevels[updatedProfile.prestigeLevels.length - 1].multiplier;
            onAscend(newGrit, multiplier);
          }, 3000);
        }, 500);
      }
    }, 50);
  };

  if (!offer) {
    return null;
  }

  // Particle effect for burning animation
  const particles = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <AnimatePresence>
        {!isBurning && !showGlow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl w-full"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-white/60 hover:text-white text-4xl font-bold transition-colors"
            >
              ✕
            </button>

            {/* Altar */}
            <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-yellow-600 rounded-lg p-8 relative overflow-hidden">
              {/* Flame effect background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-t from-orange-600 via-red-600 to-transparent animate-pulse"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Title */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
                    THE ASCENSION
                  </h1>
                  <p className="text-white/60 text-lg">
                    The Commish offers you a deal...
                  </p>
                </motion.div>

                {/* The Offer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/60 border-2 border-yellow-600/50 rounded-lg p-6 mb-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <span className="text-white/60 uppercase text-sm tracking-wider">Season {currentSeason} Ends</span>
                      <span className="text-red-400 font-bold">YOUR GRIT WILL BURN</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/60 uppercase text-sm tracking-wider">Current Balance</span>
                      <span className="text-4xl font-bold text-white font-mono">{currentGrit.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-center py-4">
                      <motion.div
                        animate={{ rotate: 180, scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl"
                      >
                        🔥
                      </motion.div>
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 uppercase text-sm tracking-wider">You Receive</span>
                        <span className="text-yellow-400 font-bold text-xl">✨ PRESTIGE ✨</span>
                      </div>
                      
                      <div className="bg-yellow-600/20 border border-yellow-600/50 rounded p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">Badge:</span>
                          <span className="text-yellow-400 font-bold">{offer.badge}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">Multiplier:</span>
                          <span className="text-green-400 font-bold">{offer.multiplier}x Grit Gain</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">Visual:</span>
                          <span className="text-purple-400 font-bold">Holographic Nameplate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Warning */}
                {!offer.isAvailable && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-900/30 border border-red-500/50 rounded p-4 mb-6 text-center"
                  >
                    <p className="text-red-400 text-sm">
                      ⚠️ Ascension is only available at the end of the season. The Commish has not yet activated this portal.
                    </p>
                  </motion.div>
                )}

                {/* Previous ascensions */}
                {userProfile.prestigeLevels.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                  >
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-3">Previous Ascensions</h3>
                    <div className="space-y-2">
                      {userProfile.prestigeLevels.map((level, index) => (
                        <div key={index} className="bg-black/40 border border-white/10 rounded p-3 flex items-center justify-between">
                          <span className="text-white text-sm">{level.badge}</span>
                          <span className="text-yellow-400 font-bold text-sm">{level.multiplier}x</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: offer.isAvailable ? 1.05 : 1 }}
                    whileTap={{ scale: offer.isAvailable ? 0.95 : 1 }}
                    onClick={handleAcceptOffer}
                    disabled={!offer.isAvailable}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                      offer.isAvailable
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {offer.isAvailable ? '🔥 ACCEPT THE DEAL 🔥' : '🔒 LOCKED'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-6 py-4 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-all"
                  >
                    DECLINE
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Confirmation modal */}
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border-2 border-red-600 rounded-lg p-8 max-w-md"
          >
            <h2 className="text-3xl font-bold text-red-500 mb-4 text-center">
              ⚠️ FINAL WARNING ⚠️
            </h2>
            <p className="text-white text-center mb-6">
              You are about to burn <span className="text-red-400 font-bold">{currentGrit.toLocaleString()} GRIT</span>.
              <br /><br />
              This action is <span className="text-red-400 font-bold">PERMANENT</span>.
              <br /><br />
              Do you accept?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirmAscension}
                className="flex-1 py-3 bg-red-600 text-white rounded font-bold hover:bg-red-500 transition-all"
              >
                YES, BURN IT ALL
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 bg-gray-700 text-white rounded font-bold hover:bg-gray-600 transition-all"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        )}

        {/* Burning animation */}
        {isBurning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-red-500 mb-8">
              BURNING GRIT...
            </h2>
            
            {/* Fire particles */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              {particles.map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-orange-500 rounded-full"
                  initial={{
                    x: 128,
                    y: 128,
                    opacity: 1
                  }}
                  animate={{
                    x: 128 + (Math.random() - 0.5) * 200,
                    y: -50 + Math.random() * -100,
                    opacity: 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.04,
                    ease: "easeOut"
                  }}
                />
              ))}
              
              {/* Center flame */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-9xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🔥
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-4 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-600 to-red-600"
                style={{ width: `${burnProgress}%` }}
              />
            </div>
            <p className="text-white mt-4">{burnProgress}%</p>
          </motion.div>
        )}

        {/* Glow effect (ascension complete) */}
        {showGlow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 3 }}
              className="text-9xl mb-8"
            >
              ✨
            </motion.div>
            
            <motion.h2
              className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent mb-4"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              ASCENSION COMPLETE
            </motion.h2>
            
            <p className="text-2xl text-white font-bold">
              You are now <span className="text-yellow-400">{offer.badge}</span>
            </p>
            <p className="text-xl text-green-400 mt-4">
              {offer.multiplier}x Grit Multiplier Active
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AscensionAltar;
