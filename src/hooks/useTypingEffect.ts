import { useState, useEffect } from 'react';

export const useTypingEffect = (strings: string[], speed: number = 60, backSpeed: number = 35, backDelay: number = 3000) => {
  const [displayText, setDisplayText] = useState('');
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const currentString = strings[stringIndex];
    const isComplete = charIndex === currentString.length;

    if (!isDeleting && isComplete) {
      // Pause before deleting
      timeout = setTimeout(() => setIsDeleting(true), backDelay);
    } else if (isDeleting && charIndex === 0) {
      // Move to next string
      setIsDeleting(false);
      setStringIndex((prev) => (prev + 1) % strings.length);
    } else {
      // Typing or deleting
      const nextCharIndex = isDeleting ? charIndex - 1 : charIndex + 1;
      timeout = setTimeout(() => {
        setDisplayText(currentString.substring(0, nextCharIndex));
        setCharIndex(nextCharIndex);
      }, isDeleting ? backSpeed : speed);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, stringIndex, isDeleting, strings, speed, backSpeed, backDelay]);

  return displayText;
};
