# Core UI Architecture

This directory contains the core layout and UI components for the Mini Beasts application, implementing a strict design system with premium glassmorphism effects.

## Design Tokens

### Colors (Strict Palette)

Defined in `tailwind.config.js`:

- `board-navy`: `#050A14` - Background (deepest navy)
- `board-surface`: `#0F172A` - Card backgrounds
- `board-highlight`: `#1E293B` - Borders and accents
- `board-text`: `#E2E8F0` - Primary text
- `board-red`: `#EF4444` - Critical actions and alerts
- `board-gold`: `#F59E0B` - Value and winning states

### Typography

- `font-sans`: Inter/Roobert - Clean, legible UI text
- `font-mono`: JetBrains Mono/Fira Code - Data, odds, and money

### Effects

Custom CSS utilities defined in `src/index.css`:

- `.glass-panel`: Glassmorphism effect with backdrop blur and subtle border
- `.scanline`: Terminal-style scanline overlay for retro aesthetic

## Components

### Layout Components

#### ScreenShell

The layout engine that provides bug-free mobile scrolling with fixed header/footer.

**Features:**
- Fixed top bar with safe area support
- Scrollable main content area
- Fixed bottom navigation
- Prevents iOS rubber band effect with `overscroll-behavior-y: none`
- Accounts for iPhone notch and home bar

**Usage:**

```tsx
import { ScreenShell } from './components/layout/ScreenShell';

<ScreenShell
  header={<YourHeader />}
  footer={<YourFooter />}
>
  <YourContent />
</ScreenShell>
```

#### BottomNav

A glitch-free navigation component with haptic feedback.

**Features:**
- Floating island style
- Active tab glow effect
- Tactile interactions with `active:scale-95`
- Haptic feedback via `navigator.vibrate(10)` on tab switch
- Accessible with proper ARIA attributes

**Usage:**

```tsx
import { BottomNav } from './components/layout/BottomNav';

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'games', label: 'Games', icon: '🎮' },
];

<BottomNav
  items={navItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### UI Components

#### NoirCard

A reusable card component that ensures consistent visual appearance.

**Props:**
- `variant`: 'default' | 'alert' | 'gold' (default: 'default')
- `interactive`: boolean - Enables hover and active states (default: false)
- `className`: string - Additional Tailwind classes

**Features:**
- Uses `.glass-panel` for glassmorphism effect
- Subtle hover effects when interactive
- `active:scale-[0.98]` for tactile feel
- Variant-specific border colors

**Usage:**

```tsx
import { NoirCard } from './components/ui/NoirCard';

// Default card
<NoirCard>
  <h2>Card Title</h2>
  <p>Card content</p>
</NoirCard>

// Interactive card
<NoirCard interactive>
  <h2>Clickable Card</h2>
</NoirCard>

// Alert variant
<NoirCard variant="alert">
  <h2>Critical Alert</h2>
</NoirCard>

// Gold variant with custom classes
<NoirCard variant="gold" className="p-6">
  <h2>Premium Content</h2>
</NoirCard>
```

## Safe Area Support

All components respect device safe areas (iPhone notch, home bar) using Tailwind utilities:

- `pt-safe`: Padding top for notch
- `pb-safe`: Padding bottom for home bar
- `pl-safe`: Padding left for edge cases
- `pr-safe`: Padding right for edge cases

## Mobile-First Principles

All components are optimized for mobile:

1. **Touch targets**: Minimum 44x44px for buttons
2. **Overscroll prevention**: No rubber band effect on iOS
3. **Haptic feedback**: Uses `navigator.vibrate()` when available
4. **Smooth scrolling**: `-webkit-overflow-scrolling: touch`
5. **Performance**: Hardware-accelerated animations

## Example

See `ExampleUsage.tsx` for a complete working example of all components together.

## Migration Guide

To integrate these components into existing screens:

1. Wrap your app in `<ScreenShell>`:
   ```tsx
   <ScreenShell
     header={<YourExistingHeader />}
     footer={<BottomNav items={...} />}
   >
     <YourExistingContent />
   </ScreenShell>
   ```

2. Replace existing card components with `<NoirCard>`:
   ```tsx
   // Before
   <div className="bg-slate-800 rounded-lg p-4">...</div>
   
   // After
   <NoirCard>...</NoirCard>
   ```

3. Use design tokens from Tailwind config:
   ```tsx
   // Before
   className="bg-[#0F172A] text-[#E2E8F0]"
   
   // After
   className="bg-board-surface text-board-text"
   ```
