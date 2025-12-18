import React, { useState } from 'react';
import { TheBlackBox } from './components/onboarding/TheBlackBox';
import { AscensionAltar } from './components/prestige/AscensionAltar';
import { IdentityCard, RiskProfileBadge, PrestigeBadge } from './components/IdentityCard';
import { RiskProfile, UserProfile } from './types';
import { getUserProfile } from './services/profileService';

/**
 * Demo Component for Onboarding & Prestige System
 * 
 * This component demonstrates:
 * 1. The Black Box - Terminal-style onboarding with personality test
 * 2. The Ascension Altar - Prestige system for end-of-season
 * 3. Identity Cards - User display with risk profile and prestige badges
 */

export const OnboardingPrestigeDemo: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAscension, setShowAscension] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentGrit, setCurrentGrit] = useState(1500);
  const [currentSeason] = useState(1);

  // Load existing user profile if it exists
  React.useEffect(() => {
    const storedProfile = getUserProfile('demo_user');
    if (storedProfile) {
      setUserProfile(storedProfile);
    }
  }, []);

  const handleOnboardingComplete = (userId: string, userName: string, riskProfile: RiskProfile) => {
    const newProfile: UserProfile = {
      userId,
      userName,
      riskProfile,
      prestigeLevels: [],
      hasAscended: false,
      totalGritBurned: 0
    };
    setUserProfile(newProfile);
    setShowOnboarding(false);
  };

  const handleAscensionComplete = (newGrit: number, prestigeMultiplier: number) => {
    setCurrentGrit(newGrit);
    setShowAscension(false);
    // Reload user profile to get updated prestige levels
    const storedProfile = getUserProfile(userProfile?.userId || 'demo_user');
    if (storedProfile) {
      setUserProfile(storedProfile);
    }
  };

  const handleEnableAscension = () => {
    localStorage.setItem('ascension_available', 'true');
    alert('Ascension manually enabled for demo purposes!');
  };

  const handleResetDemo = () => {
    if (userProfile) {
      localStorage.removeItem(`user_profile_${userProfile.userId}`);
    }
    localStorage.removeItem('ascension_available');
    setUserProfile(null);
    setCurrentGrit(1500);
  };

  return (
    <div className="min-h-screen bg-board-navy p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-board-off-white mb-4" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
            ONBOARDING & PRESTIGE DEMO
          </h1>
          <p className="text-board-off-white/60 text-lg">
            Experience "The Black Box" and "The Ascension"
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-board-muted-blue border border-board-off-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-board-off-white mb-4">Demo Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowOnboarding(true)}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all"
            >
              🖥️ Launch The Black Box
            </button>

            <button
              onClick={() => setShowAscension(true)}
              disabled={!userProfile}
              className={`px-6 py-4 rounded-lg font-bold text-lg transition-all ${
                userProfile
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-500 hover:to-orange-500'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              🔥 Open Ascension Altar
            </button>

            <button
              onClick={handleEnableAscension}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-4 rounded-lg font-bold transition-all"
            >
              ⚙️ Enable Ascension (Manual)
            </button>

            <button
              onClick={handleResetDemo}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-lg font-bold transition-all"
            >
              🔄 Reset Demo
            </button>
          </div>
        </div>

        {/* Current User Profile */}
        {userProfile ? (
          <div className="bg-board-muted-blue border border-board-off-white/20 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-board-off-white mb-4">Your Profile</h2>
            
            <div className="space-y-4">
              {/* Identity Card Display */}
              <div className="flex items-center gap-4">
                <span className="text-board-off-white/60">Identity Card:</span>
                <IdentityCard
                  userName={userProfile.userName}
                  userProfile={userProfile}
                  size="large"
                  showBadge={true}
                />
              </div>

              {/* Risk Profile */}
              {userProfile.riskProfile && (
                <div className="flex items-center gap-4">
                  <span className="text-board-off-white/60">Risk Profile:</span>
                  <RiskProfileBadge
                    riskProfile={userProfile.riskProfile}
                    size="medium"
                  />
                </div>
              )}

              {/* Prestige Levels */}
              {userProfile.prestigeLevels.length > 0 && (
                <div>
                  <span className="text-board-off-white/60 block mb-2">Prestige Levels:</span>
                  <div className="space-y-2">
                    {userProfile.prestigeLevels.map((level, index) => (
                      <PrestigeBadge
                        key={index}
                        season={level.season}
                        multiplier={level.multiplier}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-board-off-white/10">
                <div>
                  <span className="text-board-off-white/60 text-sm">Current Grit:</span>
                  <p className="text-2xl font-bold text-board-off-white">{currentGrit.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-board-off-white/60 text-sm">Total Grit Burned:</span>
                  <p className="text-2xl font-bold text-red-400">{userProfile.totalGritBurned.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-board-muted-blue border border-board-off-white/20 rounded-lg p-6 mb-8 text-center">
            <p className="text-board-off-white/60 text-lg">
              No user profile found. Complete The Black Box to create your profile.
            </p>
          </div>
        )}

        {/* Component Examples */}
        <div className="bg-board-muted-blue border border-board-off-white/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-board-off-white mb-4">Component Examples</h2>
          
          <div className="space-y-6">
            {/* Identity Card Examples */}
            <div>
              <h3 className="text-lg font-bold text-board-off-white mb-2">Identity Card Sizes</h3>
              <div className="flex flex-wrap items-center gap-4 bg-black/20 p-4 rounded">
                <IdentityCard
                  userName="Demo User"
                  userProfile={userProfile || undefined}
                  size="small"
                  showBadge={true}
                />
                <IdentityCard
                  userName="Demo User"
                  userProfile={userProfile || undefined}
                  size="medium"
                  showBadge={true}
                />
                <IdentityCard
                  userName="Demo User"
                  userProfile={userProfile || undefined}
                  size="large"
                  showBadge={true}
                />
              </div>
            </div>

            {/* Holographic Effect Example */}
            {userProfile?.hasAscended && (
              <div>
                <h3 className="text-lg font-bold text-board-off-white mb-2">Holographic Effect (Ascended User)</h3>
                <div className="bg-black/20 p-4 rounded">
                  <IdentityCard
                    userName={userProfile.userName}
                    userProfile={userProfile}
                    size="large"
                    showBadge={true}
                  />
                  <p className="text-board-off-white/60 text-sm mt-2">
                    Notice the rainbow gradient animation on the nameplate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Descriptions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 border border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-500 mb-2">🖥️ The Black Box</h3>
            <ul className="text-board-off-white/80 space-y-2 text-sm">
              <li>• Terminal-style personality test</li>
              <li>• 3 questions to determine risk profile</li>
              <li>• Typing animation for immersion</li>
              <li>• Assigns one of 3 profiles:
                <ul className="ml-4 mt-1 space-y-1">
                  <li>📊 The Algo (Analytics-focused)</li>
                  <li>💀 The Degenerate (High-risk)</li>
                  <li>🐺 The Shark (PVP-focused)</li>
                </ul>
              </li>
              <li>• Replaces standard sign-up form</li>
            </ul>
          </div>

          <div className="bg-black/40 border border-yellow-600 rounded-lg p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">🔥 The Ascension</h3>
            <ul className="text-board-off-white/80 space-y-2 text-sm">
              <li>• End-of-season prestige system</li>
              <li>• Burns all current grit</li>
              <li>• Grants permanent prestige badge</li>
              <li>• Adds grit multiplier for next season</li>
              <li>• Holographic nameplate effect</li>
              <li>• Burning animation with particles</li>
              <li>• Multiple ascensions stack multipliers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showOnboarding && (
        <TheBlackBox onComplete={handleOnboardingComplete} />
      )}

      {showAscension && userProfile && (
        <AscensionAltar
          userProfile={userProfile}
          currentGrit={currentGrit}
          currentSeason={currentSeason}
          onAscend={handleAscensionComplete}
          onClose={() => setShowAscension(false)}
        />
      )}
    </div>
  );
};

export default OnboardingPrestigeDemo;
