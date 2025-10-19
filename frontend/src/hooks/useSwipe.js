// src/hooks/useSwipe.js
import { useEffect } from "react";

export const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let distX = 0;
    let distY = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const handleTouchMove = (e) => {
      if (!startX || !startY) return;

      const touch = e.touches[0];
      distX = touch.clientX - startX;
      distY = touch.clientY - startY;
    };

    const handleTouchEnd = () => {
      if (Math.abs(distX) > threshold && Math.abs(distY) < threshold) {
        if (distX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }

      // Reset
      startX = 0;
      startY = 0;
      distX = 0;
      distY = 0;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold]);
};
