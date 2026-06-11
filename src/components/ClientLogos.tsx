'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import ScrollReveal from './ScrollReveal';
import { ScrollTextReveal } from './ScrollEffects';

// Real client logos — images saved in /public/logos/
const clientLogos = [
    { name: 'Konoz Immobilier', src: '/logos/konoz-immobilier.png' },
    { name: 'Creme Solaire', src: '/logos/creme-solaire.png' },
    { name: 'Espace Tourisme', src: '/logos/espace-tourisme.png' },
    { name: 'Iso Board', src: '/logos/iso-board.png' },
    { name: 'Les Jardins Atlas', src: '/logos/les-jardins-atlas.png' },
    { name: 'Riad Kali', src: '/logos/riad-kali.png' },
    { name: 'Tatto Matto', src: '/logos/tatto-matto.png' },
    { name: 'Zenith Jate', src: '/logos/zenith-jate.png' },
];

// Triple the logos for seamless infinite loop
const allLogos = [...clientLogos, ...clientLogos, ...clientLogos];

export default function ClientLogos({ locale = 'fr' }: { locale?: string } = {}) {
    const titleText = locale === 'ar' ? 'دليل' : locale === 'en' ? 'PROOF OF OUR' : 'LA PREUVE DE NOTRE';
    const titleHighlight = locale === 'ar' ? 'نجاحنا' : locale === 'en' ? 'SUCCESS' : 'SUCCÈS';
    const subtitleText = locale === 'ar' ? 'نجد رضا كبيراً في التعاون مع عملاء متنوعين ومخلصين، مما يشهد على خبرتنا في تصميم المواقع الإلكترونية في المغرب.' : locale === 'en' ? 'We take great satisfaction in collaborating with a diverse and loyal clientele, demonstrating our expertise in web design in Morocco.' : 'Nous trouvons une grande satisfaction à collaborer avec une clientèle variée et fidèle, témoignant de notre expertise en conception de sites web au Maroc.';
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <section ref={ref} className="relative section-padding bg-navy-950 overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-purple/15 to-transparent" />

            <div className="relative z-10 max-w-6xl mx-auto px-8 lg:px-12">
                {/* Title */}
                <ScrollReveal blur={true} perspective={true}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center mb-6"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-white font-heading tracking-tight">
                            {titleText} <span className="gradient-text">{titleHighlight}</span>
                        </h2>
                    </motion.div>
                </ScrollReveal>

                <ScrollTextReveal
                    text={subtitleText}
                    className="text-gray-400 text-center text-sm lg:text-base leading-relaxed max-w-2xl mx-auto mb-14"
                />
            </div>

            {/* Logo Marquee - Row 1 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative mb-8"
            >
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-r from-navy-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-l from-navy-950 to-transparent z-10 pointer-events-none" />

                {/* Scrolling track - Row 1 */}
                <div className="client-logos-marquee">
                    <div className="client-logos-track">
                        {allLogos.slice(0, allLogos.length / 2 + 5).map((logo, i) => (
                            <div
                                key={`r1-${logo.name}-${i}`}
                                className="flex-shrink-0 px-8 lg:px-12 flex items-center justify-center"
                            >
                                <Image
                                    src={logo.src}
                                    alt={logo.name}
                                    width={120}
                                    height={50}
                                    className="h-10 w-auto object-contain opacity-40 hover:opacity-90 transition-opacity duration-500 brightness-0 invert"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Logo Marquee - Row 2 (reverse direction) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.6 }}
                className="relative"
            >
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-r from-navy-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-l from-navy-950 to-transparent z-10 pointer-events-none" />

                {/* Scrolling track - Row 2 (reverse) */}
                <div className="client-logos-marquee">
                    <div className="client-logos-track-reverse">
                        {allLogos.slice(allLogos.length / 2 - 5).map((logo, i) => (
                            <div
                                key={`r2-${logo.name}-${i}`}
                                className="flex-shrink-0 px-8 lg:px-12 flex items-center justify-center"
                            >
                                <Image
                                    src={logo.src}
                                    alt={logo.name}
                                    width={120}
                                    height={50}
                                    className="h-10 w-auto object-contain opacity-40 hover:opacity-90 transition-opacity duration-500 brightness-0 invert"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/15 to-transparent" />
        </section>
    );
}
