# Sharing Components Integration Guide

## Overview
The Shareable Image Generator provides three React components that create sleek, shareable "receipts" for Mini Beasts social features. These components render off-screen, capture as images, and copy to the clipboard for easy sharing in iMessage.

## Installation
The `html-to-image` dependency is already installed. Import components as needed:

```typescript
import { OfficialSlip, FraudAlert, BeefContract } from './components/sharing';
```

## Components

### 1. OfficialSlip - Bet Receipt

**Use Case:** Create proof-of-bet receipts that can be shared when placing bets.

**Props:**
```typescript
interface OfficialSlipProps {
  betId: string;              // Unique bet identifier
  teamLogo?: string;          // Team emoji or initial
  teamName: string;           // Team name
  odds: number;               // American odds (e.g., +150, -110)
  wager: number;              // Grit amount wagered
  potentialPayout: number;    // Total payout including wager
  status: 'pending' | 'won' | 'lost';
  notes?: string;             // Custom comedy/commentary
  playerName: string;         // Who placed the bet
  timestamp?: Date;           // Optional timestamp
  onShare?: () => void;       // Callback after successful share
}
```

**Example:**
```typescript
<OfficialSlip
  betId="bet_abc123"
  teamName="New York Jets"
  teamLogo="✈️"
  odds={150}
  wager={500}
  potentialPayout={1250}
  status="pending"
  notes="Betting against Seth's intuition."
  playerName="Aaron"
  onShare={() => {
    console.log('Receipt shared!');
    trackSocialShare('official_slip');
  }}
/>
```

**Integration with Betting System:**
```typescript
import { receiptService } from './services/receiptService';
import { SportsbookBet } from './types';

// When creating a bet
const bet: SportsbookBet = {
  id: 'bet_123',
  playerId: player.id,
  // ... other bet properties
};

// Calculate payout
const payout = receiptService.calculatePayout(bet.wager, bet.odds);

// Render OfficialSlip component
<OfficialSlip
  betId={bet.id}
  teamName={bet.game}
  odds={bet.odds}
  wager={bet.wager}
  potentialPayout={payout}
  status={bet.isResolved ? (bet.won ? 'won' : 'lost') : 'pending'}
  playerName={player.name}
/>
```

### 2. FraudAlert - Roast Card

**Use Case:** Create humorous "fraud alert" notifications when someone loses a bad bet.

**Props:**
```typescript
interface FraudAlertProps {
  playerName: string;         // Target of the roast
  teamName: string;           // Team they bet on (the "merchant")
  lostAmount: number;         // How much grit they lost
  betDescription?: string;    // Optional bet details
  customReason?: string;      // Custom insult (defaults to random)
  onShare?: () => void;       // Callback after successful share
}
```

**Example:**
```typescript
<FraudAlert
  playerName="Andrew"
  teamName="The New York Jets"
  lostAmount={500}
  betDescription="Jets ML vs Bills (-250)"
  customReason="Terminal Jets Delusion"
  onShare={() => trackSocialRoast('fraud_alert')}
/>
```

**Integration with Bet Resolution:**
```typescript
// When a bet is resolved as a loss
const resolveLostBet = (bet: SportsbookBet, player: OverseerPlayerState) => {
  // Update bet status
  bet.isResolved = true;
  bet.won = false;
  
  // Deduct grit
  player.grit -= bet.wager;
  
  // Generate fraud alert for sharing
  return (
    <FraudAlert
      playerName={player.name}
      teamName={bet.game}
      lostAmount={bet.wager}
      betDescription={`${bet.pick} (${receiptService.formatOdds(bet.odds)})`}
    />
  );
};
```

### 3. BeefContract - 1v1 Challenge

**Use Case:** Issue or accept head-to-head challenges between players.

**Props:**
```typescript
interface BeefContractProps {
  challengerId: string;
  challengerName: string;
  challengerAvatar?: string;    // Emoji or initial
  opponentId?: string;          // Optional if challenge is open
  opponentName?: string;
  opponentAvatar?: string;
  amount: number;               // Grit stakes
  description: string;          // Challenge terms
  status?: 'proposed' | 'accepted' | 'completed';
  winner?: 'challenger' | 'opponent';
  onShare?: () => void;
}
```

**Example:**
```typescript
// Creating a new challenge
<BeefContract
  challengerId={currentPlayer.id}
  challengerName={currentPlayer.name}
  challengerAvatar="🎯"
  amount={1000}
  description="First to correctly predict 5 game winners this week"
  status="proposed"
  onShare={() => notifyGroupChat('New challenge issued!')}
/>

// Accepting a challenge
<BeefContract
  challengerId={challenge.challengerId}
  challengerName={challenge.challengerName}
  challengerAvatar={challenge.avatar}
  opponentId={currentPlayer.id}
  opponentName={currentPlayer.name}
  opponentAvatar={currentPlayer.avatar}
  amount={challenge.amount}
  description={challenge.description}
  status="accepted"
/>

// Completed challenge
<BeefContract
  challengerId={challenge.challengerId}
  challengerName={challenge.challengerName}
  challengerAvatar={challenge.avatar}
  opponentId={challenge.opponentId}
  opponentName={challenge.opponentName}
  opponentAvatar={challenge.opponentAvatar}
  amount={challenge.amount}
  description={challenge.description}
  status="completed"
  winner={challenge.winnerId === challenge.challengerId ? 'challenger' : 'opponent'}
/>
```

## Receipt Service Utilities

The `receiptService` provides helpful utilities:

```typescript
import { receiptService } from './services/receiptService';

// Format odds for display
const formattedOdds = receiptService.formatOdds(-110);  // "-110"
const formattedOdds2 = receiptService.formatOdds(150);   // "+150"

// Calculate payouts
const payout = receiptService.calculatePayout(1000, 150);  // 2500 (1000 wager + 1500 profit)
const payout2 = receiptService.calculatePayout(1000, -110); // 1909 (1000 wager + 909 profit)

// Format grit amounts with commas
const formatted = receiptService.formatGrit(1000000);  // "1,000,000"

// Get random insult for fraud alerts
const insult = receiptService.getRandomInsult();  // "User Delusion" or similar

// Direct image generation (advanced usage)
const imageDataUrl = await receiptService.generateImage(elementRef.current);
await receiptService.copyToClipboard(elementRef.current);
await receiptService.downloadImage(elementRef.current, 'my-receipt.png');
```

## Type Definitions

Add to your bet-related interfaces as needed:

```typescript
// Extend your betting types with shareable receipt support
interface BetWithReceipt extends SportsbookBet {
  sharedAt?: number;          // Timestamp when receipt was shared
  shareCount?: number;        // How many times shared
}

interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerAvatar?: string;
  opponentId?: string;
  opponentName?: string;
  opponentAvatar?: string;
  amount: number;
  description: string;
  status: 'proposed' | 'accepted' | 'completed';
  winnerId?: string;
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
}
```

## Styling Notes

All components use Tailwind classes from the existing design system:
- `board-navy` - Background color (#050A14)
- `board-gold` - Gold accents (#F59E0B)
- `board-red` - Alert/error color (#EF4444)
- `board-text` - Primary text color (#E2E8F0)
- `board-surface` - Card backgrounds (#0F172A)
- `board-highlight` - Borders/accents (#1E293B)

Components are designed to work with the existing "Midnight Apple" aesthetic and require no additional CSS.

## Mobile Optimization

All receipts are optimized for mobile sharing:
- Fixed width of 400-450px for consistent iMessage previews
- 2x pixel ratio for retina displays
- High-quality PNG format
- Efficient file sizes (typically 50-150KB)

## Browser Compatibility

**Clipboard API:** Requires modern browsers with Clipboard API support (Chrome 76+, Firefox 63+, Safari 13.1+)
- Automatically falls back to download if clipboard API not available
- Works on both desktop and mobile browsers

**Image Generation:** Uses `html-to-image` which works in all modern browsers with Canvas support.

## Best Practices

1. **Performance:** Components render off-screen and only generate images when the "Copy to Clipboard" button is clicked
2. **User Feedback:** Always provide visual feedback when copying (button text changes to "Copied!")
3. **Error Handling:** Both components handle clipboard failures gracefully by falling back to download
4. **Accessibility:** Buttons have proper disabled states during image generation
5. **Social Tracking:** Use the `onShare` callback to track social sharing metrics

## Demo

Run the development server and navigate to `/sharing-demo.html` to see all components in action:

```bash
npm run dev
# Navigate to http://localhost:3000/sharing-demo.html
```

## Future Enhancements

Potential additions to the sharing system:
- QR codes for easy mobile sharing
- Animated GIF support for won bets
- Custom watermarks or player signatures
- Social media platform-specific optimizations
- Batch receipt generation for weekly recaps
