# Commish AI Logic Core - Phase 6 Implementation

## Overview

The Commish AI Logic Core provides the judgment algorithms and visual components for "The Commish" - the antagonist AI that monitors player behavior and enforces rules in Mini Beasts.

## Components

### 1. `services/commishLogic.ts`

The core logic service that analyzes player behavior and generates tags for receipts.

#### Functions

##### `calculateCowardice(bet: { odds: number }): boolean`

Determines if a bet displays cowardice by checking if the user bets on heavy favorites.

- **Returns:** `TRUE` if odds are worse than -200 (e.g., -500 favorites)
- **Usage:** Tag bet slips with "COWARD" stamp

```typescript
const bet = { odds: -500, wager: 100 };
if (calculateCowardice(bet)) {
    console.log('COWARD detected!');
}
```

##### `calculateDelusion(userHistory: OverseerPlayerState): boolean`

Detects if a user shows delusion by losing multiple bets in a row.

- **Returns:** `TRUE` if user has lost 3+ bets consecutively
- **Usage:** Trigger "Fraud Alerts" in the action feed

```typescript
if (calculateDelusion(player)) {
    // Show fraud alert
    triggerFraudAlert(player);
}
```

##### `generateRoast(user: OverseerPlayerState): RoastResult`

Generates a performance-based roast message with severity level.

- **Returns:** Object with `message` (string) and `severity` ('mild' | 'medium' | 'brutal')
- **Examples:**
  - "User is statistically irrelevant."
  - "Fade them immediately. Player is 25% on the season."
  - "Player is cooking at 65%. Respect."

```typescript
const roast = generateRoast(player);
console.log(roast.message); // Display in UI
console.log(roast.severity); // 'brutal', 'medium', or 'mild'
```

##### `tagBetSlip(bet: { odds: number }): string | null`

Tags a bet slip with appropriate stamps.

- **Returns:** 'COWARD' if cowardice detected, `null` otherwise
- **Usage:** Display stamps on bet receipts

```typescript
const tag = tagBetSlip(bet);
if (tag) {
    // Display tag on receipt
    showStamp(tag); // Shows "COWARD"
}
```

##### `generateWeeklyEdict(weekNumber: number, volatility?: number): EdictData`

Generates the weekly protocol/rule based on league state.

- **Parameters:**
  - `weekNumber`: Current week (1-17)
  - `volatility`: League volatility (0-100, default: 50)
- **Returns:** Object with `header`, `rule`, and `description`
- **Usage:** Display in EdictOverlay at start of week

```typescript
const edict = generateWeeklyEdict(12, 75);
console.log(edict.header);      // "WEEK 12 PROTOCOL"
console.log(edict.rule);        // "MANDATORY UNDERDOGS"
console.log(edict.description); // "All bets must be +100 or higher..."
```

---

### 2. `components/commish/EdictOverlay.tsx`

A modal overlay that displays the weekly executive order from The Commish.

#### Props

```typescript
interface EdictOverlayProps {
    isOpen: boolean;           // Show/hide the modal
    onAcknowledge: () => void; // Callback when user acknowledges
    weekNumber: number;        // Current week number
    rule: string;             // The rule title (e.g., "MANDATORY UNDERDOGS")
    description: string;      // Rule description
}
```

#### Usage

```tsx
import { EdictOverlay } from './components/commish/EdictOverlay';
import { generateWeeklyEdict } from './services/commishLogic';

function App() {
    const [showEdict, setShowEdict] = useState(true);
    const edict = generateWeeklyEdict(12, 50);
    
    return (
        <EdictOverlay
            isOpen={showEdict}
            onAcknowledge={() => setShowEdict(false)}
            weekNumber={12}
            rule={edict.rule}
            description={edict.description}
        />
    );
}
```

#### Visual Features

- Backdrop blur effect (`backdrop-blur-xl`)
- Legal summons aesthetic with red borders
- Animated entrance with staggered reveals
- "WEEK X PROTOCOL" header
- Compliance warning box
- "ACKNOWLEDGE" button
- Sleek, authoritative design

---

### 3. `components/commish/SystemTicker.tsx`

A scrolling marquee that displays live AI commentary.

#### Basic Component Props

```typescript
interface SystemTickerProps {
    messages?: string[];              // Custom messages (optional)
    mood?: 'alert' | 'neutral' | 'active'; // Color scheme
    speed?: number;                   // Scroll speed in seconds (default: 30)
}
```

#### Usage

```tsx
import { SystemTicker } from './components/commish/SystemTicker';

// Basic usage with default messages
<SystemTicker />

// Custom messages with alert mood
<SystemTicker 
    messages={[
        'SCANNING FOR FRAUD...',
        'MARKET VOLATILITY: HIGH.'
    ]}
    mood="alert"
    speed={25}
/>
```

#### Enhanced Component with Player Data

```typescript
interface SystemTickerWithPlayerDataProps {
    playerNames?: string[];           // Players to flag
    baseMessages?: string[];          // Base messages
    mood?: 'alert' | 'neutral' | 'active';
    speed?: number;
}
```

```tsx
import { SystemTickerWithPlayerData } from './components/commish/SystemTicker';

<SystemTickerWithPlayerData
    playerNames={['SETH', 'AARON', 'WYATT']}
    mood="alert"
/>
// Generates: "SETH HAS BEEN FLAGGED FOR POOR PERFORMANCE."
```

#### Visual Features

- Smooth infinite scroll animation
- Edge gradient fades for polished look
- Monospace font (`font-board-grit`)
- Dynamic color based on mood:
  - `alert`: board-red (#EF4444)
  - `neutral`: board-text (#E2E8F0)
  - `active`: board-gold (#F59E0B)
- Stock ticker style with bullet separators

---

## Integration Guide

### Dashboard Integration

```tsx
import { SystemTicker } from './components/commish/SystemTicker';

function Dashboard() {
    return (
        <div>
            {/* Top Bar */}
            <TopNavigation />
            
            {/* System Ticker - Place just below top bar */}
            <SystemTicker mood="neutral" />
            
            {/* Main Content */}
            <MainContent />
        </div>
    );
}
```

### Weekly Edict on App Load

```tsx
import { EdictOverlay } from './components/commish/EdictOverlay';
import { generateWeeklyEdict } from './services/commishLogic';

function App() {
    const [showEdict, setShowEdict] = useState(false);
    const weekNumber = 12; // From game state
    const volatility = 50;  // From commishService
    
    useEffect(() => {
        // Check if user has seen this week's edict
        const hasSeenEdict = localStorage.getItem(`edict-week-${weekNumber}`);
        if (!hasSeenEdict) {
            setShowEdict(true);
        }
    }, [weekNumber]);
    
    const handleAcknowledge = () => {
        localStorage.setItem(`edict-week-${weekNumber}`, 'true');
        setShowEdict(false);
    };
    
    const edict = generateWeeklyEdict(weekNumber, volatility);
    
    return (
        <div>
            <Dashboard />
            <EdictOverlay
                isOpen={showEdict}
                onAcknowledge={handleAcknowledge}
                weekNumber={weekNumber}
                rule={edict.rule}
                description={edict.description}
            />
        </div>
    );
}
```

### Bet Receipt Tagging

```tsx
import { tagBetSlip } from './services/commishLogic';

function BetReceipt({ bet }) {
    const tag = tagBetSlip(bet);
    
    return (
        <div className="bet-receipt">
            <div className="bet-details">{bet.description}</div>
            {tag && (
                <span className="coward-stamp">{tag}</span>
            )}
        </div>
    );
}
```

### Fraud Alert in Action Feed

```tsx
import { calculateDelusion, generateRoast } from './services/commishLogic';

function ActionFeedUpdater({ player }) {
    useEffect(() => {
        // Check for delusion after each bet resolution
        if (calculateDelusion(player)) {
            const roast = generateRoast(player);
            addActionFeedMessage({
                message: roast.message,
                type: 'commish',
                severity: roast.severity
            });
        }
    }, [player.tribunalBets, player.sportsbookBets]);
}
```

---

## Design System

All components follow the Elite Noir design palette:

### Colors

- **board-red** (#EF4444): Critical actions, alerts, active states
- **board-navy** (#050A14): Background, the deepest matte navy
- **board-surface** (#0F172A): Card backgrounds
- **board-highlight** (#1E293B): Borders and accents
- **board-text** (#E2E8F0): Primary text
- **board-gold** (#F59E0B): Value, winning states
- **board-off-white** (#E1E7F5): Secondary text

### Typography

- **font-board-header**: Inter, Roboto - Used for titles and headers
- **font-board-grit**: Courier Prime, Fira Code, monospace - Used for system messages

### Aesthetic

- **System Admin / Dark Terminal**: Technical, authoritative
- **Legal Summons**: Official, unavoidable
- **Stock Ticker**: Live, urgent, constantly updating

---

## Examples

See `examples/CommishLogicExamples.tsx` for comprehensive usage examples including:

1. Edict Overlay integration
2. System Ticker variations
3. Cowardice detection and tagging
4. Delusion detection and fraud alerts
5. Roast generation
6. Complete dashboard integration
7. Integration with existing CommishService

---

## Dependencies

- **React** (^19.2.0)
- **framer-motion** (^12.23.26) - For animations
- **TypeScript** - Type safety

---

## File Structure

```
minibeasts/
├── services/
│   ├── commishLogic.ts          # Core judgment algorithms
│   └── commishService.ts        # Existing Commish service
├── components/
│   └── commish/
│       ├── EdictOverlay.tsx     # Weekly protocol modal
│       └── SystemTicker.tsx     # Live commentary ticker
└── examples/
    └── CommishLogicExamples.tsx # Usage examples
```

---

## Testing

The implementation has been:

- ✅ **Type-checked**: Zero TypeScript errors
- ✅ **Built successfully**: Vite build passes
- ✅ **Code reviewed**: All feedback addressed
- ✅ **Security scanned**: Zero vulnerabilities (CodeQL)

---

## Future Enhancements

Potential additions for future phases:

1. **Dynamic Edict Selection**: Base edicts on actual league statistics
2. **Personalized Roasts**: Use AI to generate unique roasts per player
3. **Edict Enforcement**: Automatically block bets that violate edicts
4. **Ticker Events**: Real-time updates when players make bets
5. **Commish Voice**: Text-to-speech for announcements
6. **Historical Edicts**: Archive of past weekly protocols

---

## Support

For questions or issues:
- See `COMMISH_INTEGRATION_GUIDE.md` for existing Commish features
- Check `examples/CommishLogicExamples.tsx` for usage patterns
- Review `services/commishService.ts` for related functionality

---

**"THE COMMISH IS ALWAYS WATCHING"**
