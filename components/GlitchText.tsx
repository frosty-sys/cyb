import React, { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  as?: React.ElementType;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, as: Component = 'span', className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Random glitch effect
    const triggerGlitch = () => {
      let iterations = 0;
      clearInterval(interval);
      
      interval = setInterval(() => {
        setDisplayText(prev => 
          text
            .split('')
            .map((char, index) => {
              if (index < iterations) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iterations >= text.length) {
          clearInterval(interval);
        }

        iterations += 1 / 3;
      }, 30);
    };

    // Trigger initially
    triggerGlitch();

    // Trigger randomly every few seconds
    const randomTrigger = setInterval(() => {
      if (Math.random() > 0.9) triggerGlitch();
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(randomTrigger);
    };
  }, [text]);

  return (
    <Component className={`${className} relative inline-block`}>
      <span className="relative z-10">{displayText}</span>
      <span className="absolute top-0 left-0 -z-10 text-red-500 opacity-50 animate-pulse translate-x-[2px]">{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-blue-500 opacity-50 animate-pulse -translate-x-[2px]">{text}</span>
    </Component>
  );
};

export default GlitchText;