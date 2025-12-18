import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiskProfile } from '../../types';
import { PERSONALITY_TEST_QUESTIONS, calculateRiskProfile, createUserProfile, saveUserProfile } from '../../services/profileService';

interface TheBlackBoxProps {
  onComplete: (userId: string, userName: string, riskProfile: RiskProfile) => void;
}

export const TheBlackBox: React.FC<TheBlackBoxProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<number[][]>([]);
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [calculatingProfile, setCalculatingProfile] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [showSignUpButton, setShowSignUpButton] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Intro text sequence
  const INTRO_SEQUENCE = [
    'INITIALIZING TERMINAL...',
    '',
    'MINI BEASTS PERSONALITY ASSESSMENT v2.1',
    '',
    'THIS IS NOT A STANDARD REGISTRATION FORM.',
    '',
    'WE NEED TO UNDERSTAND WHO YOU ARE.',
    'WHAT DRIVES YOU.',
    'HOW YOU THINK.',
    '',
    'ANSWER HONESTLY.',
    'THE SYSTEM KNOWS.',
    '',
    'PRESS ENTER TO BEGIN...'
  ];

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Type out intro text
  useEffect(() => {
    if (currentQuestionIndex === -1) {
      let currentLine = 0;
      let currentChar = 0;
      let text = '';

      const typeInterval = setInterval(() => {
        if (currentLine >= INTRO_SEQUENCE.length) {
          clearInterval(typeInterval);
          return;
        }

        const line = INTRO_SEQUENCE[currentLine];
        
        if (currentChar < line.length) {
          text += line[currentChar];
          setDisplayedText(text);
          currentChar++;
        } else {
          // Move to next line
          text += '\n';
          setDisplayedText(text);
          currentLine++;
          currentChar = 0;
          
          // Add slight delay between lines
          if (currentLine < INTRO_SEQUENCE.length) {
            setTimeout(() => {}, 100);
          }
        }
      }, 30);

      return () => clearInterval(typeInterval);
    }
  }, [currentQuestionIndex]);

  // Type out question text
  useEffect(() => {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < PERSONALITY_TEST_QUESTIONS.length) {
      const question = PERSONALITY_TEST_QUESTIONS[currentQuestionIndex];
      let currentChar = 0;
      const questionText = `QUESTION ${currentQuestionIndex + 1}/${PERSONALITY_TEST_QUESTIONS.length}\n\n${question.question}`;
      
      setShowOptions(false);
      setDisplayedText('');

      const typeInterval = setInterval(() => {
        if (currentChar < questionText.length) {
          setDisplayedText(questionText.substring(0, currentChar + 1));
          currentChar++;
        } else {
          clearInterval(typeInterval);
          // Show options after question is fully typed
          setTimeout(() => setShowOptions(true), 500);
        }
      }, 30);

      return () => clearInterval(typeInterval);
    }
  }, [currentQuestionIndex]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [displayedText]);

  const handleStart = () => {
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, [optionIndex]];
    setAnswers(newAnswers);
    
    // Move to next question or calculate profile
    if (currentQuestionIndex + 1 < PERSONALITY_TEST_QUESTIONS.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate profile
      setCalculatingProfile(true);
      
      setTimeout(() => {
        const profile = calculateRiskProfile(newAnswers);
        setRiskProfile(profile);
        
        // Type out result
        const resultText = `\n\nANALYSIS COMPLETE.\n\nPROFILE IDENTIFIED: ${profile.name.toUpperCase()}\n\n${profile.description}\n\nYOU ARE READY.`;
        let currentChar = 0;
        
        const typeInterval = setInterval(() => {
          if (currentChar < resultText.length) {
            setDisplayedText(prev => prev + resultText[currentChar]);
            currentChar++;
          } else {
            clearInterval(typeInterval);
            setCalculatingProfile(false);
            // Show sign up button after profile reveal
            setTimeout(() => setShowSignUpButton(true), 1000);
          }
        }, 40);
      }, 2000);
    }
  };

  const handleSignUp = () => {
    if (riskProfile) {
      // In production, this would trigger Google OAuth
      // For now, we'll create a demo user
      const userId = `user_${Date.now()}`;
      const userName = 'Demo User';
      
      const userProfile = createUserProfile(userId, userName, riskProfile);
      saveUserProfile(userProfile);
      
      onComplete(userId, userName, riskProfile);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentQuestionIndex === -1) {
      handleStart();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center"
      onKeyPress={handleKeyPress}
      tabIndex={0}
    >
      <div className="w-full max-w-4xl h-full max-h-screen p-8 flex flex-col">
        {/* Terminal window */}
        <div className="flex-1 bg-black border-2 border-green-500 rounded-lg overflow-hidden flex flex-col font-mono">
          {/* Terminal header */}
          <div className="bg-green-500 px-4 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-700"></div>
            <span className="ml-4 text-black text-sm font-bold">MINI_BEASTS_TERMINAL</span>
          </div>

          {/* Terminal content */}
          <div 
            ref={textContainerRef}
            className="flex-1 p-6 overflow-y-auto text-green-500 whitespace-pre-wrap"
          >
            {displayedText}
            {showCursor && <span className="animate-pulse">▊</span>}
            
            {/* Question options */}
            <AnimatePresence>
              {showOptions && currentQuestionIndex >= 0 && currentQuestionIndex < PERSONALITY_TEST_QUESTIONS.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 space-y-3"
                >
                  {PERSONALITY_TEST_QUESTIONS[currentQuestionIndex].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="block w-full text-left px-4 py-3 border border-green-500 hover:bg-green-500/20 transition-colors"
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {`[${index + 1}] ${option.text}`}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Calculating animation */}
            {calculatingProfile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-center"
              >
                <div className="inline-block">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ANALYZING...
                  </motion.span>
                </div>
              </motion.div>
            )}

            {/* Sign up button */}
            <AnimatePresence>
              {showSignUpButton && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center"
                >
                  <motion.button
                    onClick={handleSignUp}
                    className="px-8 py-4 bg-green-500 text-black font-bold text-lg border-2 border-green-400 hover:bg-green-400 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ⚡ ENCRYPT IDENTITY ⚡
                  </motion.button>
                  <p className="mt-4 text-green-500/60 text-sm">
                    (Sign Up with Google - Demo Mode)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Terminal footer */}
          {currentQuestionIndex === -1 && (
            <div className="border-t border-green-500 px-6 py-3 text-green-500/60 text-sm">
              Press ENTER to begin or{' '}
              <button 
                onClick={handleStart}
                className="underline hover:text-green-500 transition-colors"
              >
                click here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheBlackBox;
