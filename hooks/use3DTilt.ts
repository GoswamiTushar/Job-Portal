import { useEffect, useRef } from 'react';

interface TiltOptions {
    maxTilt?: number;
    perspective?: number;
    scale?: number;
    easing?: string;
    speed?: number;
}

export function use3DTilt<T extends HTMLElement>(options: TiltOptions = {}) {
    const ref = useRef<T>(null);
    const {
        maxTilt = 8,
        perspective = 1000,
        scale = 1.02,
        speed = 300,
        easing = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
    } = options;

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Respect users who prefer reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;

            const rotateX = -(percentY * maxTilt);
            const rotateY = percentX * maxTilt;

            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                element.style.transition = `transform ${speed / 4}ms ${easing}`;
                element.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
            });
        };

        const handleMouseLeave = () => {
            cancelAnimationFrame(animationFrameId);
            element.style.transition = `transform ${speed}ms ${easing}`;
            element.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(animationFrameId);
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [maxTilt, perspective, scale, speed, easing]);

    return ref;
}

export default use3DTilt;
