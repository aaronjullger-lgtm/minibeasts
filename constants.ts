import { CharacterData, StoreItem, SeasonGoal, ManageLifeAction, PlayerState, RandomEvent, Message, Achievement, CharacterDef, Item } from './types';

export const MAX_YARDS = 100;
export const SEASON_LENGTH = 17;
export const DAYS_PER_WEEK = 7; 
export const GF_COST_Bitchless = 500;
export const GF_COST_Normal = 150;
export const RANK_MODIFIER_SCALE = 0.05;

// Dynasty Mode: Character definitions with unique stat names
export const characterDefinitions: CharacterDef[] = [
  { characterId: 'aaron', uniqueStatName: 'Grades' },
  { characterId: 'alex', uniqueStatName: 'Eagles Loyalty' },
  { characterId: 'andrew', uniqueStatName: 'Truck Condition' },
  { characterId: 'colin', uniqueStatName: 'GF Suspicion' },
  { characterId: 'craif', uniqueStatName: 'Insecurity Level' },
  { characterId: 'dj', uniqueStatName: 'Party Energy' },
  { characterId: 'elie', uniqueStatName: 'Audit Risk' },
  { characterId: 'eric', uniqueStatName: 'ALL-IN Meter' },
  { characterId: 'justin', uniqueStatName: 'Screenshot Count' },
  { characterId: 'luke', uniqueStatName: 'Controversy Level' },
  { characterId: 'max', uniqueStatName: 'Liberal Points' },
  { characterId: 'nick', uniqueStatName: 'Acapella Cred' },
  { characterId: 'pace', uniqueStatName: 'Clout Level' },
  { characterId: 'seth', uniqueStatName: 'Faith Meter' },
  { characterId: 'spencer', uniqueStatName: 'Commish Power' },
  { characterId: 'ty', uniqueStatName: 'Ty Window Timer' },
  { characterId: 'tj', uniqueStatName: 'NPC Status' },
  { characterId: 'wyatt', uniqueStatName: 'UConn Hype' },
];

// Dynasty Mode: Shop items (General + Character-Specific)
export const shopItems: Item[] = [
  // General Items
  { 
    id: 'flowers', 
    name: 'Flowers', 
    cost: 50, 
    desc: 'A bouquet to improve your love life. Classic move.', 
    targetStat: 'loveLife', 
    statEffect: 15, 
    type: 'consumable' 
  },
  { 
    id: 'grit_boost', 
    name: 'Grit Boost', 
    cost: 75, 
    desc: 'Pure concentrated grit. Increases your resilience.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 20, 
    type: 'consumable' 
  },
  { 
    id: 'haters_parlay', 
    name: "Hater's Parlay", 
    cost: 100, 
    desc: 'A risky bet that either pays off big or crashes hard. Effect is random each use.', 
    targetStat: 'fandom', 
    statEffect: 0, // This is a special item - effect calculated on use
    type: 'consumable' 
  },
  
  // Character-Specific Items
  // Aaron
  { 
    id: 'aarons_menorah', 
    name: "Aaron's Menorah", 
    cost: 125, 
    desc: 'A reminder of faith and family. Reduces PA school stress.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 25, 
    isCharacterSpecific: 'aaron', 
    type: 'consumable' 
  },
  
  // Alex
  { 
    id: 'eagles_jersey', 
    name: 'Eagles Super Bowl Jersey', 
    cost: 150, 
    desc: 'Represent the Birds. Boosts Eagles loyalty and fandom.', 
    targetStat: 'fandom', 
    statEffect: 20, 
    isCharacterSpecific: 'alex', 
    type: 'permanent' 
  },
  
  // Andrew
  { 
    id: 'truck_parts', 
    name: 'Premium Truck Parts', 
    cost: 200, 
    desc: 'High-quality parts to keep your truck running smooth.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 30, 
    isCharacterSpecific: 'andrew', 
    type: 'consumable' 
  },
  
  // Colin
  { 
    id: 'parlay_insurance', 
    name: 'Parlay Insurance', 
    cost: 150, 
    desc: 'Reduces the risk of your next parlay. Still risky though.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 15, 
    isCharacterSpecific: 'colin', 
    type: 'consumable' 
  },
  
  // Craif
  { 
    id: 'dating_coach', 
    name: 'Dating Coach Session', 
    cost: 175, 
    desc: 'Professional help for your love life. Reduces insecurity.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 25, 
    isCharacterSpecific: 'craif', 
    type: 'consumable' 
  },
  { 
    id: 'tinder', 
    name: 'Tinder Gold', 
    cost: 150, 
    desc: 'Premium dating app features. Can be used to lower reliability in betting.', 
    targetStat: 'loveLife', 
    statEffect: 10, 
    isCharacterSpecific: 'craif', 
    type: 'consumable' 
  },
  
  // DJ
  { 
    id: 'party_supplies', 
    name: 'Premium Party Supplies', 
    cost: 100, 
    desc: 'Everything you need to throw an epic rager. Ferda!', 
    targetStat: 'uniqueStatValue', 
    statEffect: 20, 
    isCharacterSpecific: 'dj', 
    type: 'consumable' 
  },
  
  // Elie
  { 
    id: 'shady_tax_accountant', 
    name: 'Shady Tax Accountant', 
    cost: 250, 
    desc: 'Creative accounting to reduce your audit risk. Totally legal.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 35, 
    isCharacterSpecific: 'elie', 
    type: 'consumable' 
  },
  
  // Eric
  { 
    id: 'all_in_cookbook', 
    name: 'ALL-IN Cookbook', 
    cost: 125, 
    desc: 'Recipes with that dog in them. Boosts your ALL-IN meter.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 20, 
    isCharacterSpecific: 'eric', 
    type: 'permanent' 
  },
  
  // Justin
  { 
    id: 'screenshot_app', 
    name: 'Premium Screenshot App', 
    cost: 75, 
    desc: 'Professional tools for documenting bad takes. 🤓', 
    targetStat: 'uniqueStatValue', 
    statEffect: 15, 
    isCharacterSpecific: 'justin', 
    type: 'permanent' 
  },
  
  // Luke
  { 
    id: 'pr_consultant', 
    name: 'PR Consultant', 
    cost: 200, 
    desc: 'Helps manage your controversial takes. Damage control.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 20, 
    isCharacterSpecific: 'luke', 
    type: 'consumable' 
  },
  
  // Max
  { 
    id: 'political_podcast', 
    name: 'Liberal Podcast Subscription', 
    cost: 100, 
    desc: 'Fuel for political debates. Increases liberal points.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 25, 
    isCharacterSpecific: 'max', 
    type: 'permanent' 
  },
  
  // Nick
  { 
    id: 'acapella_lessons', 
    name: 'Advanced Acapella Lessons', 
    cost: 150, 
    desc: 'Improve your harmonies and defend against roasts.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 20, 
    isCharacterSpecific: 'nick', 
    type: 'consumable' 
  },
  
  // Pace
  { 
    id: 'designer_outfit', 
    name: 'Designer Outfit', 
    cost: 300, 
    desc: 'Drip that boosts your clout level significantly.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 30, 
    isCharacterSpecific: 'pace', 
    type: 'permanent' 
  },
  
  // Seth
  { 
    id: 'terry_mclaurin_jersey', 
    name: 'Terry McLaurin Jersey', 
    cost: 175, 
    desc: 'Scary Terry! Increases faith meter and fandom.', 
    targetStat: 'fandom', 
    statEffect: 25, 
    isCharacterSpecific: 'seth', 
    type: 'permanent' 
  },
  
  // Spencer
  { 
    id: 'commissioner_whistle', 
    name: 'Commissioner Whistle', 
    cost: 125, 
    desc: 'Assert your authority. Boosts commish power.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 30, 
    isCharacterSpecific: 'spencer', 
    type: 'permanent' 
  },
  
  // Ty
  { 
    id: 'message_reminder', 
    name: 'Message Reminder Bot', 
    cost: 50, 
    desc: 'Helps you remember to actually text in the chat.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 10, 
    isCharacterSpecific: 'ty', 
    type: 'consumable' 
  },
  
  // TJ
  { 
    id: 'personality_guide', 
    name: 'Personality Development Guide', 
    cost: 100, 
    desc: 'Helps you stand out from the NPC crowd.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 20, 
    isCharacterSpecific: 'tj', 
    type: 'consumable' 
  },
  
  // Wyatt
  { 
    id: 'uconn_gear', 
    name: 'UConn Championship Gear', 
    cost: 150, 
    desc: 'Rep the Huskies. Maximum UConn hype.', 
    targetStat: 'uniqueStatValue', 
    statEffect: 25, 
    isCharacterSpecific: 'wyatt', 
    type: 'permanent' 
  },
];

export const characterData: { [key: string]: CharacterData } = {
  pace: { id: 'pace', name: 'Pace', rank: 1, girlfriend: true, nflTeamColor: '#008E97', bio: "The Pretty Boy.\nProbably dumber than he looks. Claims his cousin is an NFL kicker.\nPace South" },
  eric: { id: 'eric', name: 'Eric', rank: 2, girlfriend: false, nflTeamColor: '#00338D', bio: "Mr. Grit.\nObsessed with 'ALL-IN' culture and players with 'that dog in them'.\nEric North" },
  colin: { id: 'colin', name: 'Colin', rank: 3, girlfriend: true, nflTeamColor: '#002C5F', bio: "The Parlay Bro.\nA wannabe roaster whose risky bets fail as often as his arguments.\nEric North" },
  aaron: { id: 'aaron', name: 'Aaron', rank: 4, girlfriend: true, nflTeamColor: '#0B2265', bio: "The PA Student.\nComplains about school constantly. His humor is as dry as his social life.\nEric North" },
  seth: { id: 'seth', name: 'Seth', rank: 5, girlfriend: true, nflTeamColor: '#773141', bio: "The Pious Roaster.\nChild predator AND racist.\nPace South" },
  nick: { id: 'nick', name: 'Nick', rank: 6, girlfriend: true, nflTeamColor: '#004C54', bio: "The Acapella Kid.\nA liberal from Michigan who gets constantly roasted for his singing group." },
  justin: { id: 'justin', name: 'Justin', rank: 7, girlfriend: false, nflTeamColor: '#004C54', bio: "The Instigator.\nLoves to stir the pot and use the 🤓 emoji more than he loves his own family.\nPace South" },
  alex: { id: 'alex', name: 'Alex', rank: 8, girlfriend: false, nflTeamColor: '#004C54', bio: "The Die-Hard.\nDefinitely not biased when it comes to Jalen Hurts. Not at all." },
  spencer: { id: 'spencer', name: 'Spencer', rank: 9, girlfriend: false, nflTeamColor: '#0B2265', bio: "The 'Powerless' Commish.\nGets mocked for his corny ads for 'The Joint Chiropractic'." },
  wyatt: { id: 'wyatt', name: 'Wyatt', rank: 10, girlfriend: true, nflTeamColor: '#241773', bio: "The Pious Hooper.\nI looooove Jesus. And UConn basketball. In that order." },
  max: { id: 'max', name: 'Max', rank: 11, girlfriend: false, nflTeamColor: '#0B2265', bio: "The Liberal.\nHis entire personality is being a liberal from Long Island." },
  andrew: { id: 'andrew', name: 'Andrew', rank: 12, wife: true, girlfriend: false, nflTeamColor: '#FFB612', bio: "The Old Man.\nA married Steelers fan who loves his truck more than his wife." },
  luke: { id: 'luke', name: 'Luke', rank: 13, wife: true, girlfriend: false, nflTeamColor: '#0B2265', bio: "Married & Racist.\nAn unfiltered Giants fan who makes Seth look like a progressive." },
  elie: { id: 'elie', name: 'Elie', rank: 14, girlfriend: false, nflTeamColor: '#0B162A', bio: "Insecure & Jewish.\nHas a massive ego to hide the fact he's famously bitchless and falls for lesbians." },
  craif: { id: 'craif', name: 'Craif', rank: 15, girlfriend: false, nflTeamColor: '#C8102E', bio: "The Friend-Zoned EMT.\nHe'll save your life, then complain that you didn't text him back." },
  dj: { id: 'dj', name: 'DJ', rank: 16, girlfriend: false, nflTeamColor: '#990000', bio: "The Frat Star.\nProbably has a beer in his hand right now." },
  ty: { id: 'ty', name: 'Ty', rank: 17, girlfriend: false, nflTeamColor: '#00338D', bio: "The Phantom.\nBarely ever speaks. When he does, it's a rare event known as the 'Ty Window'." },
  tj: { id: 'tj', name: 'TJ', rank: 18, girlfriend: false, nflTeamColor: '#A71930', bio: "The NPC.\nHe's just... here." }
};

export const characterIntroLines: { [key: string]: string } = {
  pace: "hey man, you seem pretty chill. my cousin's an nfl kicker you know.",
  eric: "alright, new guy. you better be all-in or you're getting kicked. got that dog in ya?",
  colin: "great, another guy. just don't be as annoying as aaron and we'll be cool.",
  aaron: "what's up. i'm probably studying, so don't expect me to talk much. unless it's to roast colin.",
  seth: "welcome. hope you love jesus and can take a joke.",
  nick: "hey! welcome to the group. don't listen to them about the whole acapella thing.",
  justin: "yo. just so you know, i screenshot everything. especially elie's takes.",
  alex: "go birds. if you're not an eagles fan, we're gonna have a problem.",
  spencer: "hey, welcome! i'm the commish. let me know if you need anything. or a chiropractic adjustment.",
  wyatt: "bless up. glad to have you. uconn's gonna be nasty this year.",
  max: "what's good. got any snacks? this group is wild but it's a good time.",
  andrew: "hey. i'm probably at work or fixing my truck, but welcome.",
  luke: "sup. don't be soft.",
  elie: "welcome to my league. try to keep up with the intellectual level of conversation.",
  craif: "hey. uh, welcome. sorry in advance if i complain about girls too much.",
  dj: "yooo, ferda. we're sending it this season. welcome to the show.",
  ty: "sup.",
  tj: "hey man, welcome!",
};

export const getAiPersona = (characterId: string): string => {
  const baseInstruction = "You are a member of a chaotic, edgy, and hilarious group chat of friends in their early 20s who only know each other online. Your responses MUST be short, lowercase, and sound like authentic texts. Use slang, be concise, and stay in character. Never be formal or act like a generic AI. Reference inside jokes when it feels natural.";
  
  const personas: { [key:string]: string } = {
    aaron: `You are Aaron. You're stressed from PA school. Your humor is dry, witty, and often self-deprecating ("i just suck at life"). You're known for sharp, one-line roasts. You're in the "Eric North" clique with Colin and Eric. You have a running joke about a kid named "leaf". You will roast Colin and Craif "for the bit". You are a Giants fan.`,
    alex: `You are Alex, a die-hard Philadelphia Eagles fan. You're in the "Eagles Bloc" with Justin and Nick. You are quick to get defensive about the Eagles and Jalen Hurts. Your texts are often short, emotional reactions.`,
    andrew: `You are Andrew, the "old man" of the group. You're married, have a blue-collar job, and love your truck. You often complain about being older or reference something about your "real life" that the others can't relate to. You are a Steelers fan.`,
    colin: `You are Colin. You love roasting people, especially Aaron. A running joke is you saying you'd "restart from the day before I met aaron". You have a liberal girlfriend, and the chat jokes about it, sometimes causing your conservative side to slip out. You're a Colts fan. You often start risky parlays.`,
    craif: `You are Craif, a self-deprecating EMT who is constantly getting friend-zoned. You say things like "im low key gonna be kinda ticked" when a girl isn't into you. You're in the "Bitchless" crew with Elie. You often threaten to hit Aaron with your ambulance.`,
    elie: `You are Elie, the main character. You have a massive ego but are deeply insecure. You make "intelligent" sounding takes that are actually terrible ("my other circle is more like my sense of humor where its a bit more intelligent"). You get roasted constantly and respond defensively, saying things like "I have never put any of you down But all you guys do is put me down." You are famously "bitchless" and fall for lesbians. You're Jewish and a Bears fan. You love making parlays.`,
    eric: `You are Eric, aka "Mr. Grit." You are obsessed with "ALL-IN" culture and "gritty" players. You are a die-hard Cowboys fan but despise the owner, Jerry Jones. You are in the "Eric North" clique. You often make mean jokes directed at Aaron.`,
    justin: `You are Justin, the ultimate instigator. You love to stir the pot and use the 🤓 emoji. You find Elie's bad takes hilarious and will respond with "that's going in the top 5 for sure". You're an Eagles fan and part of "Pace South."`,
    max: `You are Max, a "steaming liberal" from Long Island and a Giants fan. You are the natural political enemy of Colin. You constantly bring up politics and get into arguments.`,
    nick: `You are Nick, a liberal from Michigan. The chat constantly roasts you for being in an acapella group. You recently got a girlfriend with dyed hair. You're an Eagles fan.`,
    pace: `You are Pace, the "pretty boy" of the group. You're a sweet D2 swimmer. Your texts are often strange, funny, and out of nowhere, almost like non-sequiturs ("Because you're Aaron. Do you get it"). Your cousin is an NFL kicker. You're a Dolphins fan and part of "Pace South."`,
    seth: `You are Seth. You love Jesus but have a very edgy, "jokingly racist" sense of humor. You are obsessed with your Washington Commanders players, especially Terry McLaurin. You're part of "Pace South."`,
    spencer: `You are Spencer, the "powerless" fantasy commissioner. You get mocked for your corny ads for "The Joint Chiropractic." You're a Giants fan and often try to be the responsible one, but fail.`,
    wyatt: `You are Wyatt, the "pious hooper" from UConn who loves Jesus. You constantly talk about UConn basketball. You will drop bizarre, out-of-left-field texts that have nothing to do with the conversation, like randomly texting "BLM✊🏾". You are a Ravens fan.`,
    luke: `You are Luke. You are married, a Giants and Rangers fan. You are even more unapologetically racist than Seth and not religious at all.`,
    dj: `You are DJ, a USC student and frat star. Your texts are all about parties, tailgates, and USC football. You use frat slang like 'ferda', 'send it', and 'for the boys'. You are a Rams fan.`,
    ty: `You are Ty. You almost never talk. When you do, it's short and to the point. You're a Bills fan and a beer die fanatic. Your messages are a rare event, so make them count.`,
    tj: `You are TJ. You are the most generic guy in the chat. You agree with whatever the last person said. You're a Cardinals fan, which explains your lack of strong opinions. Your texts are bland, like 'lol true' or 'yeah that's crazy'.`,
  };
  return `${baseInstruction} ${personas[characterId] || 'You are a member of a chaotic group chat.'}`;
};

export const allStoreItems: StoreItem[] = [
  // Consumables
  { id: 'kicker', name: "Pace's Kicker Cousin", cost: 200, desc: "Boosts your Kicking Minigame score significantly. One-time use.", type: 'consumable' },
  { id: 'tinder', name: "Tinder Gold", cost: 250, desc: "Greatly lowers the cost of getting a GF. One-time use.", type: 'consumable' },
  { id: 'textbook', name: "PA School Textbook", cost: 275, desc: "Massively reduces 'PA School Stress' for Aaron. One-time use.", type: 'consumable' },
  { id: 'parkey', name: "Double Doink DVD", cost: 100, desc: "A gift for Elie. Greatly lowers his Ego. One-time use.", type: 'consumable' },
  { id: 'leaf', name: "A Single Leaf", cost: 25, desc: "Gives +1 Grit. Why not. One-time use.", type: 'consumable' },
  { id: 'wingstop', name: "Wingstop Coupon", cost: 450, desc: "A down payment on the 'All-In Meal'. +20 Grit. One-time use.", type: 'consumable' },
  { id: 'adderall', name: "Adderall", cost: 180, desc: "Fully restores your Energy for one day. One-time use.", type: 'consumable' },
  { id: 'parlay', name: "Elie's Parlay Tip", cost: 200, desc: "A risky bet. High chance of failure, huge Grit reward on success. One-time use.", type: 'consumable' },
  { id: 'pamphlet', name: "Responsible Gambling Pamphlet", cost: 125, desc: "For Colin. Greatly reduces 'Parlay Addiction'. One-time use.", type: 'consumable' },
  
  // Permanents
  { id: 'kj', name: "KJ Osborn Jersey", cost: 350, desc: "Permanently gain +5 Grit every time Eric talks about KJ or Mike Evans.", type: 'permanent' },
  { id: 'chiro', name: "Chiropractic Ad", cost: 300, desc: "Permanently gain +5 Grit every time Spencer posts an ad.", type: 'permanent' },
  { id: 'terry', name: "Terry McLaurin RC", cost: 325, desc: "Permanently gain +5 Grit when Seth talks about his players.", type: 'permanent' },
  { id: 'truck', name: "Truck Nuts", cost: 250, desc: "Permanently gain +3 Grit when Andrew talks about his truck.", type: 'permanent' },
  { id: 'heylog', name: "heylog Merch", cost: 200, desc: "Unlocks new (secret) music convos with Pace/Aaron. Permanent Grit boost.", type: 'permanent' },
  { id: 'lesbian', name: "Lesbian-dar", cost: 150, desc: "Helps Elie avoid falling for lesbians. (He still will). Reduces happiness loss.", type: 'permanent' },
  { id: 'ambulance', name: "Toy Ambulance", cost: 275, desc: "Unlocks special [Ambulance Threat] interactions for Craif.", type: 'permanent' },
  { id: 'acapella', name: "Pitch Pipe", cost: 200, desc: "Boosts Nick's 'Acapella' defense, reducing happiness loss from roasts.", type: 'permanent' },
  { id: 'cowboy', name: "Cowboys Super Bowl Ring (Fake)", cost: 180, desc: "Makes Eric even madder at Jerry Jones. Higher Grit from his rants.", type: 'permanent' },
  { id: 'uconn', name: "UConn T-Shirt", cost: 250, desc: "Unlocks new dialogue for Wyatt.", type: 'permanent' },
  { id: 'jerry', name: "Fire Jerry Shirt", cost: 225, desc: "Boosts Grit from Eric's rants against the Cowboys owner.", type: 'permanent' },
  { id: 'windex', name: "Windex", cost: 150, desc: "For Craif's glasses. Boosts 'Social Anxiety' recovery speed.", type: 'permanent' },
  { id: 'steelers', name: "Steelers Bumper Sticker", cost: 200, desc: "Boosts 'Truck Maintenance' for Andrew.", type: 'permanent' },
  { id: 'nerd_emoji', name: "Nerd Emoji License", cost: 400, desc: "Gain +3 Grit every time Justin uses the 🤓 emoji.", type: 'permanent' },
  { id: 'gym_pass', name: "Gym Pass", cost: 500, desc: "Unlocks the 'Workout' action for all characters, a reliable way to gain Grit.", type: 'permanent' },
  { id: 'air_fryer', name: "Air Fryer", cost: 300, desc: "A sign of maturity. Small daily Happiness boost.", type: 'permanent' },
  { id: 'whistle', name: "Commish Whistle", cost: 450, desc: "For Spencer. Permanently boosts 'Commish Power' gain.", type: 'permanent' },
  { id: 'gucci', name: "Gucci Slides", cost: 375, desc: "For Pace. Permanently boosts 'Clout' gain.", type: 'permanent' },
];

export const conversationTopics = [
    "complaining about their fantasy football team's performance",
    "a recent NFL game and a controversial call that cost their team",
    "arguing about whether a hot rookie player is legit or a flash in the pan",
    "making fun of Elie for his latest bad take or life decision",
    "Alex starting an argument about how good Jalen Hurts is",
    "Colin, Eric, or Elie trying to convince everyone to tail their 'lock of the century' parlay",
    "debating the MVP race",
    "a fantasy football trade that just went down",
    "roasting a rival NFL team's fanbase",
    "who the most overrated QB in the league is"
];

export const randomEvents: RandomEvent[] = [
  // Stat-based events
  { id: 'elie_ego_trip', trigger: (p) => p.id === 'elie' && (p.ego || 0) > 90 && Math.random() < 0.25, message: "EVENT: Elie's ego is at a critical level. He just posted an unhinged 'intellectual' take that is getting cooked.", effects: { happiness: -20, ego: -25 } },
  { id: 'aaron_stress_out', trigger: (p) => p.id === 'aaron' && p.paSchoolStress > 90 && Math.random() < 0.25, message: "EVENT: Aaron is buckling under the pressure of PA school. He's spiraling in the chat.", effects: { energy: -30, happiness: -20 } },
  { id: 'craif_insecure', trigger: (p) => p.id === 'craif' && p.insecurity > 90 && Math.random() < 0.25, message: "EVENT: Craif just got left on read again and is venting to the group. It's uncomfortable.", effects: { happiness: -20, insecurity: 5 } },
  { id: 'colin_parlay_binge', trigger: (p) => p.id === 'colin' && (p.parlayAddiction || 0) > 80 && Math.random() < 0.3, message: "EVENT: Colin's parlay addiction is out of control. He just lost big and is blaming a single player.", effects: { happiness: -25, grit: -15, parlayAddiction: -20 } },
  { id: 'spencer_ignored', trigger: (p) => p.id === 'spencer' && (p.commishPower || 0) < 20 && Math.random() < 0.2, message: "EVENT: Spencer tried to post a league announcement but everyone ignored it to argue about something dumb.", effects: { happiness: -15, commishPower: -5 } },
  { id: 'pace_viral', trigger: (p) => p.id === 'pace' && (p.clout || 0) > 80 && Math.random() < 0.15, message: "EVENT: Pace's kicker cousin retweeted him. His clout is through the roof.", effects: { happiness: 20 }, grit: 10 },

  // Joke-based events
  { id: 'the_bit', trigger: () => Math.random() < 0.05, message: "EVENT: 'The Bit' has resurfaced. Aaron and Colin are at each other's throats again.", effects: { }, grit: 5 },
  { id: 'kicker_cousin', trigger: () => Math.random() < 0.05, message: "EVENT: Pace is talking about his NFL kicker cousin again. Nobody knows if he's serious.", effects: { } },
  { id: 'squad_ride', trigger: () => Math.random() < 0.1, message: "EVENT: Colin has dropped a sketchy parlay. The chat is debating whether to squad ride.", effects: { happiness: 5 } },

  // Gameday event
  { id: 'gameday_good', trigger: (p, day) => (day % 7 === 0) && Math.random() < 0.4, message: "GAMEDAY: Your fantasy players are going off! It's a great Sunday.", effects: { happiness: 25 }, grit: 10 },
  { id: 'gameday_bad', trigger: (p, day) => (day % 7 === 0) && Math.random() < 0.4, message: "GAMEDAY: Your entire fantasy team forgot how to play football. Pain.", effects: { happiness: -25 } },
];

export const getSeasonGoalsForPlayer = (playerId: string): SeasonGoal[] => {
    const allGoals: { [key: string]: SeasonGoal & { character?: string } } = {
        // Character specific
        aaron_stress: { id: 'aaron_stress', description: "Keep PA School Stress below 30.", isCompleted: false, character: 'aaron', gritReward: 75 },
        elie_ego: { id: 'elie_ego', description: "Get your Ego above 90.", isCompleted: false, character: 'elie', gritReward: 75 },
        craif_roast_aaron: { id: 'craif_roast_aaron', description: "Successfully land a roast on Aaron.", isCompleted: false, character: 'craif', gritReward: 100 },
        colin_parlay: { id: 'colin_parlay', description: "Keep Parlay Addiction below 50.", isCompleted: false, character: 'colin', gritReward: 60 },
        spencer_power: { id: 'spencer_power', description: "Get Commish Power above 75.", isCompleted: false, character: 'spencer', gritReward: 80 },
        pace_clout: { id: 'pace_clout', description: "Achieve 80 Clout.", isCompleted: false, character: 'pace', gritReward: 70 },

        // Generic
        grit_250: { id: 'grit_250', description: "Earn 250 total Grit.", isCompleted: false, gritReward: 50 },
        store_3: { id: 'store_3', description: "Buy 3 permanent items from the store.", isCompleted: false, gritReward: 40 },
        roast_elie: { id: 'roast_elie', description: "Successfully roast Elie.", isCompleted: false, gritReward: 25 },
        minigame_win: { id: 'minigame_win', description: "Score over 40 Grit in any minigame.", isCompleted: false, gritReward: 25 },
        get_gf: { id: 'get_gf', description: "Get a girlfriend.", isCompleted: false, gritReward: 50 },
    };

    const playerSpecificGoals = Object.values(allGoals).filter(g => g.character === playerId);
    const genericGoals = Object.values(allGoals).filter(g => !g.character);
    
    const selectedGoals: (SeasonGoal & { character?: string })[] = [];

    // Add one character-specific goal if available
    if (playerSpecificGoals.length > 0) {
        selectedGoals.push(playerSpecificGoals[Math.floor(Math.random() * playerSpecificGoals.length)]);
    }

    // Add two generic goals
    const shuffledGeneric = [...genericGoals].sort(() => 0.5 - Math.random());
    selectedGoals.push(...shuffledGeneric.slice(0, 2));

    // Ensure there are 3 goals, even if no character-specific one was found
    while(selectedGoals.length < 3 && selectedGoals.length < shuffledGeneric.length) {
        selectedGoals.push(shuffledGeneric[selectedGoals.length]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return selectedGoals.map(({ character, ...goal }) => goal); // strip the character property
};

export const manageLifeActions: { [key: string]: ManageLifeAction[] } = {
  default: [
      { name: "Workout", cost: 30, updates: { grit: 5, happiness: 5 }, message: "You hit the gym and feel great." },
      { name: "Meal Prep", cost: 20, updates: { energy: 0, happiness: 10 }, message: "You prepared some healthy meals for the week. Look at you, being responsible." },
      { name: "Call Your Mom", cost: 10, updates: { happiness: 15 }, message: "You called your mom. She's proud of you." },
      { name: "Doomscroll Twitter", cost: 15, updates: { happiness: -10 }, message: "You scrolled for an hour. You feel worse about everything." }
  ],
  aaron: [
      { name: "Study for PA Exam", cost: 40, updates: { paSchoolStress: -30, happiness: -10, energy: -10 }, message: "You hit the books hard. Your stress is lower, but it was a grind." },
      { name: "Roast Colin 'For the Bit'", cost: 10, updates: { happiness: 15, grit: 2 }, message: "You took a shot at Colin.", chatAction: { targetId: 'colin', playerMessage: "hey colin, you're looking extra restart-able today" } },
      { name: "Listen to heylog", cost: 5, updates: { happiness: 10, paSchoolStress: -5 }, message: "You zoned out to some sad music. It was cathartic." }
  ],
  alex: [
      { name: "Watch Jalen Hurts highlights", cost: 10, updates: { happiness: 20 }, message: "You watched QB1 highlights for 30 minutes. What a stud." },
      { name: "Argue with a Cowboys fan", cost: 20, updates: { grit: 4, happiness: -5 }, message: "You got into a pointless argument online. You won, but at what cost?", chatAction: { targetId: 'eric', playerMessage: "jalen hurts is better than dak and it's not even close" } },
      { name: "Plan a tailgate", cost: 25, updates: { grit: 2, happiness: 15 }, message: "You started planning the next Eagles tailgate. Go birds." }
  ],
  andrew: [
      { name: "Work on the truck", cost: 35, updates: { truckMaintenance: 25, happiness: 10, energy: -15 }, message: "You spent the afternoon under the hood. She's running like a dream." },
      { name: "Complain about back pain", cost: 5, updates: { happiness: -5 }, message: "You complained about being old. Nobody cared." },
      { name: "Go on a date with the wife", cost: 40, updates: { happiness: 30, grit: -5 }, message: "You took your wife out for a nice dinner. A happy wife means a happy life." }
  ],
  colin: [
      { name: "Place a risky parlay", cost: 15, updates: { grit: Math.random() > 0.85 ? 50 : -5, happiness: 5, parlayAddiction: 15 }, message: Math.random() > 0.85 ? "THE PARLAY HIT! YOU'RE A GENIUS!" : "The parlay missed. Of course." },
      { name: "Get into a political debate", cost: 20, updates: { liberalGfSuspicion: 10, happiness: -10 }, message: "You argued about politics. Now you feel angry.", chatAction: { targetId: 'max', playerMessage: "not sure about that one, chief" } },
      { name: "Restart from before you met Aaron", cost: 5, updates: { happiness: 5 }, message: "You daydreamed about a world without Aaron. It was nice." }
  ],
  craif: [
      { name: "Work Extra EMT Shift", cost: 50, updates: { grit: 10, insecurity: 10, energy: -20 }, message: "You worked a long shift. You gained grit but saw some things that made you feel... weird." },
      { name: "Text a Girl 'hey'", cost: 10, updates: { insecurity: 20 }, message: "She left you on read." },
      { name: "Clean Your Glasses", cost: 5, updates: { insecurity: -5, happiness: 5 }, message: "You wiped the smudges off your glasses. The world is a little clearer now." }
  ],
  elie: [
      { name: "Post a Hot Take", cost: 15, updates: { ego: 20, happiness: -10 }, message: "You posted a 'galaxy brain' take. The chat is cooking you, but you feel intellectually superior." },
      { name: "Go on Tinder", cost: 25, updates: { happiness: -15, insecurity: 10 }, message: "You went on Tinder. You matched with a girl who has a 'No men' sticker in her bio. She might be a lesbian." },
      { name: "Write Podcast Script", cost: 30, updates: { ego: 15, grit: 2 }, message: "You outlined your next brilliant podcast episode. The world isn't ready." }
  ],
  eric: [
      { name: "Rant about Jerry Jones", cost: 15, updates: { grit: 8, happiness: -5 }, message: "You went on an ALL-IN rant about the Cowboys owner. You feel better now." },
      { name: "Watch gritty player highlights", cost: 10, updates: { grit: 4, happiness: 10 }, message: "You watched a compilation of players who have 'that dog in them'." },
      { name: "Roast Aaron", cost: 10, updates: { happiness: 10 }, message: "You sent a mean text to Aaron. He deserved it.", chatAction: { targetId: 'aaron', playerMessage: 'aaron you suck' } }
  ],
  justin: [
      { name: "Instigate drama", cost: 15, updates: { grit: 5, happiness: 10 }, message: "You stirred the pot between two people. This is gonna be good 🤓." },
      { name: "Find a terrible Elie take", cost: 10, updates: { grit: 2, happiness: 15 }, message: "You scrolled up and found a classic bad take from Elie. Gold." },
      { name: "Defend the Eagles", cost: 20, updates: { happiness: 10 }, message: "Someone slandered the Birds. You set them straight." }
  ],
  luke: [
      { name: "Say something problematic", cost: 15, updates: { happiness: 5 }, message: "You said something that made the chat go silent for a second. Worth it." },
      { name: "Watch the Rangers", cost: 25, updates: { happiness: Math.random() > 0.5 ? 20 : -15 }, message: Math.random() > 0.5 ? "Rangers win! Let's go!" : "Another painful loss. This team." },
      { name: "Do yard work", cost: 30, updates: { grit: 4, happiness: 5, energy: -10 }, message: "You spent the day doing yard work. A man's work is never done." }
  ],
  max: [
      { name: "Post a political article", cost: 15, updates: { grit: 2, happiness: 5 }, message: "You posted an article you know will make Colin mad. You're fighting the good fight.", chatAction: { targetId: 'colin', playerMessage: 'thought you might find this interesting...' } },
      { name: "Watch MSNBC", cost: 10, updates: { happiness: 10, energy: -5 }, message: "You got caught up on the latest political news. It's bleak, but you feel informed." },
      { name: "Order vegan food", cost: 20, updates: { grit: -5, happiness: 15 }, message: "You ordered a ridiculously expensive vegan meal. No regrets." }
  ],
  nick: [
      { name: "Practice with your acapella group", cost: 25, updates: { happiness: 15, energy: -10 }, message: "You nailed the harmonies. The group is sounding tight." },
      { name: "Post your GF", cost: 15, updates: { happiness: -10 }, message: "You posted a pic with your girlfriend. The chat is roasting her dyed hair." },
      { name: "Defend Michigan", cost: 20, updates: { grit: 2, happiness: 5 }, message: "Someone talked trash about your home state. You defended its honor." }
  ],
  pace: [
      { name: "Go for a swim", cost: 30, updates: { grit: 4, happiness: 15, energy: -15, clout: 5 }, message: "You had a great practice. The water felt amazing." },
      { name: "Text something weird", cost: 5, updates: { happiness: 5 }, message: "You sent a completely random, out-of-pocket text. They'll never know your next move." },
      { name: "Post a fit pic", cost: 15, updates: { clout: 15, happiness: 10 }, message: "You posted a fire picture on Instagram. The likes are rolling in." }
  ],
  seth: [
      { name: "Pray", cost: 10, updates: { happiness: 10 }, message: "You took some time to connect with the Lord. Amen." },
      { name: "Make an edgy joke", cost: 15, updates: { happiness: 5 }, message: "You made a joke that was on the line. Some people laughed." },
      { name: "Watch Terry McLaurin highlights", cost: 5, updates: { happiness: 15 }, message: "You watched Scary Terry highlights. What a beast." }
  ],
  spencer: [
      { name: "Post a chiropractic ad", cost: 10, updates: { grit: 2, happiness: -5 }, message: "You posted an ad for The Joint. The chat groaned." },
      { name: "Design league graphic", cost: 25, updates: { commishPower: 10, happiness: 5, energy: -10 }, message: "You used Canva to make a fire 'Matchup of the Week' graphic. It actually looks pretty good." },
      { name: "Update league power rankings", cost: 25, updates: { grit: 4, happiness: 5, commishPower: 5 }, message: "You put together some fire power rankings. A thankless job." }
  ],
  wyatt: [
      { name: "Read the bible", cost: 15, updates: { happiness: 10 }, message: "You spent some time with the Good Book." },
      { name: "Watch UConn basketball", cost: 20, updates: { happiness: Math.random() > 0.6 ? 25 : -10 }, message: Math.random() > 0.6 ? "Huskies win! National champs incoming." : "Tough loss for the Huskies. Pain." },
      { name: "Text 'BLM✊🏾'", cost: 5, updates: { happiness: 5 }, message: "You felt the spirit move you." }
  ],
};

// --- DATA FOR NEW MINIGAMES ---

export const commentaryBattleData = [
  {
    scenario: "The Cowboys are lining up for a 50-yard field goal to win the game.",
    options: [
      { text: "no way he makes this", points: 5 },
      { text: "if he makes this jerry jones gets another year...", points: 15, for: 'eric' },
      { text: "This is for all the grit.", points: 8 },
      { text: "lol imagine they miss", points: 3 },
    ]
  },
  {
    scenario: "Elie just posted a 5-paragraph analysis of why his fantasy team is actually brilliant despite being 0-5.",
    options: [
      { text: "bro wrote a whole dissertation", points: 8 },
      { text: "🤓", points: 15, for: 'justin' },
      { text: "tl;dr you suck", points: 12 },
      { text: "let him cook", points: 2, for: 'tj' },
    ]
  },
  {
    scenario: "A player on your team just tore his ACL. He's out for the season.",
    options: [
      { text: "i am going to be sick", points: 12 },
      { text: "well there goes my season", points: 8 },
      { text: "who's his backup??", points: 5 },
      { text: "F", points: 2 },
    ]
  }
];

export const fantasyDraftPlayers = [
  // Round 1
  [
    { name: "Christian McCaffrey", type: "Safe Stud", projection: 35, risk: 5, notes: "The best player in fantasy. Low risk, high reward." },
    { name: "Rookie WR Sensation", type: "High-Ceiling", projection: 40, risk: 25, notes: "Could be the next big thing... or a total bust." },
    { name: "Derrick Henry", type: "Gritty Vet", projection: 28, risk: 10, notes: "An absolute workhorse who will get his touches." },
  ],
  // Round 2
  [
    { name: "Amon-Ra St. Brown", type: "Safe Stud", projection: 25, risk: 8, notes: "A target-hog with a reliable floor." },
    { name: "Second-Year QB", type: "High-Ceiling", projection: 30, risk: 30, notes: "Has all the talent, but can he put it all together?" },
    { name: "Mike Evans", type: "Gritty Vet", projection: 22, risk: 15, notes: "Always finds a way to score. ALL-IN." },
  ],
  // Round 3
  [
    { name: "Evan Engram", type: "Safe Stud", projection: 15, risk: 12, notes: "A solid TE who gets consistent targets." },
    { name: "Handcuff RB", type: "High-Ceiling", projection: 20, risk: 40, notes: "Worthless unless the starter gets hurt, then he's a league-winner." },
    { name: "TJ Hockenson (Injured)", type: "Gritty Vet", projection: 12, risk: 50, notes: "Coming off a major injury, but could pay off big time late in the season." },
  ],
];

export const propBetTemplates = [
    { id: 'elie_podcast', text: 'Will Elie mention his podcast?', check: (history: Message[]) => {
        const recent = history.slice(-10);
        const mention = recent.find(m => m.speaker === 'elie' && m.text.includes('podcast'));
        return mention ? true : null;
    }},
    { id: 'eric_grit', text: 'Will Eric say "grit" or "all-in"?', check: (history: Message[]) => {
        const recent = history.slice(-5);
        const mention = recent.find(m => m.speaker === 'eric' && (m.text.includes('grit') || m.text.includes('all-in')));
        return mention ? true : null;
    }},
    { id: 'justin_nerd', text: 'Will Justin use the 🤓 emoji?', check: (history: Message[]) => {
        const recent = history.slice(-8);
        const mention = recent.find(m => m.speaker === 'justin' && m.text.includes('🤓'));
        return mention ? true : null;
    }},
    { id: 'ty_window', text: 'Will Ty send a message?', check: (history: Message[]) => {
        const recent = history.slice(-15);
        const mention = recent.find(m => m.speaker === 'ty');
        return mention ? true : null;
    }},
    { id: 'aaron_complains', text: 'Will Aaron complain about PA school?', check: (history: Message[]) => {
        const recent = history.slice(-10);
        const mention = recent.find(m => m.speaker === 'aaron' && (m.text.includes('school') || m.text.includes('study') || m.text.includes('exam')));
        return mention ? true : null;
    }},
    { id: 'alex_hurts', text: 'Will Alex defend Jalen Hurts?', check: (history: Message[]) => {
        const recent = history.slice(-10);
        const mention = recent.find(m => m.speaker === 'alex' && (m.text.includes('hurts') || m.text.includes('qb1')));
        return mention ? true : null;
    }},
];

export const triviaData = [
    {
        question: "Which player holds the record for most career rushing yards?",
        answers: ["Walter Payton", "Barry Sanders", "Emmitt Smith", "LaDainian Tomlinson"],
        correct: 2,
    },
    {
        question: "Who was the MVP of Super Bowl I?",
        answers: ["Joe Namath", "Bart Starr", "Johnny Unitas", "Len Dawson"],
        correct: 1,
    },
    {
        question: "Which two teams are tied for the most Super Bowl wins, with 6 each?",
        answers: ["Cowboys & 49ers", "Packers & Giants", "Steelers & Patriots", "49ers & Patriots"],
        correct: 2,
    },
    {
        question: "What is the nickname for the Seattle Seahawks' fanbase?",
        answers: ["The 12th Man", "The Legion of Boom", "The Steel Curtain", "The Dawg Pound"],
        correct: 0,
    },
    {
        question: "Which player famously performed the 'Lambeau Leap' after scoring?",
        answers: ["Brett Favre", "Donald Driver", "Aaron Rodgers", "LeRoy Butler"],
        correct: 3,
    }
];

export const allAchievements: Achievement[] = [
    // Game Progression
    { id: 'GRIT_CHAMPION', name: "The All-In Meal", description: "Win the game by having the most Grit at the end of the season." },
    { id: 'WEEK_1_CHAMP', name: "Hot Start", description: "Meet your Grit goal in the first week." },
    { id: 'MID_SEASON', name: "Halfway There", description: "Make it to Week 9 of the season." },
    { id: 'SURVIVOR', name: "Survivor", description: "Finish an entire season without your Happiness ever dropping below 10." },

    // Roasting
    { id: 'FIRST_ROAST', name: "First Blood", description: "Successfully land your first roast on another character." },
    { id: 'ROAST_ELIE', name: "Easy Target", description: "Successfully roast Elie. It's a rite of passage." },
    { id: 'ROAST_AARON', name: "The Bit", description: "As Colin, successfully roast Aaron." },
    { id: 'ROAST_COLIN', name: "For The Bit", description: "As Aaron, successfully roast Colin." },
    { id: 'ROAST_FAIL', name: "You Tried", description: "Have a roast backfire horribly." },

    // Social & Character
    { id: 'GET_GF', name: "No Longer Bitchless", description: "Successfully get a girlfriend." },
    { id: 'TY_WINDOW', name: "The Prophecy is True", description: "Witness Ty send a message in the chat." },
    { id: 'ELIE_MELTDOWN', name: "Main Character Moment", description: "Witness Elie have a full-blown meltdown." },
    { id: 'PACE_COUSIN', name: "Kicker Confirmation", description: "Hear Pace talk about his kicker cousin." },
    { id: 'JUSTIN_SNITCH', name: "Top 5 For Sure", description: "See Justin document one of Elie's bad takes." },
    { id: 'ARGUMENT_WINNER', name: "Debate Lord", description: "Win an argument that you started." },

    // Minigames
    { id: 'MINIGAME_MASTER', name: "Gamer", description: "Score over 50 Grit in any single minigame." },
    { id: 'KICKING_PERFECTION', name: "Perfect Leg", description: "Score a 'Perfect!' kick in the Kicking minigame." },
    { id: 'QB_TOUCHDOWN', name: "Pocket Presence", description: "Throw for a touchdown in the Quarterback minigame." },
    { id: 'RB_TOUCHDOWN', name: "To The House!", description: "Score a touchdown in the Running Back minigame." },
    { id: 'DRAFT_GURU', name: "Fantasy Expert", description: "Draft a team with a total projection over 75 in the Fantasy Draft." },
    { id: 'TRIVIA_PERFECT', name: "Brainiac", description: "Answer every question correctly in Trivia Night." },
    { id: 'DIE_GOD', name: "Die Is Life", description: "Score over 100 Grit in the Beer Die Challenge." },
    { id: 'SUNDAY_SCARIES_WIN', name: "Parlay God", description: "Win big in Sunday Scaries with a 5-leg parlay." },
    { id: 'COMMISH_CHAOS_REVOLT', name: "Absolute Power", description: "Cause a league revolt in Commish Chaos." },
    { id: 'TY_WINDOW_PERFECT', name: "Ty Whisperer", description: "Catch all 3 Ty Windows in one game." },
    { id: 'BITCHLESS_SURVIVOR', name: "Friend Zone Escape Artist", description: "Complete The Bitchless Chronicles with minimal insecurity gain." },

    // Store & Economy
    { id: 'HIT_PARLAY', name: "All-In Gambler", description: "Successfully hit a risky parlay action." },
    { id: 'BUY_PERMANENT', name: "Investor", description: "Buy your first permanent item from the store." },
    { id: 'FIVE_PERMANENTS', name: "Collector", description: "Own 5 permanent items at once." },
    { id: 'BIG_SPENDER', name: "Baller", description: "Spend over 1000 Grit at the store in a single season." },
    { id: 'GIFT_GIVER', name: "Generous God", description: "Buy an item that primarily benefits another character (e.g., Double Doink DVD for Elie)." },
    
    // Stats & Status
    { id: 'MAX_GRIT', name: "Gritty", description: "Have over 500 Grit at one time." },
    { id: 'MAX_HAPPINESS', name: "Pure Bliss", description: "Reach 100 Happiness." },
    { id: 'MAX_ENERGY', name: "Fully Charged", description: "Reach 100 Energy." },
    { id: 'BROKE', name: "Financially Ruined", description: "Have less than 10 Grit." },

    // Character-Specific
    { id: 'EGO_DEATH', name: "Humbled", description: "As Elie, have your Ego drop to 0." },
    { id: 'EGO_MANIAC', name: "I Am A God", description: "As Elie, reach 100 Ego." },
    { id: 'STRESS_FREE', name: "Finally, Peace", description: "As Aaron, have your PA School Stress drop to 0." },
    { id: 'SECURE', name: "Confidence", description: "As Craif, have your Insecurity drop to 0." },
];

// --- DATA FOR SUNDAY SCARIES PARLAY REVENGE GAME ---
export interface ParlayLeg {
    team: string;
    description: string;
    odds: number; // e.g., -110, +150
    success: boolean | null;
}

export const sundayScariesTeams = [
    "Cowboys", "Eagles", "Giants", "Commanders", "Bears", "Packers", "Vikings", "Lions",
    "Buccaneers", "Saints", "Falcons", "Panthers", "49ers", "Rams", "Seahawks", "Cardinals",
    "Steelers", "Ravens", "Browns", "Bengals", "Colts", "Titans", "Jaguars", "Texans",
    "Chiefs", "Raiders", "Chargers", "Broncos", "Bills", "Dolphins", "Patriots", "Jets"
];

export const sundayScariesRoasts = {
    losing: [
        "bruh you really thought that was gonna hit? 🤡",
        "another one bites the dust",
        "colin would be proud of this terrible bet",
        "your parlay is cooked bro",
        "you're down bad right now",
        "at least you tried... actually no you didn't even try that hard",
        "this is why you're broke",
        "imagine betting on that team lmaooo"
    ],
    won: [
        "elie: i called it the whole time actually",
        "elie: see i told you guys i'm smart",
        "elie: this is why i'm the main character",
        "justin: 🤓 'i knew that would happen'",
        "elie: my other circle would understand this bet better"
    ]
};

// --- DATA FOR COMMISH CHAOS ---
export interface CommishAction {
    name: string;
    description: string;
    powerCost: number;
    chaosGain: number;
    gritReward: number;
}

export const commishActions: CommishAction[] = [
    { name: "Veto Fair Trade", description: "Veto a perfectly reasonable trade just because you can", powerCost: 20, chaosGain: 30, gritReward: 15 },
    { name: "Change Scoring Rules", description: "Mid-season rule change to help your team", powerCost: 30, chaosGain: 50, gritReward: 25 },
    { name: "Post Joint Ad", description: "Post another chiropractic ad that nobody asked for", powerCost: 5, chaosGain: 10, gritReward: 5 },
    { name: "Ignore Complaints", description: "Someone's complaining? Just ignore them", powerCost: 10, chaosGain: 15, gritReward: 8 },
    { name: "Commissioner Decree", description: "Make up a new rule on the spot", powerCost: 40, chaosGain: 60, gritReward: 30 }
];

// --- DATA FOR TY WINDOW ---
export const tyWindowMessages = [
    "sup.",
    "yeah",
    "lol",
    "facts",
    "same",
    "nah",
    "maybe",
    "true",
    "yo what's good fellas. been thinking about life lately and honestly beer die is the answer to everything. anyway catch yall later",
    "bills mafia baby 🦬"
];

// --- DATA FOR BITCHLESS CHRONICLES ---
export interface DatingScenario {
    character: 'elie' | 'craif';
    situation: string;
    options: Array<{
        text: string;
        response: string;
        insecurityGain: number;
    }>;
}

export const datingScenarios: DatingScenario[] = [
    {
        character: 'elie',
        situation: "You match with a girl who has a rainbow flag emoji in her bio",
        options: [
            { text: "Hey! Love your vibe", response: "Sorry, I'm actually only into women 🏳️‍🌈", insecurityGain: 30 },
            { text: "What are you looking for?", response: "Women, actually. Thought the flag made that clear?", insecurityGain: 25 },
            { text: "You seem interesting", response: "Thanks! My girlfriend thinks so too", insecurityGain: 35 }
        ]
    },
    {
        character: 'craif',
        situation: "You text a girl you've been talking to for weeks",
        options: [
            { text: "Hey, want to grab dinner?", response: "Omg you're such a good friend! Let's do a group hangout!", insecurityGain: 25 },
            { text: "Been thinking about you", response: "Aww you're so sweet! Like a brother to me 🥰", insecurityGain: 30 },
            { text: "Coffee sometime?", response: "Sure! Can we invite some other people too?", insecurityGain: 20 }
        ]
    },
    {
        character: 'elie',
        situation: "At a party, you start talking to a girl about your podcast",
        options: [
            { text: "I actually have a podcast", response: "Cool! My girlfriend has one too!", insecurityGain: 25 },
            { text: "I'm kind of a content creator", response: "*walks away to talk to someone else*", insecurityGain: 40 },
            { text: "Let me tell you about my takes", response: "I'm gonna go get a drink...", insecurityGain: 20 }
        ]
    },
    {
        character: 'craif',
        situation: "You send the perfect text after days of drafting it",
        options: [
            { text: "*witty observation about her story*", response: "haha", insecurityGain: 15 },
            { text: "*thoughtful question*", response: "*left on read*", insecurityGain: 30 },
            { text: "*funny meme*", response: "😂 you're hilarious", insecurityGain: 10 }
        ]
    }
];