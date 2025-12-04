
import React from 'react';
import { Message } from '../types';
import { characterData } from '../constants';

export const Spinner: React.FC = React.memo(() => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
));

export const MiniBeastIcon: React.FC<{ characterId: string; isTalking?: boolean }> = React.memo(({ characterId, isTalking = false }) => {
  // Enhanced color palette with gradients
  const skin = "#FFD5B8";
  const skinShadow = "#E8B896";
  let hair = "#6D4C41";
  let hairHighlight = "#8B6854";
  let glasses, headband, cap, facialHair, accessory;
  let showEyes = true;

  const charInfo = characterData[characterId] || { nflTeamColor: '#808080' };
  let shirt = charInfo.nflTeamColor;
  let shirtShadow = shirt;

  // Enhanced character definitions with more personality
  switch (characterId) {
    case 'aaron': 
      hair = "#4E342E"; hairHighlight = "#6D4C41"; 
      shirt = "#5D4037"; shirtShadow = "#4E342E";
      accessory = <rect x="18" y="12" width="4" height="2" fill="#FFC107" />; // Stress indicator
      break;
    case 'alex': 
      hair = "#2E7D32"; hairHighlight = "#4CAF50"; 
      headband = <rect x="10" y="10" width="20" height="3" fill="#004D40" />;
      break;
    case 'andrew': 
      hair = "#A1887F"; hairHighlight = "#BCAAA4";
      facialHair = (<>
        <rect x="15" y="25" width="10" height="5" fill="#8D6E63" rx="1" />
        <rect x="14" y="26" width="2" height="3" fill="#8D6E63" />
        <rect x="24" y="26" width="2" height="3" fill="#8D6E63" />
      </>);
      break;
    case 'colin': 
      hair = "#795548"; hairHighlight = "#8D6E63";
      facialHair = <rect x="13" y="24" width="14" height="6" fill="#6D4C41" rx="2" />;
      accessory = <circle cx="32" cy="12" r="2" fill="#FFD700" />; // Parlay lucky charm
      break;
    case 'craif': 
      hair = "#212121"; hairHighlight = "#424242";
      glasses = (<>
        <rect x="12" y="16" width="7" height="6" fill="#FFFFFF" fillOpacity="0.4" stroke="#1E88E5" strokeWidth="1" rx="1" />
        <rect x="21" y="16" width="7" height="6" fill="#FFFFFF" fillOpacity="0.4" stroke="#1E88E5" strokeWidth="1" rx="1" />
        <rect x="19" y="18" width="2" height="1" fill="#1E88E5" />
      </>);
      break;
    case 'elie': 
      hair = "#3E2723"; hairHighlight = "#5D4037";
      shirt = "url(#rainbow)";
      accessory = <circle cx="32" cy="32" r="2" fill="#FFD700" />; // Main character badge
      break;
    case 'eric': 
      hair = "#BF360C"; hairHighlight = "#D84315";
      headband = (<>
        <rect x="10" y="10" width="20" height="4" fill="#E91E63" rx="1" />
        <text x="20" y="13" fontSize="3" fill="#FFF" textAnchor="middle" fontWeight="bold">ALL-IN</text>
      </>);
      break;
    case 'justin': 
      hair = "#795548"; hairHighlight = "#8D6E63";
      cap = (<>
        <rect x="10" y="7" width="20" height="7" fill="#212121" rx="1" />
        <ellipse cx="20" cy="7" rx="10" ry="2" fill="#424242" />
      </>);
      accessory = (
        <g>
          <circle cx="20" cy="9" r="2" fill="#FFD700" opacity="0.3" />
          <text x="20" y="9.5" fontSize="2.5" fill="#000" textAnchor="middle" fontWeight="bold">👓</text>
        </g>
      );
      break;
    case 'luke': 
      hair = "#5D4037"; hairHighlight = "#6D4C41";
      facialHair = <rect x="14" y="24" width="12" height="5" fill="#5D4037" rx="2" />;
      break;
    case 'max': 
      hair = "#1A237E"; hairHighlight = "#283593";
      break;
    case 'nick': 
      hair = "#F9A825"; hairHighlight = "#FBC02D";
      accessory = <circle cx="32" cy="32" r="2" fill="#004D40" />; // Eagles green
      break;
    case 'pace': 
      hair = "#FFF176"; hairHighlight = "#FFF59D";
      accessory = (<>
        <circle cx="32" cy="10" r="2.5" fill="#FFD700" opacity="0.8" />
        <circle cx="31.5" cy="9.5" r="0.5" fill="#FFF" />
        <circle cx="32.5" cy="10.5" r="0.5" fill="#FFF" />
        <circle cx="32" cy="11" r="0.3" fill="#FFF" />
      </>); // Pretty boy sparkle
      break;
    case 'seth': 
      hair = "#D2B48C"; hairHighlight = "#DEB887";
      facialHair = (<>
        <rect x="14" y="24" width="12" height="6" fill="#C19A6B" rx="2" />
        <rect x="13" y="26" width="14" height="4" fill="#C19A6B" rx="1" />
      </>);
      break;
    case 'spencer': 
      hair = "#5D4037"; hairHighlight = "#6D4C41";
      accessory = <text x="20" y="36" fontSize="3" fill="#FFA000" textAnchor="middle" fontWeight="bold">C</text>; // Commissioner badge
      break;
    case 'wyatt': 
      hair = "#3E2723"; hairHighlight = "#4E342E";
      glasses = (<>
        <rect x="8" y="14" width="5" height="8" fill="#1A237E" opacity="0.7" rx="1" />
        <rect x="27" y="14" width="5" height="8" fill="#1A237E" opacity="0.7" rx="1" />
        <rect x="8" y="10" width="24" height="3" fill="#1A237E" />
      </>);
      break;
    case 'dj': 
      hair = "#A0522D"; hairHighlight = "#BC6C25";
      cap = <rect x="8" y="8" width="24" height="6" fill="#333333" transform="rotate(-15 20 11)" rx="1" />;
      break;
    case 'ty': 
      hair = "#BDB76B"; hairHighlight = "#D4D496";
      facialHair = <rect x="16" y="25" width="8" height="2" fill="#BDB76B" rx="1" />;
      break;
    case 'tj': 
      hair = "#808080"; hairHighlight = "#9E9E9E";
      break;
    default: 
      shirt = "#808080"; shirtShadow = "#616161";
      break;
  }

  return (
    <div className={`w-full h-full relative ${isTalking ? 'animate-jiggle' : ''} rounded-full overflow-hidden`}>
      <svg viewBox="0 0 40 40" className="w-full h-full" style={{ imageRendering: 'auto' }}>
        <defs>
          {/* Rainbow gradient for Elie */}
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: '#FF0000'}} />
            <stop offset="20%" style={{stopColor: '#FF7F00'}} />
            <stop offset="40%" style={{stopColor: '#FFFF00'}} />
            <stop offset="60%" style={{stopColor: '#00FF00'}} />
            <stop offset="80%" style={{stopColor: '#0000FF'}} />
            <stop offset="100%" style={{stopColor: '#8B00FF'}} />
          </linearGradient>
          
          {/* Skin gradient for depth */}
          <radialGradient id="skinGradient" cx="50%" cy="40%">
            <stop offset="0%" style={{stopColor: skin}} />
            <stop offset="100%" style={{stopColor: skinShadow}} />
          </radialGradient>
          
          {/* Hair gradient */}
          <linearGradient id={`hairGrad-${characterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor: hairHighlight}} />
            <stop offset="70%" style={{stopColor: hair}} />
          </linearGradient>
          
          {/* Shirt gradient */}
          <linearGradient id={`shirtGrad-${characterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor: shirt}} />
            <stop offset="100%" style={{stopColor: shirtShadow, stopOpacity: 0.8}} />
          </linearGradient>
        </defs>
        
        {/* Background circle with subtle gradient */}
        <circle cx="20" cy="20" r="19" fill="url(#skinGradient)" opacity="0.1" />
        
        {/* Head with improved shading */}
        <ellipse cx="20" cy="20" rx="8" ry="9" fill="url(#skinGradient)" />
        <ellipse cx="20" cy="21" rx="7.5" ry="8" fill={characterId === 'craif' ? '#A1887F' : skin} />
        
        {/* Ears */}
        <ellipse cx="12" cy="20" rx="1.5" ry="2" fill={skinShadow} />
        <ellipse cx="28" cy="20" rx="1.5" ry="2" fill={skinShadow} />
        
        {/* Hair/Cap */}
        {cap || (
          <>
            <ellipse cx="20" cy="12" rx="9" ry="6" fill={`url(#hairGrad-${characterId})`} />
            <rect x="11" y="10" width="18" height="5" fill={`url(#hairGrad-${characterId})`} />
          </>
        )}
        {headband}
        
        {/* Enhanced eyes with more expression */}
        {showEyes && (
          <>
            {/* Eye whites with subtle shadow */}
            <ellipse cx="16" cy="19" rx="2.5" ry="2.8" fill="#FFFFFF" />
            <ellipse cx="24" cy="19" rx="2.5" ry="2.8" fill="#FFFFFF" />
            
            {/* Pupils with animation */}
            <ellipse cx={isTalking ? 16.3 : 16} cy={isTalking ? 19.3 : 19} rx="1.3" ry="1.5" fill="#2C3E50" />
            <ellipse cx={isTalking ? 24.3 : 24} cy={isTalking ? 19.3 : 19} rx="1.3" ry="1.5" fill="#2C3E50" />
            
            {/* Eye shine */}
            <ellipse cx="15.5" cy="18.5" rx="0.8" ry="1" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="23.5" cy="18.5" rx="0.8" ry="1" fill="#FFFFFF" opacity="0.9" />
            
            {/* Eyebrows for expression */}
            <rect x="14" y="16" width="4" height="0.8" fill={hair} rx="0.4" />
            <rect x="22" y="16" width="4" height="0.8" fill={hair} rx="0.4" />
          </>
        )}
        
        {/* Nose - subtle */}
        <ellipse cx="20" cy="22" rx="1" ry="1.5" fill={skinShadow} opacity="0.3" />
        
        {/* Mouth - animated when talking */}
        {isTalking ? (
          <ellipse cx="20" cy="26" rx="2.5" ry="2" fill="#E57373" opacity="0.8" />
        ) : (
          <rect x="18" y="25" width="4" height="1.5" fill="#E57373" opacity="0.6" rx="0.8" />
        )}
        
        {/* Facial hair */}
        {facialHair}
        
        {/* Neck */}
        <rect x="17" y="28" width="6" height="3" fill={skinShadow} />
        
        {/* Shirt with gradient and detail */}
        <ellipse cx="20" cy="35" rx="11" ry="5" fill={shirt === "url(#rainbow)" ? shirt : `url(#shirtGrad-${characterId})`} />
        <rect x="13" y="30" width="14" height="7" fill={shirt === "url(#rainbow)" ? shirt : `url(#shirtGrad-${characterId})`} />
        
        {/* Collar detail */}
        <path d="M 17 30 L 20 32 L 23 30" stroke={skinShadow} strokeWidth="0.5" fill="none" />
        
        {/* Glasses over everything */}
        {glasses}
        
        {/* Accessories */}
        {accessory}
      </svg>
    </div>
  );
});

export const MessageBubble: React.FC<{ msg: Message; playerId: string }> = React.memo(({ msg, playerId }) => {
  const { speaker, text } = msg;
  const speakerInfo = characterData[speaker] || { name: "System" };
  const { name } = speakerInfo;
  const isYou = speaker === playerId;
  const isSystem = speaker === 'system';

  // Generate stable timestamp based on message text hash
  const messageTime = React.useMemo(() => {
    // Create a simple hash from the message text to generate consistent time
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    const hour = Math.abs(hash % 12) + 1;
    const minute = Math.abs(hash >> 8) % 60;
    const ampm = (hash & 1) ? 'AM' : 'PM';
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }, [text]);

  if (isSystem) {
    return (
      <div className="w-full flex justify-center my-4 message-bubble">
        <div className="ios-glass rounded-full px-4 py-2 text-sm text-white/70 text-center max-w-[80%]">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex ${isYou ? 'justify-end' : 'justify-start'} mb-4 message-bubble`}>
      <div className={`flex ${isYou ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
        {/* Avatar - only show for others */}
        {!isYou && (
          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-white/10">
            <MiniBeastIcon characterId={speaker} isTalking={false} />
          </div>
        )}
        
        <div className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
          {/* Name label - only for others */}
          {!isYou && (
            <span className="text-white/60 text-xs font-medium px-3 mb-1">{name}</span>
          )}
          
          {/* Message bubble */}
          <div className={`imessage-bubble ${isYou ? 'imessage-blue' : 'imessage-gray'}`}>
            {text}
          </div>
          
          {/* Timestamp and read receipt */}
          <div className={`message-time ${isYou ? 'text-right' : 'text-left'} px-3 flex items-center gap-1`}>
            <span>{messageTime}</span>
            {isYou && <span className="read-receipt">Read</span>}
          </div>
        </div>
      </div>
    </div>
  );
});

// Simple ChatUI wrapper component for the main App
export const ChatUI: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="mb-4 text-6xl">💬</div>
      <h3 className="text-xl font-semibold text-slate-200 mb-2">
        Group Chat
      </h3>
      <p className="text-slate-400 text-sm max-w-md">
        The Mini Beasts group chat will appear here. Jump into Dynasty Mode to start chatting with the crew!
      </p>
    </div>
  );
};
