/**
 * Red Phone Component
 * 
 * The AI's direct line to the player.
 * Triggers via commishService for:
 * - Low Grit (Predatory Loan Offer)
 * - High Winstreak (Warning)
 * - Random Paranoia Check
 * 
 * Features:
 * - Bottom-right floating button with aggressive pulsing
 * - Terminal-style chat window with character-by-character typing
 * - Heartbeat haptic feedback pattern
 * - Deal acceptance (Y/N)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverseerPlayerState } from '../types';
import { commishService, CommishLoan } from '../services/commishService';

interface RedPhoneProps {
    player: OverseerPlayerState;
    onAcceptLoan?: (loan: CommishLoan) => void;
    onDeclineLoan?: () => void;
}

export const RedPhone: React.FC<RedPhoneProps> = ({ 
    player, 
    onAcceptLoan,
    onDeclineLoan
}) => {
    const [isRinging, setIsRinging] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [displayedMessage, setDisplayedMessage] = useState('');
    const [showChoices, setShowChoices] = useState(false);
    const [triggerReason, setTriggerReason] = useState<'low_grit' | 'winstreak' | 'paranoia' | null>(null);
    const [offeredLoan, setOfferedLoan] = useState<CommishLoan | null>(null);
    const messageRef = useRef<string>('');
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Check if phone should ring
    useEffect(() => {
        const checkTrigger = () => {
            const { trigger, reason } = commishService.shouldTriggerRedPhone(player);
            
            if (trigger && !isRinging && !isOpen) {
                setIsRinging(true);
                setTriggerReason(reason);
                startHeartbeatVibration();
            }
        };

        const interval = setInterval(checkTrigger, 10000); // Check every 10 seconds
        checkTrigger(); // Initial check

        return () => clearInterval(interval);
    }, [player, isRinging, isOpen]);

    // Heartbeat vibration pattern
    const startHeartbeatVibration = () => {
        if (!navigator.vibrate) return;

        const vibrate = () => {
            navigator.vibrate([100, 50, 100, 1000]);
        };

        vibrate();
        vibrationIntervalRef.current = setInterval(vibrate, 1250);
    };

    const stopVibration = () => {
        if (vibrationIntervalRef.current) {
            clearInterval(vibrationIntervalRef.current);
            vibrationIntervalRef.current = null;
        }
        if (navigator.vibrate) {
            navigator.vibrate(0);
        }
    };

    // Answer the phone
    const handleAnswer = () => {
        setIsRinging(false);
        setIsOpen(true);
        stopVibration();

        // Generate message based on trigger reason
        let message = '';
        
        switch (triggerReason) {
            case 'low_grit':
                message = `I SEE YOU'RE STRUGGLING.\n\nYOUR GRIT BALANCE: ${player.grit}\n\nI CAN HELP.\n\nTAKE 500 GRIT NOW.\n\nREPAY 1000 BY SUNDAY OR HIT THE GULAG.\n\nWHAT DO YOU SAY?`;
                break;
            case 'winstreak':
                message = `IMPRESSIVE.\n\nFIVE WINS IN A ROW.\n\nBUT REMEMBER...\n\nTHE HOUSE ALWAYS WINS.\n\nDON'T GET COMFORTABLE.`;
                break;
            case 'paranoia':
                message = `RANDOM COMPLIANCE CHECK.\n\nYOUR BETTING ACTIVITY HAS BEEN FLAGGED.\n\nNOTHING TO WORRY ABOUT.\n\nYET.`;
                break;
            default:
                message = 'THE COMMISH IS WATCHING.';
        }

        messageRef.current = message;
        typeMessage(message);
    };

    // Type out message character by character
    const typeMessage = (message: string) => {
        let index = 0;
        setDisplayedMessage('');

        typingIntervalRef.current = setInterval(() => {
            if (index < message.length) {
                setDisplayedMessage(message.substring(0, index + 1));
                index++;
            } else {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                }
                // Show choices if it's a loan offer
                if (triggerReason === 'low_grit') {
                    setTimeout(() => setShowChoices(true), 500);
                }
            }
        }, 50); // 50ms per character
    };

    // Handle loan acceptance
    const handleAccept = () => {
        if (triggerReason === 'low_grit') {
            const loan = commishService.issueLoan(player);
            setOfferedLoan(loan);
            
            if (onAcceptLoan) {
                onAcceptLoan(loan);
            }

            // Show confirmation
            messageRef.current = `LOAN APPROVED.\n\n${loan.principal} GRIT DEPOSITED.\n\nREPAY ${loan.totalOwed} BY ${new Date(loan.dueDate).toLocaleDateString()}.\n\nDO NOT DEFAULT.`;
            setDisplayedMessage('');
            setShowChoices(false);
            typeMessage(messageRef.current);

            setTimeout(() => {
                handleClose();
            }, 5000);
        }
    };

    // Handle loan decline
    const handleDecline = () => {
        if (onDeclineLoan) {
            onDeclineLoan();
        }

        messageRef.current = 'SUIT YOURSELF.\n\nTHE OFFER STANDS.\n\nFOR NOW.';
        setDisplayedMessage('');
        setShowChoices(false);
        typeMessage(messageRef.current);

        setTimeout(() => {
            handleClose();
        }, 3000);
    };

    // Close the phone
    const handleClose = () => {
        setIsOpen(false);
        setDisplayedMessage('');
        setShowChoices(false);
        setTriggerReason(null);
        
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            stopVibration();
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
        };
    }, []);

    if (!isRinging && !isOpen) return null;

    return (
        <>
            {/* Floating Phone Button */}
            <AnimatePresence>
                {isRinging && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <motion.button
                            onClick={handleAnswer}
                            className="relative w-16 h-16 rounded-full bg-board-red shadow-2xl flex items-center justify-center"
                            animate={{
                                scale: [1, 1.2, 1],
                                boxShadow: [
                                    '0 0 20px rgba(255, 51, 51, 0.5)',
                                    '0 0 40px rgba(255, 51, 51, 0.8)',
                                    '0 0 20px rgba(255, 51, 51, 0.5)'
                                ]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {/* Phone Icon */}
                            <span className="text-3xl">📞</span>
                            
                            {/* Pulse Rings */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-board-red"
                                animate={{
                                    scale: [1, 2, 2],
                                    opacity: [0.8, 0, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                            />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Terminal Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-black border-4 border-board-red rounded-lg p-6 max-w-lg w-full mx-4"
                            style={{
                                boxShadow: '0 0 50px rgba(255, 51, 51, 0.5)'
                            }}
                        >
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-board-red/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-board-red animate-pulse" />
                                    <span className="font-board-grit text-board-red text-sm">
                                        THE_COMMISH.exe
                                    </span>
                                </div>
                                {!showChoices && (
                                    <button
                                        onClick={handleClose}
                                        className="text-board-red/60 hover:text-board-red text-xl"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            {/* Terminal Content */}
                            <div className="min-h-64 max-h-96 overflow-y-auto">
                                <pre className="font-board-grit text-board-red text-sm whitespace-pre-wrap leading-relaxed">
                                    {displayedMessage}
                                    <motion.span
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                    >
                                        ▊
                                    </motion.span>
                                </pre>
                            </div>

                            {/* Choice Buttons */}
                            <AnimatePresence>
                                {showChoices && triggerReason === 'low_grit' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="flex gap-4 mt-6"
                                    >
                                        <button
                                            onClick={handleAccept}
                                            className="flex-1 bg-board-red hover:bg-red-600 text-black font-board-header py-3 rounded font-bold transition-colors"
                                        >
                                            Y
                                        </button>
                                        <button
                                            onClick={handleDecline}
                                            className="flex-1 bg-board-muted-blue hover:bg-slate-600 text-board-off-white font-board-header py-3 rounded font-bold transition-colors"
                                        >
                                            N
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
