import { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import fireworksAnimation from '../../assets/fireworks-animation.json';

const CelebrationEffect = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Play sound effect
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio could not be played:', e));

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
    >
      <div className="absolute inset-0">
        <Lottie 
          animationData={fireworksAnimation} 
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="bg-white bg-opacity-80 px-8 py-4 rounded-lg shadow-lg z-10">
        <h2 className="text-2xl font-bold text-center text-blue-600 animate-pulse">
          Great job! All contacts completed!
        </h2>
      </div>
    </div>
  );
};

export default CelebrationEffect;