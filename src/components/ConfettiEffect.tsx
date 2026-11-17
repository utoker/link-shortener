'use client';

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useUserContext } from '../app/context/UserContext';

// Shown while the user context says so; triggerConfetti there switches it
// off again after three seconds.
const ConfettiEffect: React.FC = () => {
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

  if (!isConfettiActive) return null;

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
