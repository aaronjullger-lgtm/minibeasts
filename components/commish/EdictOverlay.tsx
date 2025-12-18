/**
 * Edict Overlay Component
 * 
 * When the app opens, The Commish issues an "Executive Order" for the week.
 * This modal overlay displays the weekly protocol/rule that players must acknowledge.
 * 
 * Visuals: Sleek modal that looks like a legal summons or system update.
 * Style: Blur background, board-navy surface, white monospace text.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface EdictOverlayProps {
    isOpen: boolean;
    onAcknowledge: () => void;
    weekNumber: number;
    rule: string;
    description: string;
}

export const EdictOverlay: React.FC<EdictOverlayProps> = ({
    isOpen,
    onAcknowledge,
    weekNumber,
    rule,
    description
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
                    onClick={onAcknowledge}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-board-navy border-2 border-board-red rounded-lg shadow-2xl max-w-lg mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Red Bar */}
                        <div className="h-2 bg-board-red" />

                        {/* Content */}
                        <div className="p-8">
                            {/* Official Header */}
                            <div className="text-center mb-6">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-board-off-white/60 text-xs font-board-grit tracking-widest mb-2"
                                >
                                    OFFICIAL NOTICE
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-board-header font-bold text-board-red tracking-tight"
                                >
                                    WEEK {weekNumber} PROTOCOL
                                </motion.h1>
                            </div>

                            {/* Divider */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="h-px bg-board-red/30 mb-6"
                            />

                            {/* The Rule */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mb-6"
                            >
                                <div className="text-board-off-white/50 text-xs font-board-grit mb-2 tracking-wider">
                                    EXECUTIVE ORDER:
                                </div>
                                <div className="text-board-off-white text-xl font-board-header font-bold mb-3 leading-tight">
                                    {rule}
                                </div>
                                <div className="text-board-off-white/70 text-sm font-board-grit leading-relaxed">
                                    {description}
                                </div>
                            </motion.div>

                            {/* Warning Box */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-board-red/10 border border-board-red/30 rounded p-4 mb-6"
                            >
                                <p className="text-board-red text-xs font-board-grit text-center leading-relaxed">
                                    COMPLIANCE IS MANDATORY.<br />
                                    VIOLATIONS WILL BE LOGGED.
                                </p>
                            </motion.div>

                            {/* Action Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onAcknowledge}
                                className="w-full bg-board-red hover:bg-board-red/90 text-board-off-white font-board-header font-bold py-3 rounded transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                ACKNOWLEDGE
                            </motion.button>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-center mt-4 text-board-off-white/40 text-xs font-board-grit"
                            >
                                THE COMMISH IS ALWAYS WATCHING
                            </motion.div>
                        </div>

                        {/* Bottom Red Bar */}
                        <div className="h-1 bg-board-red/50" />

                        {/* Subtle Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-board-red/5 to-transparent pointer-events-none" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
