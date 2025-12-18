# The Commish AI Overlord - Integration Guide

This guide shows how to integrate the new AI Overlord components into your game.

## Components Overview

### 1. CommishCore
The visual representation of The Commish AI. Display this in the Locker Room or Gulag.

```tsx
import { CommishCore } from './components/CommishCore';

// In your component
<CommishCore 
  isActive={true} 
  location="locker_room" 
/>
```

### 2. RedPhone
The AI's direct line to the player. This component self-manages when to appear based on player state.

```tsx
import { RedPhone } from './components/RedPhone';
import { commishService } from './services/commishService';

// In your game component
const handleAcceptLoan = (loan: CommishLoan) => {
  // Add grit to player
  player.grit += loan.principal;
  
  // Save loan to player state
  // You may want to add a `commishLoans` field to OverseerPlayerState
};

const handleDeclineLoan = () => {
  // Log player declined
  console.log('Player declined loan offer');
};

<RedPhone
  player={currentPlayer}
  onAcceptLoan={handleAcceptLoan}
  onDeclineLoan={handleDeclineLoan}
/>
```

### 3. LiveWire
Real-time contextual chat with AI interruptions.

```tsx
import { LiveWire, LiveWireMessage, generateCommishInterruption } from './components/LiveWire';

// State management
const [messages, setMessages] = useState<LiveWireMessage[]>([]);

// Send player message
const handleSendMessage = (text: string) => {
  const newMessage: LiveWireMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderId: currentPlayer.id,
    senderName: currentPlayer.name,
    text,
    timestamp: Date.now(),
    reactions: {}
  };
  
  setMessages(prev => [...prev, newMessage]);
  
  // Occasionally inject AI message (5% chance)
  if (Math.random() < 0.05) {
    setTimeout(() => {
      const aiMessages = generateCommishInterruption();
      const aiMessage: LiveWireMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: 'commish',
        senderName: 'THE COMMISH',
        text: aiMessages[Math.floor(Math.random() * aiMessages.length)],
        timestamp: Date.now(),
        isAI: true,
        reactions: {}
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  }
};

// Handle reactions
const handleReact = (messageId: string, reaction: 'WASHED' | 'COOKED' | 'CAP') => {
  setMessages(prev => prev.map(msg => {
    if (msg.id === messageId) {
      return {
        ...msg,
        reactions: {
          ...msg.reactions,
          [currentPlayer.id]: reaction
        }
      };
    }
    return msg;
  }));
};

<LiveWire
  player={currentPlayer}
  messages={messages}
  onSendMessage={handleSendMessage}
  onReact={handleReact}
  betContext="Tribunal: Most Likely to Hit the Gulag"
/>
```

## CommishService Integration

### Auto-Roast System
Check for 3 consecutive losses and post to Action Feed:

```tsx
import { commishService } from './services/commishService';

// After a bet is resolved
const roastMessage = commishService.checkForAutoRoast(player);
if (roastMessage) {
  // Add to action feed
  setActionFeedMessages(prev => [...prev, roastMessage]);
}
```

### Mercy Rule
Check if player needs a loan offer:

```tsx
// Periodically check player grit
useEffect(() => {
  const interval = setInterval(() => {
    const needsMercy = commishService.checkMercyRule(player);
    if (needsMercy) {
      // RedPhone component will automatically trigger
      console.log('Player qualifies for loan offer');
    }
  }, 30000); // Check every 30 seconds
  
  return () => clearInterval(interval);
}, [player]);
```

### Loan Management
Track and enforce loans:

```tsx
// Check for overdue loans
const overdueLoan = commishService.checkOverdueLoans(player);
if (overdueLoan) {
  // Send player to Gulag
  sendToGulag(player);
}

// Repay loan
const handleRepayLoan = (loanId: string) => {
  const result = commishService.repayLoan(player, loanId);
  if (result.success) {
    player.grit -= result.totalOwed;
    showNotification(result.message);
  } else {
    showError(result.message);
  }
};
```

### The Audit
Random Shadow Lock verification:

```tsx
// Periodically check for audits
useEffect(() => {
  const interval = setInterval(() => {
    if (commishService.shouldTriggerAudit()) {
      const { message } = commishService.auditAmbushBet(player);
      if (message) {
        setActionFeedMessages(prev => [...prev, message]);
      }
    }
  }, 60000); // Check every minute
  
  return () => clearInterval(interval);
}, [player]);
```

## Type Extensions

You may want to extend `OverseerPlayerState` to track Commish-related data:

```typescript
export interface OverseerPlayerState extends PlayerState {
  // ... existing fields
  
  // Add these for Commish integration
  commishLoans?: CommishLoan[];
  consecutiveLosses?: number;
  lastRoastedAt?: number;
}
```

## Styling Notes

All components use the existing Elite Noir color palette:
- `board-red` (#FF3333) - Active/Alert state
- `board-muted-blue` (#1E293B) - Dormant/Inactive state
- `board-navy` (#050A14) - Background
- `board-off-white` (#E1E7F5) - Primary text

The components use `framer-motion` for animations, which has been added as a dependency.

## Example: Full Integration in Game Loop

```tsx
import { CommishCore } from './components/CommishCore';
import { RedPhone } from './components/RedPhone';
import { LiveWire } from './components/LiveWire';
import { commishService } from './services/commishService';

function GameScreen() {
  const [player, setPlayer] = useState<OverseerPlayerState>(...);
  
  // Check for roasts after bet resolution
  const handleBetResolution = (bet: any, won: boolean) => {
    // ... existing bet resolution logic
    
    // Check for auto-roast
    const roastMessage = commishService.checkForAutoRoast(player);
    if (roastMessage) {
      setActionFeedMessages(prev => [...prev, roastMessage]);
    }
  };
  
  return (
    <div className="game-screen">
      {/* Show CommishCore in specific locations */}
      {showLockerRoom && (
        <div className="locker-room">
          <CommishCore isActive={true} location="locker_room" />
        </div>
      )}
      
      {/* RedPhone is always mounted, manages its own visibility */}
      <RedPhone
        player={player}
        onAcceptLoan={(loan) => {
          setPlayer(prev => ({
            ...prev,
            grit: prev.grit + loan.principal
          }));
        }}
        onDeclineLoan={() => console.log('Loan declined')}
      />
      
      {/* Chat for specific betting contexts */}
      {showChat && (
        <LiveWire
          player={player}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onReact={handleReact}
          betContext="Live Betting Discussion"
        />
      )}
    </div>
  );
}
```
