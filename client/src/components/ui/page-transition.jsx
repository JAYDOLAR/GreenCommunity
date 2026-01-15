"use client";

import { useState, useEffect, useRef } from "react";

/**
 * PageTransition - Wraps page content to provide smooth loading transitions
 * Prevents skeleton "blinking" by managing fade transitions between loading and loaded states
 * 
 * @param {boolean} isLoading - Whether data is still loading
 * @param {React.ReactNode} skeleton - Skeleton component to show while loading
 * @param {React.ReactNode} children - Actual page content to show when loaded
 * @param {number} minLoadingTime - Minimum time (ms) to show skeleton to prevent flash (default: 300)
 */
export function PageTransition({
  isLoading,
  skeleton,
  children,
  minLoadingTime = 300,
  className = "",
}) {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const loadStartTime = useRef(Date.now());
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (isLoading) {
      // Reset when loading starts
      loadStartTime.current = Date.now();
      hasLoaded.current = false;
      setShowSkeleton(true);
      setIsExiting(false);
    } else if (!hasLoaded.current) {
      // Loading finished - calculate remaining time for minimum display
      hasLoaded.current = true;
      const elapsed = Date.now() - loadStartTime.current;
      const remaining = Math.max(0, minLoadingTime - elapsed);

      // Start exit animation after minimum time
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, remaining);

      // Hide skeleton after exit animation completes
      const hideTimer = setTimeout(() => {
        setShowSkeleton(false);
      }, remaining + 200); // 200ms for exit animation

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isLoading, minLoadingTime]);

  return (
    <div className={`loading-wrapper ${className}`}>
      {showSkeleton ? (
        <div
          className={`skeleton-container ${isExiting ? "skeleton-exit" : ""}`}
        >
          {skeleton}
        </div>
      ) : (
        <div className="page-content-enter">{children}</div>
      )}
    </div>
  );
}

/**
 * SimpleTransition - A simpler version for basic fade transitions
 * Use when you don't need skeleton support, just content fade-in
 */
export function SimpleTransition({ isLoading, children, className = "" }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <div className={`${showContent ? "page-content-enter" : "opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

export default PageTransition;
