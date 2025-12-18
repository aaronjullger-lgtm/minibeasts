/**
 * Commish Core Component
 * 
 * The visual representation of The Commish AI.
 * Appears in the Locker Room or Gulag with:
 * - Sentient Eye/Waveform animation using framer-motion
 * - Color states: board-red (Angry/Active) vs board-muted-blue (Dormant)
 * - Ticker showing AI thought process
 * - System Diagnosis modal showing League Global Volatility
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { commishService } from '../services/commishService';

interface CommishCoreProps {
    isActive?: boolean;
    location?: 'locker_room' | 'gulag';
}

export const CommishCore: React.FC<CommishCoreProps> = ({ 
    isActive = true,
    location = 'locker_room'
}) => {
    const [showDiagnostic, setShowDiagnostic] = useState(false);
    const [thoughts, setThoughts] = useState<string[]>([]);
    const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
    const state = commishService.getState();

    // Determine color based on active state
    const coreColor = isActive ? 'board-red' : 'board-muted-blue';
    const glowColor = isActive ? 'rgba(255, 51, 51, 0.5)' : 'rgba(30, 41, 59, 0.5)';

    useEffect(() => {
        // Generate initial thoughts
        setThoughts(commishService.generateThoughtProcess());
    }, []);

    useEffect(() => {
        // Rotate through thoughts every 2 seconds
        const interval = setInterval(() => {
            setCurrentThoughtIndex(prev => (prev + 1) % thoughts.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [thoughts.length]);

    // Waveform animation variants
    const waveformVariants = {
        dormant: {
            scaleY: [1, 1.1, 1],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        active: {
            scaleY: [1, 1.3, 0.8, 1.2, 1],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    // Eye blink animation
    const eyeVariants = {
        dormant: {
            scaleY: [1, 0.1, 1],
            transition: {
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 4
            }
        },
        active: {
            scaleY: [1, 0.1, 1],
            transition: {
                duration: 0.2,
                repeat: Infinity,
                repeatDelay: 2
            }
        }
    };

    return (
        <div className="relative">
            {/* The Core - Sentient Eye */}
            <motion.div
                className="relative flex items-center justify-center cursor-pointer"
                onClick={() => setShowDiagnostic(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Outer Glow */}
                <motion.div
                    className={`absolute w-32 h-32 rounded-full blur-xl`}
                    style={{ backgroundColor: glowColor }}
                    animate={{
                        scale: isActive ? [1, 1.2, 1] : [1, 1.05, 1],
                        opacity: isActive ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: isActive ? 2 : 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Eye Container */}
                <div className={`relative w-24 h-24 rounded-full border-4 border-${coreColor} bg-board-navy flex items-center justify-center overflow-hidden`}
                    style={{ boxShadow: `0 0 30px ${glowColor}` }}>
                    
                    {/* Iris */}
                    <motion.div
                        className={`w-12 h-12 rounded-full bg-${coreColor}`}
                        variants={eyeVariants}
                        animate={isActive ? 'active' : 'dormant'}
                    >
                        {/* Pupil */}
                        <motion.div
                            className="w-6 h-6 rounded-full bg-board-navy absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            animate={{
                                x: isActive ? [-2, 2, -2] : [0, 0],
                                y: isActive ? [-1, 1, -1] : [0, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.div>

                    {/* Waveform Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 px-2">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={`w-1 bg-${coreColor} opacity-30`}
                                style={{ height: `${20 + Math.random() * 40}%` }}
                                variants={waveformVariants}
                                animate={isActive ? 'active' : 'dormant'}
                                transition={{
                                    delay: i * 0.1
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Thought Process Ticker */}
            <div className="mt-4 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentThoughtIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className={`text-center font-board-grit text-xs text-${coreColor} tracking-wider`}
                    >
                        {thoughts[currentThoughtIndex] || 'STANDBY...'}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* System Diagnosis Modal */}
            <AnimatePresence>
                {showDiagnostic && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowDiagnostic(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-board-navy border-2 border-board-red rounded-lg p-6 max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-board-header text-board-red">
                                    SYSTEM DIAGNOSIS
                                </h2>
                                <button
                                    onClick={() => setShowDiagnostic(false)}
                                    className="text-board-off-white/60 hover:text-board-off-white text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Diagnostic Info */}
                            <div className="space-y-4 font-board-grit text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-board-off-white/70">STATUS:</span>
                                    <span className={`text-${coreColor} font-bold`}>
                                        {isActive ? 'ACTIVE' : 'DORMANT'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-board-off-white/70">VOLATILITY:</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-board-muted-blue rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-board-red"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${state.volatility}%` }}
                                                transition={{ duration: 1 }}
                                            />
                                        </div>
                                        <span className="text-board-red">{state.volatility}%</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-board-off-white/70">ACTIVE LOANS:</span>
                                    <span className="text-board-red font-bold">
                                        {state.loans.filter(l => !l.isPaid && !l.isDefaulted).length}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-board-off-white/70">LAST AUDIT:</span>
                                    <span className="text-board-off-white">
                                        {new Date(state.lastAuditTime).toLocaleTimeString()}
                                    </span>
                                </div>

                                {/* Warning Messages */}
                                <div className="mt-6 p-3 bg-board-red/10 border border-board-red rounded">
                                    <p className="text-board-red text-xs text-center">
                                        THE COMMISH IS ALWAYS WATCHING
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowDiagnostic(false)}
                                className="w-full mt-6 bg-board-muted-blue hover:bg-board-red text-board-off-white font-board-header py-2 rounded transition-colors"
                            >
                                ACKNOWLEDGE
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
