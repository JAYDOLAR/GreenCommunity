'use client';

import { useEffect, useState } from 'react';
import { generateFloatingParticles } from '@/config/uiConfig';

const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = generateFloatingParticles();
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="floating-leaf absolute opacity-5 select-none"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.animationDelay}s`,
            zIndex: 1,
          }}
        >
          {particle.icon}
        </div>
      ))}
    </div>
  );
};

export default FloatingParticles;