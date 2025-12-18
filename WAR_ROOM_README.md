# War Room & Prophecy Cards Implementation

## Overview
This implementation adds a "Second Screen" experience for Mini Beasts that activates during live NFL games. It includes three main components:

1. **The War Room Dashboard** - A live scoreboard and game tracker
2. **Prophecy Cards** - Time-sensitive micro-betting cards
3. **Live Game Service** - Mock live data stream with event triggers

## Components

### 1. WarRoom Component (`components/WarRoom.tsx`)

The War Room is the main live game dashboard that replaces the standard board view on game days (Sundays).

**Features:**
- Live scoreboard display with home vs. away teams
- Real-time status indicator (LIVE, quarter, time remaining)
- Momentum Meter - SVG wave visualization showing game momentum
- Recent events feed showing touchdowns, turnovers, field goals
- Squad Ride integration with animated avatars
- Darkened stadium aesthetic with board-navy color scheme

**Props:**
```typescript
interface WarRoomProps {
  games: LiveGame[];           // Array of live games
  squadPassengers?: SquadRidePassenger[];  // Optional squad ride members
  onClose?: () => void;        // Optional close handler
}
```

**Key Visual Elements:**
- Uses `font-board-grit` for scoreboard numbers
- Pulsing `board-red` indicator for live status
- `board-gold` highlighting for winning team momentum
- Animated SVG wave based on game momentum (-100 to +100)
- Squad avatars "bounce" when team is winning
- "Stress" filter (grain/noise) on avatars when losing

### 2. ProphecyCard Component (`components/ProphecyCard.tsx`)

High-volatility micro-betting cards that appear during live games with time-limited betting windows.

**Features:**
- Countdown timer with visual progress bar
- Multiple betting options with American odds (+/-XXX)
- Automatic locking when timer expires
- Frost/blur visual effect when locked
- "LOCKED" stamp overlay
- Instant settlement display when resolved

**Props:**
```typescript
interface ProphecyCardProps {
  card: ProphecyCard;          // Card data and options
  currentPlayerGrit: number;   // Player's available grit
  onPlaceBet: (cardId: string, optionId: string, wager: number) => void;
  onClose: () => void;
}
```

**Card States:**
- **Active** - Timer running, bets can be placed (2 minutes default)
- **Locked** - Timer expired, no more bets accepted (frost filter applied)
- **Resolved** - Outcome determined, winning option highlighted

### 3. LiveGameService (`services/liveGameService.ts`)

Mock websocket service that simulates live NFL game events and triggers global effects.

**Features:**
- Simulates multiple concurrent games
- Random event generation (touchdowns, turnovers, field goals)
- Momentum tracking (-100 to +100 scale)
- Event subscription system
- Commish commentary generation
- Visual effect triggers (screen shake, glitch, flash)

**Events:**
- `EVENT_TOUCHDOWN` - Screen shake + gold flash
- `EVENT_TURNOVER` - Glitch effect + red flash
- `EVENT_FIELD_GOAL` - Success sound
- `EVENT_INTERCEPTION` - Turnover variant
- `EVENT_FUMBLE` - Turnover variant

**API:**
```typescript
// Initialize with number of games
liveGameService.initialize(3);

// Subscribe to game events
const unsubscribe = liveGameService.onGameEvent(gameId, (event) => {
  console.log('Event:', event);
});

// Subscribe to Commish commentary
const unsubscribeCommish = liveGameService.onCommishCommentary((message) => {
  console.log('Commish:', message.content);
});

// Get all games
const games = liveGameService.getGames();

// Get specific game
const game = liveGameService.getGame(gameId);

// Stop simulation
liveGameService.stop();

// Cleanup
liveGameService.dispose();
```

## Visual Effects

The implementation includes several CSS animations in `src/index.css`:

### Screen Shake
Triggered on touchdowns - shakes the entire viewport
```css
.screen-shake { animation: screen-shake 0.5s; }
```

### Glitch Effect
Triggered on turnovers - applies color distortion
```css
.glitch-effect { animation: glitch-effect 0.3s; }
```

### Flash
Triggered on major events - full screen color flash
```css
@keyframes flash {
  0% { opacity: 0; }
  10% { opacity: 0.3; }
  20% { opacity: 0; }
}
```

### Bounce
Applied to squad ride avatars when winning
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
```

## Type Definitions

New types added to `types.ts`:

```typescript
// Live game events
export type LiveGameEventType = 'TOUCHDOWN' | 'TURNOVER' | 'FIELD_GOAL' | ...;

export interface LiveGameEvent {
  id: string;
  type: LiveGameEventType;
  gameId: string;
  team: string;
  quarter: number;
  timeRemaining: string;
  description: string;
  timestamp: number;
  momentum: number; // -100 (away) to +100 (home)
}

export interface LiveGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string;
  status: 'pre_game' | 'live' | 'halftime' | 'final';
  momentum: number;
  events: LiveGameEvent[];
  lastEventTime: number;
}

// Prophecy Cards
export interface ProphecyCard {
  id: string;
  gameId: string;
  title: string;
  description: string;
  options: ProphecyOption[];
  createdAt: number;
  expiresAt: number;
  isLocked: boolean;
  isResolved: boolean;
  winningOption?: string;
  resolvedAt?: number;
}

export interface ProphecyOption {
  id: string;
  label: string;
  odds: number; // American odds
  bets: ProphecyBet[];
  totalWagered: number;
}

export interface ProphecyBet {
  playerId: string;
  playerName: string;
  wager: number;
  placedAt: number;
  potentialPayout: number;
  won?: boolean;
}
```

## Integration Guide

### Step 1: Activate War Room on Sundays

```typescript
import { WarRoom } from './components/WarRoom';
import { liveGameService } from './services/liveGameService';

// Check if it's Sunday/game day
const isGameDay = new Date().getDay() === 0; // Sunday

if (isGameDay) {
  // Initialize live games
  liveGameService.initialize(3);
  
  // Render War Room instead of regular board
  return <WarRoom games={liveGameService.getGames()} />;
}
```

### Step 2: Display Prophecy Cards

```typescript
const [prophecyCard, setProphecyCard] = useState<ProphecyCard | null>(null);

// Create card when game momentum shifts
useEffect(() => {
  const unsubscribe = liveGameService.onGameEvent(gameId, (event) => {
    if (event.type === 'TOUCHDOWN' && !prophecyCard) {
      // Create new prophecy card
      const card: ProphecyCard = {
        id: `prophecy_${Date.now()}`,
        gameId: event.gameId,
        title: 'Next Drive Outcome',
        description: 'What happens next?',
        options: [...],
        createdAt: Date.now(),
        expiresAt: Date.now() + 120000, // 2 minutes
        isLocked: false,
        isResolved: false
      };
      setProphecyCard(card);
    }
  });
  
  return () => unsubscribe();
}, [gameId, prophecyCard]);

// Render prophecy card
{prophecyCard && (
  <ProphecyCard
    card={prophecyCard}
    currentPlayerGrit={playerGrit}
    onPlaceBet={handlePlaceBet}
    onClose={() => setProphecyCard(null)}
  />
)}
```

### Step 3: Integrate Squad Rides

```typescript
const squadPassengers: SquadRidePassenger[] = [
  {
    playerId: 'player1',
    playerName: 'Aaron',
    stake: 100,
    joinedAt: Date.now(),
    isDriver: true
  },
  // ... more passengers
];

<WarRoom 
  games={games}
  squadPassengers={squadPassengers}
/>
```

### Step 4: Handle Commish Commentary

```typescript
useEffect(() => {
  const unsubscribe = liveGameService.onCommishCommentary((message) => {
    // Add to chat feed
    addChatMessage(message);
    
    // Optionally show notification
    showNotification(message.content);
  });
  
  return () => unsubscribe();
}, []);
```

## Example Usage

See `examples/WarRoomDemo.tsx` for a complete working example that demonstrates:
- Initializing the live game service
- Rendering the War Room with live games
- Creating and displaying Prophecy Cards
- Handling bets and game updates
- Integrating Squad Ride passengers

## Testing

Build the project to verify all types and components compile:

```bash
npm run build
```

Run the dev server to see the components in action:

```bash
npm run dev
```

## Architecture Notes

### Mock vs. Real Data
The current implementation uses **mock data** generated by `liveGameService`. To integrate with real NFL data:

1. Replace `liveGameService` event generation with actual API calls
2. Subscribe to real-time sports data feeds (e.g., ESPN API, SportsRadar)
3. Parse incoming events and convert to `LiveGameEvent` format
4. Keep the same event subscription model

### Performance Considerations
- Events are throttled to realistic intervals (15-45 seconds)
- Momentum decays automatically to prevent stale states
- Component re-renders optimized with React hooks
- CSS animations use GPU acceleration (transform, opacity)

### Scalability
- Service supports multiple concurrent games
- Event listeners use weak references for memory efficiency
- Timers are properly cleaned up on unmount
- State updates are batched where possible

## Future Enhancements

Potential additions to the system:

1. **Real-time Odds Updates** - Adjust prophecy card odds based on bet volume
2. **Multi-game Prophecies** - Cross-game betting scenarios
3. **Replay System** - View past events with DVR-style controls
4. **Social Features** - Share prophecies, challenge friends
5. **Achievement Integration** - Unlock rewards for accurate predictions
6. **Analytics Dashboard** - Track prediction accuracy over time

## Credits

- Design inspired by elite noir aesthetic
- Uses existing Mini Beasts color palette and typography
- Integrates seamlessly with Squad Ride system
- Built with React 19 and TypeScript
