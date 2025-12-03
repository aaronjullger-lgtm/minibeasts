
import React from 'react';
import { Message } from '../types';
import { characterData } from '../constants';

export const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const MiniBeastIcon: React.FC<{ characterId: string; isTalking: boolean }> = ({ characterId, isTalking }) => {
  const skin = "#F2C6A0";
  let hair = "#6D4C41";
  let glasses, headband, cap, facialHair;
  let showEyes = true;

  const charInfo = characterData[characterId] || { nflTeamColor: '#808080' };
  let shirt = charInfo.nflTeamColor;

  switch (characterId) {
    case 'aaron': hair = "#4E342E"; shirt = "#5D4037"; break;
    case 'alex': hair = "#3E2723"; break;
    case 'andrew': hair = "#A1887F"; facialHair = (<><rect x="16" y="26" width="8" height="4" fill="#A1887F" /><rect x="14" y="24" width="2" height="4" fill="#A1887F" /><rect x="24" y="24" width="2" height="4" fill="#A1887F" /></>); break;
    case 'colin': hair = "#6D4C41"; facialHair = <rect x="12" y="24" width="16" height="8" fill="#6D4C41" />; break;
    case 'craif': hair = "#212121"; glasses = (<><rect x="13" y="16" width="14" height="6" fill="#FFFFFF" fillOpacity="0.3" stroke="#000000" strokeWidth="1" /><rect x="11" y="18" width="2" height="2" fill="#000000" /><rect x="27" y="18" width="2" height="2" fill="#000000" /></>); break;
    case 'elie': hair = "#3E2723"; shirt = "url(#rainbow)"; break;
    case 'eric': hair = "#795548"; headband = <rect x="10" y="10" width="20" height="6" fill="#F472B6" />; break;
    case 'justin': hair = "#795548"; cap = <rect x="10" y="8" width="20" height="6" fill="#212121" />; break;
    case 'luke': hair = "#5D4037"; facialHair = <rect x="14" y="24" width="12" height="6" fill="#5D4037" />; break;
    case 'max': hair = "#3E2723"; break;
    case 'nick': hair = "#FBC02D"; break;
    case 'pace': hair = "#FFF176"; break;
    case 'seth': hair = "#D2B48C"; facialHair = (<><rect x="14" y="24" width="12" height="8" fill="#D2B48C" /><rect x="12" y="26" width="16" height="6" fill="#D2B48C" /></>); break;
    case 'spencer': hair = "#5D4037"; break;
    case 'wyatt': hair = "#3E2723"; glasses = (<><rect x="8" y="14" width="4" height="8" fill="#374151" /><rect x="28" y="14" width="4" height="8" fill="#374151" /><rect x="8" y="10" width="24" height="4" fill="#374151" /></>); break;
    case 'dj': hair = "#A0522D"; cap = <rect x="8" y="8" width="24" height="6" fill="#333333" transform="rotate(-15 20 11)" />; break; // Backwards cap
    case 'ty': hair = "#BDB76B"; facialHair = <rect x="15" y="25" width="10" height="2" fill="#BDB76B" />; break; // Soul patch
    case 'tj': hair = "#808080"; break; // Generic grey hair
    default: shirt = "#808080"; break;
  }

  return (
    <div className={`w-full h-full relative ${isTalking ? 'animate-jiggle' : ''} rounded-full overflow-hidden`}>
      <svg viewBox="0 0 40 40" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: '#FF0000'}} /><stop offset="20%" style={{stopColor: '#FF7F00'}} /><stop offset="40%" style={{stopColor: '#FFFF00'}} /><stop offset="60%" style={{stopColor: '#00FF00'}} /><stop offset="80%" style={{stopColor: '#0000FF'}} /><stop offset="100%" style={{stopColor: '#8B00FF'}} />
          </linearGradient>
        </defs>
        <rect x="12" y="14" width="16" height="16" fill={characterId === 'craif' ? '#A1887F' : skin} />
        {cap || <rect x="10" y="8" width="20" height="8" fill={hair} />}
        {headband}
        {showEyes && (<><rect x="15" y="17" width="4" height="4" fill="#FFFFFF" /><rect x="21" y="17" width="4" height="4" fill="#FFFFFF" /><rect x="16" y="18" width="2" height="2" fill="#000000" /><rect x="22" y="18" width="2" height="2" fill="#000000" /></>)}
        {facialHair}
        <rect x="10" y="30" width="20" height="6" fill={shirt} /><rect x="14" y="26" width="12" height="4" fill={shirt} />
        {glasses}
      </svg>
    </div>
  );
};

export const MessageBubble: React.FC<{ msg: Message; playerId: string }> = ({ msg, playerId }) => {
  const { speaker, text } = msg;
  const speakerInfo = characterData[speaker] || { name: "System" };
  const { name } = speakerInfo;
  const isYou = speaker === playerId;
  const isSystem = speaker === 'system';

  const nameColors: { [key: string]: string } = {
    elie: 'text-red-400', justin: 'text-green-400', eric: 'text-blue-400', colin: 'text-purple-400', wyatt: 'text-pink-400', seth: 'text-pink-400',
    spencer: 'text-orange-400', craif: 'text-yellow-500', pace: 'text-teal-300', max: 'text-indigo-400', nick: 'text-green-400', andrew: 'text-orange-400',
    alex: 'text-green-400', aaron: 'text-blue-500', luke: 'text-gray-300', dj: 'text-yellow-300', ty: 'text-cyan-400', tj: 'text-gray-500',
  };

  if (isSystem) {
    return (
      <div className="w-full flex flex-col items-center message-bubble">
        <div className="px-5 py-3 rounded-full glass-dark text-cyan-300 text-center self-center text-sm italic w-full max-w-full border border-blue-500/30 shadow-lg font-semibold">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex ${isYou ? 'justify-end' : 'justify-start'} message-bubble`}>
      <div className={`flex max-w-xs md:max-w-md ${isYou ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-12 h-12 rounded-full flex-shrink-0 ${isYou ? 'ml-3' : 'mr-3'} shadow-lg p-0.5 ${isYou ? 'bg-gradient-to-br from-blue-500 to-purple-600 neon-blue' : 'bg-gradient-to-br from-cyan-500 to-purple-500'}`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <MiniBeastIcon characterId={speaker} isTalking={!isYou} />
          </div>
        </div>
        <div className="flex flex-col">
          {!isYou && (<span className={`font-bold text-sm mb-1 ${nameColors[speaker] || 'text-gray-400'} drop-shadow`}>{name}</span>)}
          <div className={`px-5 py-3 rounded-2xl shadow-lg ${isYou ? 'bg-gradient-to-br from-blue-600 to-purple-600 self-end rounded-br-md border border-blue-400/30 neon-blue' : 'glass-dark self-start rounded-bl-md border border-gray-500/30'}`}>
            <p className="text-white font-medium">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
