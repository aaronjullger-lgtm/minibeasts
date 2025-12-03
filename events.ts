import { GameEvent } from './types';

export const gameEvents: GameEvent[] = [
    {
        id: 'viral_moment',
        name: 'Viral Moment',
        description: 'Your recent post went viral! The chat is buzzing with excitement.',
        effects: [
            { targetStat: 'fandom', value: 15 },
            { targetStat: 'entertainmentMeter', value: 20 },
            { targetStat: 'grit', value: 25 }
        ]
    },
    {
        id: 'unexpected_collaboration',
        name: 'Unexpected Collaboration',
        description: 'You teamed up with another member for an epic collab. Everyone loved it!',
        effects: [
            { targetStat: 'loveLife', value: 10 },
            { targetStat: 'fandom', value: 20 },
            { targetStat: 'entertainmentMeter', value: 15 }
        ]
    },
    {
        id: 'cringe_alert',
        name: 'Cringe Alert',
        description: 'Someone said something really cringe in the chat. Everyone is secondhand embarrassed.',
        effects: [
            { targetStat: 'cringeMeter', value: 15 },
            { targetStat: 'entertainmentMeter', value: -5 }
        ]
    },
    {
        id: 'wholesome_moment',
        name: 'Wholesome Moment',
        description: 'The chat had a genuinely wholesome moment. Faith in humanity restored!',
        effects: [
            { targetStat: 'cringeMeter', value: -10 },
            { targetStat: 'entertainmentMeter', value: 10 },
            { targetStat: 'loveLife', value: 5 }
        ]
    },
    {
        id: 'drama_unfolds',
        name: 'Drama Unfolds',
        description: 'Some spicy drama erupted in the chat. Everyone is watching closely.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 25 },
            { targetStat: 'cringeMeter', value: 10 }
        ]
    },
    {
        id: 'energy_boost',
        name: 'Power Nap Success',
        description: 'You managed to squeeze in a perfect power nap. You feel refreshed!',
        effects: [
            { targetStat: 'energy', value: 15 },
            { targetStat: 'uniqueStatValue', value: 10 }
        ]
    },
    {
        id: 'bad_take',
        name: 'Bad Take',
        description: 'Someone dropped a terrible hot take. The chat is roasting them mercilessly.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 15 },
            { targetStat: 'cringeMeter', value: 5 }
        ]
    },
    {
        id: 'positive_vibes',
        name: 'Positive Vibes',
        description: 'The chat is filled with positive energy today. Everyone is supporting each other!',
        effects: [
            { targetStat: 'loveLife', value: 10 },
            { targetStat: 'fandom', value: 10 },
            { targetStat: 'cringeMeter', value: -5 }
        ]
    },
    {
        id: 'meme_contest',
        name: 'Meme Contest',
        description: 'An impromptu meme contest broke out. Your submission was fire!',
        effects: [
            { targetStat: 'fandom', value: 15 },
            { targetStat: 'entertainmentMeter', value: 20 },
            { targetStat: 'grit', value: 15 }
        ]
    },
    {
        id: 'tech_difficulties',
        name: 'Technical Difficulties',
        description: 'The stream had some technical issues. Everyone is a bit annoyed.',
        effects: [
            { targetStat: 'entertainmentMeter', value: -10 },
            { targetStat: 'fandom', value: -5 }
        ]
    }
];
