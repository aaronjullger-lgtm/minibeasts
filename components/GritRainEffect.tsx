/**
 * Grit Rain Effect Component
 * 
 * High-velocity particle effect that plays when a user wins grit
 */

import React, { useEffect, useState } from 'react';

interface GritRainEffectProps {
    amount: number;
    onComplete?: () => void;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    velocity: number;
    delay: number;
}

export const GritRainEffect: React.FC<GritRainEffectProps> = ({ amount, onComplete }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // Generate particles
        const particleCount = Math.min(Math.floor(amount / 10), 50); // Max 50 particles
        const newParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100, // Random x position (0-100%)
                y: -10, // Start above viewport
                velocity: 1 + Math.random() * 2, // Random velocity (1-3)
                delay: Math.random() * 0.5 // Random delay (0-0.5s)
            });
        }

        setParticles(newParticles);

        // Clean up after animation completes
        const timeout = setTimeout(() => {
            setParticles([]);
            if (onComplete) {
                onComplete();
            }
        }, 2500);

        return () => clearTimeout(timeout);
    }, [amount, onComplete]);

    if (particles.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute text-2xl font-board-grit font-bold text-board-red animate-grit-fall"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        animationDuration: `${2 / particle.velocity}s`,
                        animationDelay: `${particle.delay}s`,
                        filter: 'drop-shadow(0 0 8px rgba(255, 51, 51, 0.8))'
                    }}
                >
                    💰
                </div>
            ))}
            
            {/* Center amount display */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-fade-in-out">
                <div className="bg-black/80 border-4 border-board-red rounded-lg px-8 py-4 shadow-2xl">
                    <div className="text-sm text-gray-400 uppercase tracking-wider text-center mb-1">
                        GRIT WON
                    </div>
                    <div className="text-5xl font-board-grit font-bold text-board-red text-center">
                        +{amount.toLocaleString()}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes grit-fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    70% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                @keyframes fade-in-out {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    20% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                    40% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    80% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                }
                
                .animate-grit-fall {
                    animation: grit-fall 2s ease-in forwards;
                }
                
                .animate-fade-in-out {
                    animation: fade-in-out 2s ease-in-out forwards;
                }
            `}</style>
        </div>
    );
};

/**
 * Hook to trigger grit rain effect
 */
export const useGritRain = () => {
    const [rainData, setRainData] = useState<{ amount: number; show: boolean }>({
        amount: 0,
        show: false
    });

    const triggerRain = (amount: number) => {
        setRainData({ amount, show: true });
    };

    const onComplete = () => {
        setRainData(prev => ({ ...prev, show: false }));
    };

    return {
        rainData,
        triggerRain,
        onComplete,
        GritRainComponent: rainData.show ? (
            <GritRainEffect amount={rainData.amount} onComplete={onComplete} />
        ) : null
    };
};
