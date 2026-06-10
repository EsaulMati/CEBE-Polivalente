import { useState, useEffect } from 'react';

export function useAnimatedCounter(targetValue, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const end = parseInt(targetValue, 10);
    
    if (isNaN(end) || end < 0) {
      setCount(0);
      return;
    }

    let startValue = count;
    
    // Don't animate if the value hasn't changed or it's the first render with a zero target
    if (startValue === end) {
      setCount(end);
      return;
    }

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease out quad formula: f(t) = t * (2 - t)
      const easeProgress = progress * (2 - progress);
      const current = Math.round(startValue + easeProgress * (end - startValue));
      
      setCount(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration]);

  return count;
}
