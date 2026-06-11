'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Tilt3DProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;           // 1-30, default 15
    glare?: boolean;              // show glare effect
    perspective?: number;         // CSS perspective, default 800
    scale?: number;               // hover scale, default 1.02
    borderGlow?: boolean;         // animated border on hover
}

export default function Tilt3D({
    children,
    className = '',
    intensity = 15,
    glare = true,
    perspective = 800,
    scale = 1.02,
    borderGlow = false,
}: Tilt3DProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 1024);
    }, []);

    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const rotateX = useSpring(
        useTransform(mouseY, [0, 1], [intensity, -intensity]),
        { stiffness: 200, damping: 30 }
    );
    const rotateY = useSpring(
        useTransform(mouseX, [0, 1], [-intensity, intensity]),
        { stiffness: 200, damping: 30 }
    );

    const glareX = useTransform(mouseX, [0, 1], [0, 100]);
    const glareY = useTransform(mouseY, [0, 1], [0, 100]);

    // IMPORTANT: These must be at top level — never inside JSX or conditions.
    // Moving them here fixes the "Rendered fewer hooks than expected" crash on mobile.
    const glareBackground = useTransform(
        [glareX, glareY],
        ([x, y]: number[]) =>
            `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.08), transparent 60%)`
    );
    const borderGlowBackground = useTransform(
        [glareX, glareY],
        ([x, y]: number[]) =>
            `radial-gradient(circle at ${x}% ${y}%, rgba(139,92,246,0.4), rgba(6,182,212,0.15) 40%, transparent 70%)`
    );

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    // On mobile: skip all 3D/mouse tracking — massive layout thrashing on touch devices
    if (isMobile) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div style={{ perspective }} className={className}>
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                }}
                animate={{ scale: isHovered ? scale : 1 }}
                transition={{ scale: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                className="relative w-full h-full"
            >
                {/* Content */}
                <div style={{ transform: 'translateZ(0px)' }} className="relative z-10 w-full h-full">
                    {children}
                </div>

                {/* Glare overlay */}
                {glare && (
                    <motion.div
                        className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
                        style={{
                            background: glareBackground,
                            opacity: isHovered ? 1 : 0,
                        }}
                    />
                )}

                {/* Border glow */}
                {borderGlow && (
                    <motion.div
                        className="pointer-events-none absolute inset-[-1px] rounded-[inherit] z-0"
                        style={{
                            background: borderGlowBackground,
                            padding: 1,
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'xor' as React.CSSProperties['maskComposite'],
                            WebkitMaskComposite: 'xor' as React.CSSProperties['WebkitMaskComposite'],
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.4s ease',
                        }}
                    />
                )}
            </motion.div>
        </div>
    );
}
