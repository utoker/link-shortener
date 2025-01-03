'use client';

import { useUserContext } from '@app/context/UserContext';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface ConfettiEffectProps {
  duration?: number; // Duration for the confetti effect in milliseconds
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ duration = 3000 }) => {
  const [show, setShow] = useState(false);
  const { isConfettiActive } = useUserContext();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Update window size on resize
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize(); // Initialize size
    window.addEventListener('resize', updateWindowSize);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  useEffect(() => {
    if (isConfettiActive) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isConfettiActive, duration]);

  if (!show) return null;

  return (
    <Confetti
      gravity={0.1}
      initialVelocityX={2}
      initialVelocityY={2}
      numberOfPieces={600}
      opacity={1}
      recycle={false}
      run
      width={windowSize.width} // Dynamic width
      height={windowSize.height} // Dynamic height
      wind={0}
    />
  );
};

export default ConfettiEffect;
