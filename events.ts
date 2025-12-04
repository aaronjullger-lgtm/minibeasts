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
    },
    // Parlay-themed events
    {
        id: 'sketchy_parlay_hits',
        name: 'Sketchy Parlay HITS',
        description: 'That 12-leg parlay you threw together at 2 AM actually hit! The chat can\'t believe it.',
        effects: [
            { targetStat: 'grit', value: 50 },
            { targetStat: 'entertainmentMeter', value: 30 },
            { targetStat: 'fandom', value: 20 }
        ]
    },
    {
        id: 'parlay_heartbreak',
        name: 'Last Leg Heartbreak',
        description: '11 legs hit. The 12th? A random NFL kicker missed by 6 inches. Pain.',
        effects: [
            { targetStat: 'grit', value: -15 },
            { targetStat: 'cringeMeter', value: 20 },
            { targetStat: 'entertainmentMeter', value: 15 }
        ]
    },
    {
        id: 'colin_parlay_intervention',
        name: 'Colin\'s Parlay Intervention',
        description: 'The group tried to stop Colin from placing another 15-leg parlay. He did it anyway.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 25 },
            { targetStat: 'cringeMeter', value: 10 }
        ]
    },
    {
        id: 'haters_parlay_revenge',
        name: 'Hater\'s Parlay Revenge',
        description: 'You bet AGAINST everyone\'s favorite teams. It hit. The chat is heated.',
        effects: [
            { targetStat: 'grit', value: 40 },
            { targetStat: 'cringeMeter', value: 15 },
            { targetStat: 'fandom', value: -20 }
        ]
    },
    // NFL kicker cousin events
    {
        id: 'kicker_cousin_clutch',
        name: 'Kicker Cousin Comes Through',
        description: 'Someone\'s distant NFL kicker cousin nailed a 58-yarder to save your parlay!',
        effects: [
            { targetStat: 'grit', value: 35 },
            { targetStat: 'entertainmentMeter', value: 20 },
            { targetStat: 'fandom', value: 15 }
        ]
    },
    {
        id: 'doink_disaster',
        name: 'The Double Doink Disaster',
        description: 'A kicker double-doinked it and your parlay is toast. The chat is in shambles.',
        effects: [
            { targetStat: 'grit', value: -20 },
            { targetStat: 'cringeMeter', value: 25 },
            { targetStat: 'entertainmentMeter', value: 20 }
        ]
    },
    // "The Bit" themed events
    {
        id: 'aaron_bit_inception',
        name: 'Aaron\'s New Bit',
        description: 'Aaron just dropped a new bit. It\'s either genius or completely unhinged. No in-between.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 30 },
            { targetStat: 'cringeMeter', value: 15 }
        ]
    },
    {
        id: 'bit_goes_too_far',
        name: 'The Bit Goes Too Far',
        description: 'The bit has spiraled out of control. Everyone is committed but nobody knows how to end it.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 35 },
            { targetStat: 'cringeMeter', value: 20 },
            { targetStat: 'grit', value: 10 }
        ]
    },
    {
        id: 'bit_becomes_reality',
        name: 'The Bit Becomes Reality',
        description: 'What started as a joke is now actually happening. The line between bit and reality is gone.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 40 },
            { targetStat: 'grit', value: 25 },
            { targetStat: 'cringeMeter', value: 5 }
        ]
    },
    // Character-specific events
    {
        id: 'elie_main_character',
        name: 'Elie\'s Main Character Moment',
        description: 'Elie is having a main character moment. The chat is 50% impressed, 50% eye-rolling.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 20 },
            { targetStat: 'cringeMeter', value: 15 },
            { targetStat: 'fandom', value: 10 }
        ]
    },
    {
        id: 'spencer_commish_power',
        name: 'Spencer\'s Power Trip',
        description: 'Spencer just made another controversial commissioner decision. The league is in uproar.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 30 },
            { targetStat: 'cringeMeter', value: 10 }
        ]
    },
    {
        id: 'joint_ad_spam',
        name: 'The Joint Chiropractic Ad',
        description: 'Spencer dropped another Joint Chiropractic ad in the chat. Nobody asked for this.',
        effects: [
            { targetStat: 'cringeMeter', value: 20 },
            { targetStat: 'entertainmentMeter', value: 10 }
        ]
    },
    {
        id: 'ty_actually_messages',
        name: 'Ty Window Opens',
        description: 'TY ACTUALLY SENT A MESSAGE! Quick, screenshot it before he ghosts for another month!',
        effects: [
            { targetStat: 'entertainmentMeter', value: 50 },
            { targetStat: 'grit', value: 30 },
            { targetStat: 'fandom', value: 25 }
        ]
    },
    {
        id: 'craif_friendzone',
        name: 'Craif Gets Friend-Zoned',
        description: 'Craif sent the perfect text. Got "you\'re such a good friend!" back. The chat is mourning.',
        effects: [
            { targetStat: 'cringeMeter', value: 25 },
            { targetStat: 'entertainmentMeter', value: 20 }
        ]
    },
    {
        id: 'aaron_skill_issue',
        name: 'aaron: skill issue',
        description: 'Aaron responded to someone\'s problem with just "skill issue". Brief, brutal, perfect.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 25 },
            { targetStat: 'grit', value: 15 }
        ]
    },
    // Fantasy/betting drama
    {
        id: 'waiver_wire_war',
        name: 'Waiver Wire War',
        description: 'Multiple people tried to grab the same player at 3 AM. The drama is INTENSE.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 30 },
            { targetStat: 'cringeMeter', value: 15 }
        ]
    },
    {
        id: 'trade_veto_chaos',
        name: 'Trade Veto Chaos',
        description: 'A "fair" trade got vetoed. Now everyone is accusing everyone else of collusion.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 35 },
            { targetStat: 'cringeMeter', value: 20 }
        ]
    },
    {
        id: 'garbage_time_miracle',
        name: 'Garbage Time Miracle',
        description: 'Down 40 points, your player scored 3 TDs in garbage time. Unbelievable.',
        effects: [
            { targetStat: 'grit', value: 45 },
            { targetStat: 'entertainmentMeter', value: 30 },
            { targetStat: 'fandom', value: 20 }
        ]
    },
    {
        id: 'monday_night_disaster',
        name: 'Monday Night Disaster',
        description: 'You were up 0.3 points. Their kicker got them 0.4. You lost by 0.1. Pain.',
        effects: [
            { targetStat: 'grit', value: -25 },
            { targetStat: 'cringeMeter', value: 30 },
            { targetStat: 'entertainmentMeter', value: 25 }
        ]
    },
    // Group chat chaos
    {
        id: 'group_chat_meltdown',
        name: 'Group Chat Meltdown',
        description: '247 unread messages. Someone said something spicy and it ESCALATED.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 40 },
            { targetStat: 'cringeMeter', value: 15 }
        ]
    },
    {
        id: 'accidental_family_chat',
        name: 'Wrong Chat Panic',
        description: 'Someone almost sent a VERY inappropriate message to the family group chat. Crisis averted.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 35 },
            { targetStat: 'cringeMeter', value: 20 }
        ]
    },
    {
        id: 'screenshot_leak',
        name: 'Screenshot Leak',
        description: 'Someone\'s private chat got screenshot and leaked. The betrayal is real.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 45 },
            { targetStat: 'cringeMeter', value: 25 }
        ]
    },
    {
        id: 'emoji_only_conversation',
        name: 'Emoji Only Conversation',
        description: 'The chat devolved into only emojis. Somehow everyone still understood each other perfectly.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 20 },
            { targetStat: 'grit', value: 10 }
        ]
    },
    {
        id: 'nerd_emoji_spam',
        name: 'Nerd Emoji Spam',
        description: 'Justin deployed 47 consecutive 🤓 emojis. Someone had to be stopped.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 25 },
            { targetStat: 'cringeMeter', value: 20 }
        ]
    },
    // NFL/Sports moments
    {
        id: 'team_blows_lead',
        name: 'Your Team Blew a 28-3 Lead',
        description: 'Your team was up big. They choked. The chat will never let you live this down.',
        effects: [
            { targetStat: 'grit', value: -30 },
            { targetStat: 'fandom', value: -25 },
            { targetStat: 'cringeMeter', value: 30 }
        ]
    },
    {
        id: 'underdog_miracle',
        name: 'Underdog Miracle',
        description: 'Your team was 10-point underdogs. They won by 20. You\'re insufferable now.',
        effects: [
            { targetStat: 'grit', value: 40 },
            { targetStat: 'fandom', value: 30 },
            { targetStat: 'entertainmentMeter', value: 25 }
        ]
    },
    {
        id: 'ref_controversy',
        name: 'Referee Controversy',
        description: 'The refs made the worst call ever. Both teams\' fans are somehow angry about it.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 30 },
            { targetStat: 'cringeMeter', value: 20 }
        ]
    },
    {
        id: 'halftime_hot_takes',
        name: 'Halftime Hot Takes',
        description: 'Someone declared the season over at halftime. The team came back and won. Aged like milk.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 35 },
            { targetStat: 'cringeMeter', value: 15 },
            { targetStat: 'grit', value: 10 }
        ]
    },
    // Random chaos
    {
        id: 'autocorrect_disaster',
        name: 'Autocorrect Disaster',
        description: 'Autocorrect turned your message into something COMPLETELY different. Everyone saw it.',
        effects: [
            { targetStat: 'cringeMeter', value: 30 },
            { targetStat: 'entertainmentMeter', value: 30 }
        ]
    },
    {
        id: 'voice_message_regret',
        name: 'Voice Message Regret',
        description: 'You sent a voice message. Immediately realized it was way too long. No take-backs.',
        effects: [
            { targetStat: 'cringeMeter', value: 20 },
            { targetStat: 'entertainmentMeter', value: 15 }
        ]
    },
    {
        id: 'group_ft_chaos',
        name: 'Group FaceTime Chaos',
        description: 'Someone started a group FaceTime at midnight. 8 people joined. Nobody knows why.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 30 },
            { targetStat: 'grit', value: 15 }
        ]
    },
    {
        id: 'someone_leaves_chat',
        name: 'Someone Left the Chat',
        description: 'Someone dramatically left the group chat. They\'ll be back in 3 hours.',
        effects: [
            { targetStat: 'entertainmentMeter', value: 25 },
            { targetStat: 'cringeMeter', value: 15 }
        ]
    },
    {
        id: 'all_in_mentality',
        name: 'ALL IN Mentality',
        description: 'Eric declared it\'s time to go ALL IN. Everyone is either inspired or terrified.',
        effects: [
            { targetStat: 'grit', value: 30 },
            { targetStat: 'entertainmentMeter', value: 20 }
        ]
    }
];
