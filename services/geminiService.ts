import { GoogleGenAI, Modality } from "@google/genai";
import { Message, CharacterData, MinigameType, PlayerState } from '../types';
import { getAiPersona, characterData, conversationTopics } from '../constants';

const COMPLEX_API_MODEL = "gemini-2.5-flash";
const FAST_API_MODEL = "gemini-2.5-flash-lite";
const TTS_API_MODEL = "gemini-2.5-flash-preview-tts";

// Use a single, shared AI instance
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getCharacterStateString = (char: PlayerState): string => {
    let state = `(happiness: ${char.happiness}, energy: ${char.energy}`;
    switch (char.id) {
        case 'aaron': state += `, paSchoolStress: ${char.paSchoolStress}`; break;
        case 'elie': state += `, ego: ${char.ego}`; break;
        case 'craif': state += `, insecurity: ${char.insecurity}`; break;
    }
    return state + ')';
};

/**
 * Generates an audio clip of a character speaking a line of text.
 * @param text The text to be spoken.
 * @returns A promise that resolves to the base64 encoded audio string, or null.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: TTS_API_MODEL,
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A versatile male voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (e) {
        console.error("Error generating speech:", e);
        return null;
    }
};


/**
 * Generates a response from a specific NPC based on the conversation history.
 * @param history The current conversation history.
 * @param responder The full PlayerState of the responding NPC.
 * @param playerId The ID of the current player.
 * @returns A promise that resolves to the NPC's response text.
 */
export const generateNpcResponse = async (history: Message[], responder: PlayerState, playerId: string): Promise<string | null> => {
  try {
    const persona = getAiPersona(responder.id);
    const apiHistory = history.map(msg => ({
      role: msg.speaker === playerId ? 'user' : 'model',
      parts: [{ text: msg.speaker === 'system' ? `[SYSTEM]: ${msg.text}` : `${msg.speaker}: ${msg.text}` }]
    }));

    const systemInstruction = `${persona} Your current state is ${getCharacterStateString(responder)}. Let this influence your tone. For example, low happiness or energy should make you sound more annoyed or tired. Your response must be a short, lowercase text message. No more than two sentences.`;

    const response = await ai.models.generateContent({
      model: FAST_API_MODEL,
      contents: apiHistory,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    
    return response.text.trim();
  } catch (e) {
    console.error("Error generating NPC response:", e);
    return null; // Return null on error for better handling
  }
};

/**
 * Initiates a spontaneous, multi-participant conversation between NPCs.
 * @param history The current conversation history.
 * @param ranking An array of all character PlayerState objects.
 * @param playerId The ID of the current player.
 * @returns A promise that resolves to an array of new Message objects.
 */
export const initiateNpcConversation = async (history: Message[], ranking: PlayerState[], playerId: string): Promise<Message[]> => {
  try {
    const potentialSpeakers = ranking.filter(c => c.id !== playerId);
    if (potentialSpeakers.length < 2) return [];

    const shuffled = [...potentialSpeakers].sort(() => 0.5 - Math.random());
    const participants = shuffled.slice(0, Math.random() > 0.7 ? 3 : 2); // 2 or 3 participants
    const participantInfo = participants.map(p => `- ${p.name} (${p.id}): Persona: ${getAiPersona(p.id)} Current State: ${getCharacterStateString(p)}`).join('\n');
    const topic = conversationTopics[Math.floor(Math.random() * conversationTopics.length)];

    const historyString = history.slice(-15).map(msg => {
        if (msg.role === 'system') return `[SYSTEM ANNOUNCEMENT]: ${msg.text}`;
        return `${characterData[msg.speaker]?.name || 'Player'}: ${msg.text}`;
    }).join('\n');

    const prompt = `You are a scriptwriter for a chaotic online group chat of friends. Your task is to write a short, realistic, back-and-forth conversation snippet between a few members, taking their current emotional state into account.

    Here are the participants for this conversation, their personas, and their current stats:
    ${participantInfo}

    The general topic is: **${topic}**.

    Here is the most recent chat history for context. The conversation should flow NATURALLY from this history. NPCs should react to what other people just said and their current state should influence their tone (e.g., low happiness = irritable, high ego = boastful).
    ---
    ${historyString}
    ---

    Instructions:
    1.  Create a conversation that is 2 to 4 messages long.
    2.  **CRITICAL**: The conversation MUST be a direct, fluid, and logical continuation of the last few messages in the history. It must feel real.
    3.  Messages MUST be short, lowercase, authentic texts. Use slang, be edgy, stay in character.
    4.  The conversation should be about the given topic OR a direct reaction to the latest message in the history.
    
    Format your response STRICTLY as a JSON object with a "conversation" key, an array of objects, each with a "speaker" (the character's ID) and "text" property.

    Example: {"conversation": [{"speaker": "eric", "text": "dak looked so bad sunday"}, {"speaker": "colin", "text": "he's washed, i've been saying it"}, {"speaker": "eric", "text": "fire jerry jones into the sun"}]}`;
    
    const response = await ai.models.generateContent({
      model: COMPLEX_API_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const jsonString = response.text.replace(/```json\n?|\n?```/g, '');
    const parsed = JSON.parse(jsonString);
    
    if (parsed.conversation && Array.isArray(parsed.conversation)) {
      return parsed.conversation.map((msg: { speaker: string; text: string }) => ({
        speaker: msg.speaker,
        text: msg.text,
        role: 'model',
      }));
    }
    return [];
  } catch (e) {
    console.error("Error initiating NPC conversation:", e);
    return [];
  }
};

/**
 * Generates a roast from the player and reactions from other NPCs.
 * @param history Current chat history.
 * @param roasterData Full PlayerState of the roasting character.
 * @param targetData Full PlayerState of the target character.
 * @param allCharacters All characters in the game.
 * @returns A promise resolving to the roast data or null on error.
 */
export const generateRoastAndReactions = async (
  history: Message[],
  roasterData: PlayerState,
  targetData: PlayerState,
  allCharacters: PlayerState[]
): Promise<{ roast: Message; reactions: Message[]; success: boolean } | null> => {
  try {
    const historyString = history.slice(-10).map(msg => `${msg.speaker}: ${msg.text}`).join('\n');
    const potentialReactors = allCharacters.filter(c => c.id !== roasterData.id && c.id !== targetData.id);
    const reactors = [...potentialReactors].sort(() => 0.5 - Math.random()).slice(0, 2);

    const prompt = `You are a group chat roast battle judge. Your task is to script a brutal, lore-based roast and the ensuing reactions based on everyone's personality and current mood.
    
    The roaster is ${roasterData.name} (${roasterData.id}). 
    - Persona: ${getAiPersona(roasterData.id)}
    - Current State: ${getCharacterStateString(roasterData)}
    
    The target is ${targetData.name} (${targetData.id}). 
    - Persona & Weaknesses: ${getAiPersona(targetData.id)}
    - Current State: ${getCharacterStateString(targetData)}

    The following characters will react:
    ${reactors.map(r => `- ${r.name} (${r.id}): State: ${getCharacterStateString(r)}`).join('\n')}
    
    Recent chat history for context:
    ---
    ${historyString}
    ---

    Instructions:
    1. Generate a short, genuinely funny, MEAN, and in-character roast from ${roasterData.name}. It MUST be based on their specific lore and current state (e.g., a tired roaster might be lazy, a high-ego target is easier to trigger).
    2. Generate 2 short, funny, in-character reaction messages from the reactors, influenced by their states.
    3. Determine if the roast was successful (true) or if it backfired/was lame (false). A successful roast is clever, mean, and lore-based. A bad roast is generic or tries too hard.
    
    Format your response STRICTLY as a JSON object with keys: "roastText", "reactions", "success".
    "reactions" should be an array of objects, each with a "speaker" (character ID) and "text".

    Example: {
      "roastText": "elie you have the strategic mind of a coach who punts on 4th and 1 and the social awareness of a guy who hits on lesbians",
      "reactions": [
        {"speaker": "justin", "text": "that's a hall of fame roast 🤓"},
        {"speaker": "eric", "text": "damn. all-in."}
      ],
      "success": true
    }`;

    const response = await ai.models.generateContent({
      model: COMPLEX_API_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const jsonString = response.text.replace(/```json\n?|\n?```/g, '');
    const parsed = JSON.parse(jsonString);

    if (parsed.roastText && parsed.reactions) {
      const roastMessage: Message = { speaker: roasterData.id, text: parsed.roastText, role: 'user' };
      const reactionMessages: Message[] = parsed.reactions.map((r: any) => ({ speaker: r.speaker, text: r.text, role: 'model' }));
      return { roast: roastMessage, reactions: reactionMessages, success: parsed.success };
    }
    return null;
  } catch (e) {
    console.error("Error generating roast:", e);
    return null;
  }
};

/**
 * Generates reactions from NPCs about their minigame scores.
 * @param history Current chat history.
 * @param participants Array of NPCs who played, with their scores and state.
 * @param gameType The type of minigame that was played.
 * @returns A promise resolving to an array of reaction messages.
 */
export const generateNpcMinigameReactions = async (
  history: Message[],
  participants: { id: string; name: string; score: number; state: PlayerState }[],
  gameType: MinigameType
): Promise<Message[]> => {
  try {
    if (participants.length === 0) return [];

    const participantInfo = participants.map(p => 
      `- ${p.name} (id: ${p.id}, score: ${p.score}): Persona: ${getAiPersona(p.id)} State: ${getCharacterStateString(p.state)}`
    ).join('\n');

    const historyString = history.slice(-10).map(msg => `${characterData[msg.speaker]?.name || 'Player'}: ${msg.text}`).join('\n');

    const prompt = `You are a scriptwriter for a chaotic online group chat. Your task is to write short, realistic reactions from a few members about their scores in a minigame, based on their personality and mood.

    The game was: **${gameType}**.
    Here are the participants, their scores, and current states:
    ${participantInfo}

    Here is the most recent chat history for context:
    ---
    ${historyString}
    ---

    Instructions:
    1. For each participant, generate a short, in-character text message reacting to their score. A happy character might celebrate a low score, while an angry one might complain about a high one.
    2. The reactions MUST be short, lowercase, authentic texts.
    
    Format your response STRICTLY as a JSON object with a "reactions" key, containing an array of objects, each with a "speaker" (the character's ID) and "text" property.

    Example: {"reactions": [{"speaker": "eric", "text": "75? all-in baby"}, {"speaker": "colin", "text": "only 20, this game is rigged"}]}`;

    const response = await ai.models.generateContent({
      model: COMPLEX_API_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const jsonString = response.text.replace(/```json\n?|\n?```/g, '');
    const parsed = JSON.parse(jsonString);

    if (parsed.reactions && Array.isArray(parsed.reactions)) {
      return parsed.reactions.map((msg: { speaker: string; text: string }) => ({
        speaker: msg.speaker,
        text: msg.text,
        role: 'model',
      }));
    }
    return [];
  } catch (e) {
    console.error("Error generating minigame reactions:", e);
    return [];
  }
};