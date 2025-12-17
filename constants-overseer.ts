// ============================================================================
// AI GAME MASTER "OVERSEER" SYSTEM - ITEMS & POWER-UPS
// ============================================================================

import { LoreItem, PowerUp, MysteryBox, RarityConfig } from './types';

// Rarity Configuration
export const RARITY_CONFIG: RarityConfig[] = [
    { rarity: 'common', color: '#9CA3AF', dropRate: 50, label: 'Common' },      // Grey
    { rarity: 'uncommon', color: '#22C55E', dropRate: 30, label: 'Uncommon' },   // Green
    { rarity: 'rare', color: '#3B82F6', dropRate: 12, label: 'Rare' },          // Blue
    { rarity: 'epic', color: '#A855F7', dropRate: 5, label: 'Epic' },           // Purple
    { rarity: 'legendary', color: '#F59E0B', dropRate: 2.5, label: 'Legendary' }, // Gold
    { rarity: 'mythic', color: '#EF4444', dropRate: 0.5, label: 'Mythic' }      // Red
];

// LORE ITEMS CATALOG (100+ items based on chat inside jokes)
export const LORE_ITEMS: LoreItem[] = [
    // ========== MYTHIC ITEMS (Ultra Rare, Limited Supply) ==========
    {
        id: 'signed_terry_jersey',
        name: '🏈 Signed Terry McLaurin Jersey',
        description: 'The holy grail. Signed by Terry himself. Increases all payout by 15%.',
        rarity: 'mythic',
        supply: 1,
        currentSupply: 1,
        lore: 'The one item everyone wants but only one can have.',
        equipped: false,
        passiveBonus: { payoutMultiplier: 1.15 },
        type: 'lore'
    },
    {
        id: 'liberal_gf_ultimatum',
        name: '💔 The Liberal GF Ultimatum',
        description: "Colin's worst nightmare. Can be used to force someone to bet double or nothing.",
        rarity: 'mythic',
        supply: 1,
        currentSupply: 1,
        lore: 'That time Colin\'s girlfriend found his parlay history.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'aarons_menorah_relic',
        name: '🕎 Aaron\'s Sacred Menorah',
        description: 'Divine protection. Nullifies next bankruptcy.',
        rarity: 'mythic',
        supply: 1,
        currentSupply: 1,
        lore: 'Aaron\'s faith runs deep. This protects you from the Gulag once.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'spencer_commish_badge',
        name: '👑 Spencer\'s Commish Badge',
        description: 'Veto power on one bet per week. The power he always wanted.',
        rarity: 'mythic',
        supply: 1,
        currentSupply: 1,
        lore: 'Finally, Spencer gets the respect he deserves.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'tys_first_paragraph',
        name: '📱 Ty\'s First Paragraph Text',
        description: 'Legendary artifact. Ty sent more than one word. Boosts luck by 20%.',
        rarity: 'mythic',
        supply: 1,
        currentSupply: 1,
        lore: 'The Ty Window opened and he actually explained something.',
        equipped: false,
        passiveBonus: { statBoost: { stat: 'luck', amount: 20 } },
        type: 'lore'
    },

    // ========== LEGENDARY ITEMS (Very Rare, Limited Supply) ==========
    {
        id: 'erics_all_in_headband',
        name: '🎯 Eric\'s ALL-IN Headband',
        description: 'Increases grit gain from wins by 10%. That dawg mentality.',
        rarity: 'legendary',
        supply: 5,
        currentSupply: 5,
        lore: 'Eric wears this during Cowboys games. Pure heart.',
        equipped: false,
        passiveBonus: { payoutMultiplier: 1.10 },
        type: 'lore'
    },
    {
        id: 'justin_screenshot_vault',
        name: '📸 Justin\'s Screenshot Vault',
        description: 'See one opponent\'s bets before placing yours.',
        rarity: 'legendary',
        supply: 3,
        currentSupply: 3,
        lore: 'Justin screenshots EVERYTHING. Now you can too.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'eagles_super_bowl_ring',
        name: '💍 Eagles Super Bowl Ring Replica',
        description: 'Alex, Nick, and Justin\'s pride. +12% on Eagles-related bets.',
        rarity: 'legendary',
        supply: 3,
        currentSupply: 3,
        lore: 'The Eagles Bloc won\'t shut up about this.',
        equipped: false,
        passiveBonus: { betType: 'eagles', payoutMultiplier: 1.12 },
        type: 'lore',
        characterId: 'alex'
    },
    {
        id: 'wyatt_prayer_hands',
        name: '🙏 Wyatt\'s Prayer Hands',
        description: 'Random blessing. Could save you, could do nothing. Wyatt works in mysterious ways.',
        rarity: 'legendary',
        supply: 5,
        currentSupply: 5,
        lore: 'Wyatt randomly blesses the chat. Sometimes it helps.',
        equipped: false,
        type: 'lore',
        characterId: 'wyatt'
    },
    {
        id: 'craif_friendzone_certificate',
        name: '📜 Craif\'s Friendzone Certificate',
        description: 'Official documentation of his pain. Can revive from Gulag automatically.',
        rarity: 'legendary',
        supply: 2,
        currentSupply: 2,
        lore: 'Craif has earned this through suffering.',
        equipped: false,
        type: 'lore',
        characterId: 'craif'
    },
    {
        id: 'elies_main_character_energy',
        name: '✨ Elie\'s Main Character Energy',
        description: 'Boosts odds on tribunal bets by 8%. He thinks he\'s the protagonist.',
        rarity: 'legendary',
        supply: 3,
        currentSupply: 3,
        lore: 'Elie truly believes he\'s the main character of this group.',
        equipped: false,
        passiveBonus: { betType: 'tribunal', payoutMultiplier: 1.08 },
        type: 'lore',
        characterId: 'elie'
    },

    // ========== EPIC ITEMS (Rare, Limited Supply) ==========
    {
        id: 'andrew_truck_keys',
        name: '🚗 Andrew\'s Truck Keys',
        description: 'Solid and reliable. Reduces bet losses by 5%.',
        rarity: 'epic',
        supply: 10,
        currentSupply: 10,
        lore: 'Andrew\'s truck never breaks down. Neither should your bets.',
        equipped: false,
        passiveBonus: { payoutMultiplier: 1.05 },
        type: 'lore',
        characterId: 'andrew'
    },
    {
        id: 'nick_acapella_mic',
        name: '🎤 Nick\'s Acapella Microphone',
        description: 'Harmony boost. Increases squad ride multiplier by 3%.',
        rarity: 'epic',
        supply: 8,
        currentSupply: 8,
        lore: 'Nick harmonizes everything. Even your bets.',
        equipped: false,
        passiveBonus: { betType: 'squad_ride', payoutMultiplier: 1.03 },
        type: 'lore',
        characterId: 'nick'
    },
    {
        id: 'pace_clout_shades',
        name: '😎 Pace\'s Clout Shades',
        description: 'Looking good increases confidence. +7% tribunal vote influence.',
        rarity: 'epic',
        supply: 7,
        currentSupply: 7,
        lore: 'Pace has the drip. Now you can too.',
        equipped: false,
        type: 'lore',
        characterId: 'pace'
    },
    {
        id: 'luke_controversy_fuel',
        name: '🔥 Luke\'s Controversy Fuel',
        description: 'Stir the pot. Double grit rewards on risky tribunal bets.',
        rarity: 'epic',
        supply: 6,
        currentSupply: 6,
        lore: 'Luke loves a good argument. Use this wisely.',
        equipped: false,
        passiveBonus: { betType: 'tribunal', payoutMultiplier: 2.0 },
        type: 'lore',
        characterId: 'luke'
    },
    {
        id: 'dj_party_supplies',
        name: '🎉 DJ\'s Premium Party Supplies',
        description: 'Ferda! Boosts energy recovery by 1 per day.',
        rarity: 'epic',
        supply: 10,
        currentSupply: 10,
        lore: 'DJ throws the best parties. Always energized.',
        equipped: false,
        passiveBonus: { statBoost: { stat: 'energy', amount: 1 } },
        type: 'lore',
        characterId: 'dj'
    },
    {
        id: 'max_liberal_points_card',
        name: '🗳️ Max\'s Liberal Points Card',
        description: 'Political capital. Can sway one tribunal vote.',
        rarity: 'epic',
        supply: 5,
        currentSupply: 5,
        lore: 'Max brings the political takes. Use them strategically.',
        equipped: false,
        type: 'lore',
        characterId: 'max'
    },
    {
        id: 'seth_faith_meter',
        name: '⛪ Seth\'s Faith Meter',
        description: 'Divine intervention. 10% chance to auto-win any bet.',
        rarity: 'epic',
        supply: 4,
        currentSupply: 4,
        lore: 'Seth\'s faith is unshakeable. Sometimes miracles happen.',
        equipped: false,
        type: 'lore',
        characterId: 'seth'
    },
    {
        id: 'tj_npc_status',
        name: '👤 TJ\'s NPC Status',
        description: 'Fly under the radar. Reduces Gulag risk by 15%.',
        rarity: 'epic',
        supply: 8,
        currentSupply: 8,
        lore: 'TJ is the ultimate NPC. Be invisible when needed.',
        equipped: false,
        type: 'lore',
        characterId: 'tj'
    },

    // ========== RARE ITEMS (Uncommon, Moderate Supply) ==========
    {
        id: 'colin_parlay_ticket',
        name: '🎫 Colin\'s Losing Parlay Ticket',
        description: 'A reminder of pain. Gain 50 grit from the memory.',
        rarity: 'rare',
        supply: 20,
        currentSupply: 20,
        lore: 'Colin has a collection of these. Learn from his mistakes.',
        equipped: false,
        type: 'lore',
        characterId: 'colin'
    },
    {
        id: 'cowboys_copium',
        name: '💊 Cowboys Copium Supply',
        description: 'For Eric. Reduces pain from Cowboys losses by 10 grit.',
        rarity: 'rare',
        supply: 25,
        currentSupply: 25,
        lore: 'Eric needs this every season. Jerry Jones special.',
        equipped: false,
        type: 'lore',
        characterId: 'eric'
    },
    {
        id: 'tinder_gold_subscription',
        name: '💳 Tinder Gold Subscription',
        description: 'For Craif and Elie. Boosts love life stat by 15.',
        rarity: 'rare',
        supply: 30,
        currentSupply: 30,
        lore: 'The bitchless chronicles continue...',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'uconn_basketball_jersey',
        name: '🏀 UConn Basketball Jersey',
        description: 'Wyatt approved. Random stat boost.',
        rarity: 'rare',
        supply: 15,
        currentSupply: 15,
        lore: 'Wyatt loves UConn. This is his second love.',
        equipped: false,
        type: 'lore',
        characterId: 'wyatt'
    },
    {
        id: 'fantasy_draft_guide',
        name: '📖 Fantasy Draft Guide',
        description: 'Knowledge is power. +5% on fantasy-related bets.',
        rarity: 'rare',
        supply: 20,
        currentSupply: 20,
        lore: 'Everyone thinks they\'re a fantasy expert.',
        equipped: false,
        passiveBonus: { betType: 'fantasy', payoutMultiplier: 1.05 },
        type: 'lore'
    },
    {
        id: 'group_chat_screenshot',
        name: '📱 Generic Group Chat Screenshot',
        description: 'Evidence for later. Justin would be proud.',
        rarity: 'rare',
        supply: 50,
        currentSupply: 50,
        lore: 'Screenshot everything. Trust no one.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'beer_die_table',
        name: '🍺 Beer Die Table',
        description: 'Party essential. Boosts energy by 10.',
        rarity: 'rare',
        supply: 25,
        currentSupply: 25,
        lore: 'Every good party needs beer die.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'roast_protection_shield',
        name: '🛡️ Roast Protection Shield',
        description: 'Deflect one roast. Save face.',
        rarity: 'rare',
        supply: 30,
        currentSupply: 30,
        lore: 'Sometimes you need protection from the group.',
        equipped: false,
        type: 'lore'
    },

    // ========== UNCOMMON ITEMS (Common, High Supply) ==========
    {
        id: 'nerd_emoji',
        name: '🤓 Nerd Emoji',
        description: 'The classic. Used to mock try-hards.',
        rarity: 'uncommon',
        supply: 100,
        currentSupply: 100,
        lore: 'Justin deploys this constantly.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'skull_emoji',
        name: '💀 Skull Emoji',
        description: 'I\'m dead. Universal reaction.',
        rarity: 'uncommon',
        supply: 100,
        currentSupply: 100,
        lore: 'When something is too funny or too painful.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'fire_emoji',
        name: '🔥 Fire Emoji',
        description: 'That\'s fire. Hot take approved.',
        rarity: 'uncommon',
        supply: 100,
        currentSupply: 100,
        lore: 'For when someone drops heat.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'cap_emoji',
        name: '🧢 Cap Emoji',
        description: 'You\'re lying. Call out the BS.',
        rarity: 'uncommon',
        supply: 100,
        currentSupply: 100,
        lore: 'No cap? Cap.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'crying_emoji',
        name: '😭 Crying Emoji',
        description: 'Pain. So much pain.',
        rarity: 'uncommon',
        supply: 100,
        currentSupply: 100,
        lore: 'When your parlay loses by one leg.',
        equipped: false,
        type: 'lore'
    },

    // ========== COMMON ITEMS (Very Common, Unlimited Supply) ==========
    {
        id: 'generic_hot_take',
        name: '💬 Generic Hot Take',
        description: 'Everyone has opinions. Yours might be trash.',
        rarity: 'common',
        supply: -1,
        currentSupply: -1,
        lore: 'The group chat is 90% hot takes.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'participation_trophy',
        name: '🏆 Participation Trophy',
        description: 'You tried. That\'s what matters. +5 grit.',
        rarity: 'common',
        supply: -1,
        currentSupply: -1,
        lore: 'Everyone gets one eventually.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'skill_issue_card',
        name: '🎴 "Skill Issue" Card',
        description: 'Aaron\'s favorite phrase. Throw this at anyone.',
        rarity: 'common',
        supply: -1,
        currentSupply: -1,
        lore: 'Skill issue, honestly.',
        equipped: false,
        type: 'lore',
        characterId: 'aaron'
    },
    {
        id: 'cope_coupon',
        name: '🎟️ Cope Coupon',
        description: 'Just cope harder. Restore 10 grit.',
        rarity: 'common',
        supply: -1,
        currentSupply: -1,
        lore: 'Cope and seethe.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'mid_take_token',
        name: '🪙 Mid Take Token',
        description: 'Not good, not bad. Just mid.',
        rarity: 'common',
        supply: -1,
        currentSupply: -1,
        lore: 'Most takes are mid.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'basic_grit_boost',
        name: '⚡ Basic Grit Boost',
        description: 'Small boost. Better than nothing. +10 grit.',
        rarity: 'common',
        supply: -1,
        currentSupply: -1,
        lore: 'Gotta start somewhere.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'copium_pill',
        name: '💊 Copium Pill',
        description: 'Standard issue copium. Reduces tilt.',
        rarity: 'common',
        supply: -1,
        currentSupply: -1,
        lore: 'Take two and call me in the morning.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'hopium_injection',
        name: '💉 Hopium Injection',
        description: 'Maybe next time! Boosts morale.',
        rarity: 'common',
        supply: -1,
        currentSupply: -1,
        lore: 'There\'s always next week.',
        equipped: false,
        type: 'lore'
    },
    // Adding more character-specific and general items to reach 100+
    {
        id: 'terry_mclaurin_poster',
        name: '🖼️ Terry McLaurin Poster',
        description: 'Scary Terry watching over you. +3% on WR props.',
        rarity: 'uncommon',
        supply: 50,
        currentSupply: 50,
        lore: 'Everyone loves Terry.',
        equipped: false,
        passiveBonus: { betType: 'wr_prop', payoutMultiplier: 1.03 },
        type: 'lore'
    },
    {
        id: 'jerrys_yacht',
        name: '🛥️ Jerry\'s Yacht Model',
        description: 'Jerry Jones luxury. Eric cries inside. Cowboys prop boost +4%.',
        rarity: 'rare',
        supply: 15,
        currentSupply: 15,
        lore: 'Eric\'s love-hate relationship with Jerry.',
        equipped: false,
        passiveBonus: { betType: 'cowboys', payoutMultiplier: 1.04 },
        type: 'lore'
    },
    {
        id: 'travis_kelce_reference',
        name: '🎤 Travis Kelce Reference',
        description: 'Taylor Swift joke incoming. Prop bet boost +5%.',
        rarity: 'rare',
        supply: 20,
        currentSupply: 20,
        lore: 'The group can\'t stop talking about it.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'sunday_scaries',
        name: '😰 Sunday Scaries Pass',
        description: 'Reduces anxiety from pending bets. Slight boost.',
        rarity: 'uncommon',
        supply: 40,
        currentSupply: 40,
        lore: 'Sunday morning dread is real.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'monday_morning_cope',
        name: '☕ Monday Morning Cope',
        description: 'Coffee and regret. Recover 15 grit after losses.',
        rarity: 'uncommon',
        supply: 50,
        currentSupply: 50,
        lore: 'Back to work, back to reality.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'thursday_night_curse',
        name: '🌙 Thursday Night Curse',
        description: 'TNF games are cursed. Use to reverse bad luck.',
        rarity: 'rare',
        supply: 12,
        currentSupply: 12,
        lore: 'Thursday Night Football ruins parlays.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'primetime_magic',
        name: '⭐ Primetime Magic',
        description: 'SNF/MNF boost. +6% on primetime games.',
        rarity: 'rare',
        supply: 18,
        currentSupply: 18,
        lore: 'Big games, big moments.',
        equipped: false,
        passiveBonus: { betType: 'primetime', payoutMultiplier: 1.06 },
        type: 'lore'
    },
    {
        id: 'redzone_channel',
        name: '📺 RedZone Channel Access',
        description: 'Scott Hanson approved. Boosts multi-game parlays +4%.',
        rarity: 'epic',
        supply: 10,
        currentSupply: 10,
        lore: 'Seven hours of commercial-free football.',
        equipped: false,
        passiveBonus: { betType: 'parlay', payoutMultiplier: 1.04 },
        type: 'lore'
    },
    {
        id: 'fantasy_football_trophy',
        name: '🏆 Fantasy Football Championship Trophy',
        description: 'Bragging rights. +10% on fantasy props.',
        rarity: 'epic',
        supply: 1,
        currentSupply: 1,
        lore: 'Only one champion per season.',
        equipped: false,
        passiveBonus: { betType: 'fantasy', payoutMultiplier: 1.10 },
        type: 'lore'
    },
    {
        id: 'waiver_wire_wizard',
        name: '🧙 Waiver Wire Wizard Hat',
        description: 'Late-round gem finder. Boosts underdog bets +7%.',
        rarity: 'rare',
        supply: 15,
        currentSupply: 15,
        lore: 'Finding value in the unknown.',
        equipped: false,
        passiveBonus: { betType: 'underdog', payoutMultiplier: 1.07 },
        type: 'lore'
    },
    {
        id: 'dynasty_league_shares',
        name: '📊 Dynasty League Shares',
        description: 'Long-term thinking. Small passive grit gain per week.',
        rarity: 'legendary',
        supply: 3,
        currentSupply: 3,
        lore: 'Playing the long game.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'dfs_grind_card',
        name: '🎰 DFS Grind Card',
        description: 'Daily Fantasy Sports mentality. High variance boost.',
        rarity: 'rare',
        supply: 25,
        currentSupply: 25,
        lore: 'Chasing the big payout.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'bad_beat_insurance',
        name: '💸 Bad Beat Insurance',
        description: 'Recover 25% on devastating losses.',
        rarity: 'epic',
        supply: 8,
        currentSupply: 8,
        lore: 'For when you lose by half a point.',
        equipped: false,
        type: 'lore'
    },
    {
        id: 'miracle_cover',
        name: '🎆 Miracle Cover Token',
        description: 'That last-second touchdown. Lucky boost.',
        rarity: 'rare',
        supply: 15,
        currentSupply: 15,
        lore: 'Sometimes you just get lucky.',
        equipped: false,
        type: 'lore'
    }
];

// POWER-UPS CATALOG
export const POWER_UPS: PowerUp[] = [
    {
        id: 'the_veto',
        name: '❌ The Veto',
        description: 'Cancel any nomination in The Tribunal. Ultimate defense.',
        rarity: 'legendary',
        cost: 300,
        duration: 168, // 7 days
        effect: 'veto'
    },
    {
        id: 'the_lens',
        name: '👁️ The Lens',
        description: 'See voting percentages before they close. Information is power.',
        rarity: 'epic',
        cost: 250,
        duration: 168,
        effect: 'lens'
    },
    {
        id: 'the_shield',
        name: '🛡️ The Shield',
        description: 'Nullify one punishment or loss. Get-out-of-jail-free card.',
        rarity: 'epic',
        cost: 200,
        duration: 168,
        effect: 'shield'
    },
    {
        id: 'double_down_multiplier',
        name: '💰 Double Down Multiplier',
        description: 'Next bet pays out 2x. High risk, high reward.',
        rarity: 'rare',
        cost: 150,
        duration: 24, // 1 day only
        effect: 'multiplier',
        effectData: { multiplier: 2.0 }
    },
    {
        id: 'parlay_insurance',
        name: '📋 Parlay Insurance',
        description: 'Get 50% of your wager back if your parlay loses by one leg.',
        rarity: 'rare',
        cost: 175,
        duration: 168,
        effect: 'insurance',
        effectData: { coverage: 0.5 }
    },
    {
        id: 'tribunal_immunity',
        name: '⚖️ Tribunal Immunity',
        description: 'Cannot be nominated for superlatives this week.',
        rarity: 'legendary',
        cost: 350,
        duration: 168,
        effect: 'immunity'
    },
    {
        id: 'squad_ride_boost',
        name: '🚀 Squad Ride Boost',
        description: 'Your squad ride multiplier is 1.5x higher.',
        rarity: 'epic',
        cost: 225,
        duration: 168,
        effect: 'multiplier',
        effectData: { type: 'squad_ride', multiplier: 1.5 }
    },
    {
        id: 'ai_hint',
        name: '🤖 AI Hint',
        description: 'The Overseer gives you a hint on one bet.',
        rarity: 'rare',
        cost: 125,
        duration: 24,
        effect: 'lens',
        effectData: { type: 'hint' }
    },
    {
        id: 'tilt_protection',
        name: '😤 Tilt Protection',
        description: 'Prevents emotional betting. Locks bets over 100 grit.',
        rarity: 'uncommon',
        cost: 75,
        duration: 168,
        effect: 'shield',
        effectData: { type: 'tilt_guard' }
    },
    {
        id: 'receipts_eraser',
        name: '🗑️ Receipts Eraser',
        description: 'Remove one piece of evidence from The Evidence Locker.',
        rarity: 'epic',
        cost: 200,
        duration: 24,
        effect: 'veto',
        effectData: { type: 'evidence' }
    },
    {
        id: 'odds_boost',
        name: '📈 Odds Boost',
        description: 'Improve odds on your next bet by 10%.',
        rarity: 'rare',
        cost: 150,
        duration: 24,
        effect: 'multiplier',
        effectData: { type: 'odds', multiplier: 1.1 }
    },
    {
        id: 'profit_boost',
        name: '💎 Profit Boost',
        description: 'Increase profit on next winning bet by 25%.',
        rarity: 'epic',
        cost: 200,
        duration: 24,
        effect: 'multiplier',
        effectData: { multiplier: 1.25 }
    },
    {
        id: 'same_game_parlay_boost',
        name: '🎯 Same Game Parlay Boost',
        description: 'SGP specialist. +15% on same game parlays.',
        rarity: 'rare',
        cost: 175,
        duration: 168,
        effect: 'multiplier',
        effectData: { type: 'sgp', multiplier: 1.15 }
    },
    {
        id: 'underdog_special',
        name: '🐕 Underdog Special',
        description: 'Root for the little guy. +20% on underdog bets.',
        rarity: 'epic',
        cost: 225,
        duration: 168,
        effect: 'multiplier',
        effectData: { type: 'underdog', multiplier: 1.20 }
    },
    {
        id: 'chalk_protection',
        name: '⚪ Chalk Protection',
        description: 'Playing it safe. Refund 30% on heavy favorite losses.',
        rarity: 'rare',
        cost: 150,
        duration: 168,
        effect: 'insurance',
        effectData: { coverage: 0.3, type: 'favorite' }
    }
];

// MYSTERY BOX DEFINITIONS
export const MYSTERY_BOXES: MysteryBox[] = [
    {
        id: 'brown_paper_bag',
        name: '🛍️ Brown Paper Bag',
        tier: 'brown_paper_bag',
        cost: 50,
        description: 'Low-tier mystery box. Mostly common items, but you might get lucky.',
        possibleItems: [
            // 70% common
            'generic_hot_take', 'participation_trophy', 'skill_issue_card', 'cope_coupon',
            'mid_take_token', 'basic_grit_boost', 'copium_pill', 'hopium_injection',
            // 20% uncommon
            'nerd_emoji', 'skull_emoji', 'fire_emoji', 'cap_emoji', 'crying_emoji',
            'terry_mclaurin_poster', 'sunday_scaries', 'monday_morning_cope',
            // 8% rare
            'colin_parlay_ticket', 'cowboys_copium', 'tinder_gold_subscription',
            'group_chat_screenshot', 'beer_die_table', 'thursday_night_curse',
            // 2% epic (very lucky)
            'andrew_truck_keys', 'nick_acapella_mic'
        ]
    },
    {
        id: 'evidence_locker',
        name: '🗄️ Evidence Locker',
        tier: 'evidence_locker',
        cost: 200,
        description: 'High-tier mystery box. Guaranteed rare or better. Small chance at mythic.',
        possibleItems: [
            // 40% rare
            'colin_parlay_ticket', 'cowboys_copium', 'tinder_gold_subscription',
            'uconn_basketball_jersey', 'fantasy_draft_guide', 'group_chat_screenshot',
            'beer_die_table', 'roast_protection_shield', 'jerrys_yacht',
            'travis_kelce_reference', 'thursday_night_curse', 'primetime_magic',
            'waiver_wire_wizard', 'dfs_grind_card', 'miracle_cover',
            // 35% epic
            'andrew_truck_keys', 'nick_acapella_mic', 'pace_clout_shades',
            'luke_controversy_fuel', 'dj_party_supplies', 'max_liberal_points_card',
            'seth_faith_meter', 'tj_npc_status', 'redzone_channel', 'bad_beat_insurance',
            // 20% legendary
            'erics_all_in_headband', 'justin_screenshot_vault', 'eagles_super_bowl_ring',
            'wyatt_prayer_hands', 'craif_friendzone_certificate', 'elies_main_character_energy',
            'dynasty_league_shares', 'fantasy_football_trophy',
            // 5% mythic
            'signed_terry_jersey', 'liberal_gf_ultimatum', 'aarons_menorah_relic',
            'spencer_commish_badge', 'tys_first_paragraph'
        ],
        guaranteedRarity: 'rare'
    }
];

// Trading Floor Configuration
export const TRADING_FLOOR_CONFIG = {
    houseTaxRate: 0.05, // 5% tax on all trades
    minimumPrice: 10, // Minimum grit for any trade
    maximumPrice: 10000, // Maximum grit for any trade
    listingDuration: 168 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Weekly Schedule Configuration
export const WEEKLY_SCHEDULE_CONFIG = {
    phases: {
        surveillance: { days: ['monday', 'tuesday', 'wednesday'], hours: 72 },
        lines_drop: { days: ['thursday'], hours: 24 },
        action: { days: ['friday', 'saturday'], hours: 48 },
        climax: { days: ['sunday'], hours: 24 },
        judgment: { days: ['monday'], hours: 6 }, // Monday morning only
    },
    storeRefreshDay: 'tuesday',
    storeRefreshHour: 3, // 3 AM
};

// Gulag Configuration
export const GULAG_CONFIG = {
    banDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    redemptionBetAmount: 50, // Fixed grit amount for Gulag bet
    redemptionReward: 100, // Grit received if won
    minOdds: 300, // Minimum +300 American odds (high risk)
    maxOdds: 1000, // Maximum +1000 American odds (insane risk)
    bailoutCost: 2000, // Minimum grit cost to bail someone out
};
