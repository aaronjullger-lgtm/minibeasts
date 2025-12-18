# Onboarding & Prestige System Integration Guide

This guide explains how to integrate "The Black Box" (onboarding) and "The Ascension" (prestige system) into the Mini Beasts application.

## Overview

The implementation includes three main components:

1. **TheBlackBox.tsx** - Terminal-style onboarding with personality test
2. **AscensionAltar.tsx** - End-of-season prestige system
3. **IdentityCard.tsx** - Enhanced user display with risk profile and prestige badges

## Components

### 1. The Black Box (`components/onboarding/TheBlackBox.tsx`)

A terminal-style onboarding experience that replaces standard sign-up forms.

**Features:**
- Black screen with blinking cursor
- Terminal typing animation
- 3-question personality test
- Assigns one of 3 risk profiles:
  - 📊 **The Algo** - Analytics-focused (15% bonus to Prophecy Cards)
  - 💀 **The Degenerate** - High-risk (20% bonus to Parlays)
  - 🐺 **The Shark** - PVP-focused (5% discount on Trading fees)
- "ENCRYPT IDENTITY" button appears after test completion

**Usage:**
```tsx
import { TheBlackBox } from './components/onboarding/TheBlackBox';

<TheBlackBox 
  onComplete={(userId, userName, riskProfile) => {
    // Handle successful onboarding
    // Store user profile and navigate to app
  }}
/>
```

### 2. The Ascension Altar (`components/prestige/AscensionAltar.tsx`)

End-of-season mechanic that allows users to "burn" their grit for permanent bonuses.

**Features:**
- Available only when season ends (or manually enabled by Commish)
- Burns all current grit
- Grants permanent prestige badge (e.g., "Season 1 Survivor")
- Adds permanent multiplier (1.1x for first ascension, +0.05x per additional)
- Burning animation with fire particles
- Holographic gold glow effect on completion
- Multiple ascensions stack bonuses

**Usage:**
```tsx
import { AscensionAltar } from './components/prestige/AscensionAltar';

<AscensionAltar
  userProfile={currentUserProfile}
  currentGrit={playerGrit}
  currentSeason={1}
  onAscend={(newGrit, prestigeMultiplier) => {
    // Update player grit to 0 and apply multiplier
  }}
  onClose={() => setShowAscension(false)}
/>
```

**Manual Activation (for testing):**
```javascript
localStorage.setItem('ascension_available', 'true');
```

### 3. Identity Card (`components/IdentityCard.tsx`)

Refactored user avatar display that shows risk profile and prestige status.

**Features:**
- Three sizes: small, medium, large
- Shows risk profile icon (📊/💀/🐺)
- Shows prestige badge (season number)
- Holographic rainbow gradient for ascended users
- Responsive and reusable across the app

**Usage:**
```tsx
import { IdentityCard, RiskProfileBadge, PrestigeBadge } from './components/IdentityCard';

// Full identity card
<IdentityCard
  userName="Player Name"
  userProfile={userProfile}
  size="medium"
  showBadge={true}
  onClick={() => viewProfile()}
/>

// Just the risk profile badge
<RiskProfileBadge riskProfile={userProfile.riskProfile} size="medium" />

// Just the prestige badge
<PrestigeBadge season={1} multiplier={1.1} />
```

## Service Layer

### Profile Service (`services/profileService.ts`)

Manages user profiles, risk profiles, and prestige levels.

**Key Functions:**

```typescript
// Calculate risk profile from test answers
const profile = calculateRiskProfile(answers);

// Create new user profile
const userProfile = createUserProfile(userId, userName, riskProfile);

// Save/load profile from localStorage
saveUserProfile(profile);
const profile = getUserProfile(userId);

// Check if ascension is available
const isAvailable = isAscensionAvailable(season);

// Perform ascension
const updatedProfile = performAscension(profile, currentGrit, season);

// Get total multiplier from prestige levels
const multiplier = getTotalPrestigeMultiplier(profile);

// Apply multiplier to grit earnings
const boostedGrit = applyPrestigeMultiplier(baseGrit, profile);
```

## Type Definitions

New types added to `types.ts`:

```typescript
// Risk Profile Types
export type RiskProfileType = 'THE_ALGO' | 'THE_DEGENERATE' | 'THE_SHARK';

export interface RiskProfile {
  type: RiskProfileType;
  name: string;
  description: string;
  icon: string;
  bonuses: {
    prophecyCardBonus?: number;
    parlayBonus?: number;
    tradingBonus?: number;
  };
}

// Prestige Types
export interface PrestigeLevel {
  season: number;
  badge: string;
  multiplier: number;
  ascendedAt: number;
}

// User Profile
export interface UserProfile {
  userId: string;
  userName: string;
  riskProfile?: RiskProfile;
  prestigeLevels: PrestigeLevel[];
  hasAscended: boolean;
  totalGritBurned: number;
}
```

## Integration Points

### Updated Components

The following components have been updated to use IdentityCard:

1. **PlayerCard.tsx** - Shows user profile in the player card modal
2. **LiveWire.tsx** - Displays usernames with risk profile icons in chat
3. **TheBoard.tsx** - Shows current user identity in the header

### Adding to Other Components

To add identity display to other components:

```tsx
import { IdentityCard } from './components/IdentityCard';

// In your component
<IdentityCard
  userName={player.name}
  userProfile={player.userProfile}
  size="small"
  showBadge={true}
/>
```

## Data Flow

1. **Onboarding:**
   - User opens app → TheBlackBox loads
   - User completes personality test
   - Risk profile calculated and assigned
   - UserProfile created and stored in localStorage
   - User redirected to main app

2. **During Gameplay:**
   - User earns grit through bets
   - Prestige multiplier automatically applied to earnings
   - IdentityCard shows risk profile in all user displays

3. **End of Season:**
   - Commish activates ascension (or manual override)
   - User opens AscensionAltar
   - User chooses to burn grit
   - Prestige level added, multiplier increased
   - Holographic effect applied to nameplate

## Demo Component

Run the demo to see all features:

```tsx
import { OnboardingPrestigeDemo } from './examples/OnboardingPrestigeDemo';

// In your app
<OnboardingPrestigeDemo />
```

The demo includes:
- Controls to launch each component
- Current user profile display
- Component size examples
- Feature descriptions

## Testing Checklist

- [ ] Complete personality test and verify risk profile assignment
- [ ] Check that correct icon appears for each profile type
- [ ] Verify localStorage saves user profile
- [ ] Test ascension with manual override
- [ ] Confirm grit resets to 0 after ascension
- [ ] Verify prestige badge appears after ascension
- [ ] Check holographic effect on ascended users
- [ ] Test multiplier application to grit earnings
- [ ] Verify multiple ascensions stack multipliers
- [ ] Check IdentityCard displays correctly at all sizes
- [ ] Test in LiveWire, TheBoard, and PlayerCard

## Styling Notes

### Holographic Effect

Ascended users get a rainbow gradient that shifts over time:

```css
bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500
animation: backgroundPosition 3s infinite
```

### Terminal Theme

The Black Box uses green-on-black terminal aesthetics:

```css
bg-black text-green-500 font-mono
border-2 border-green-500
```

### Fire Effect

The Ascension Altar uses orange/red gradients with particles:

```css
bg-gradient-to-t from-orange-600 via-red-600
animate-pulse
```

## Browser Compatibility

All components use:
- Framer Motion for animations
- Tailwind CSS for styling
- localStorage for persistence
- React 19.2.0

Tested on:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

## Future Enhancements

Potential improvements:

1. Add more personality test questions
2. Create additional risk profiles
3. Add seasonal themes to ascension
4. Implement OAuth for real authentication
5. Add profile customization options
6. Create leaderboard for ascended users
7. Add achievements for prestige levels
8. Implement profile sharing/export

## Troubleshooting

**Issue: Ascension not available**
- Check if season has ended
- Use manual override: `localStorage.setItem('ascension_available', 'true')`

**Issue: Profile not loading**
- Check localStorage for `user_profile_${userId}`
- Verify JSON structure is correct
- Clear and recreate profile if corrupted

**Issue: Holographic effect not animating**
- Check Framer Motion is installed
- Verify Tailwind config includes animations
- Check browser console for errors

**Issue: IdentityCard not displaying**
- Verify userProfile prop is passed correctly
- Check that UserProfile interface matches
- Ensure IdentityCard is imported from correct path

## Support

For questions or issues, please refer to:
- Main README.md
- Type definitions in types.ts
- Service documentation in services/profileService.ts
- Demo component in examples/OnboardingPrestigeDemo.tsx
