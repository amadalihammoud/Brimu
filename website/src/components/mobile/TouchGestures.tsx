'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';

// Hook para detectar gestos de swipe
export const useSwipeGestures = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) => {
  return {
    onPanEnd: (event: any, info: PanInfo) => {
      const { offset, velocity } = info;
      
      // Verificar se o movimento foi significativo
      if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
        if (offset.x > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (offset.x < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      
      if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 500) {
        if (offset.y > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (offset.y < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  };
};

// Componente de Card deslizável
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
  className?: string;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = ''
}: SwipeableCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const swipeGestures = useSwipeGestures(onSwipeLeft, onSwipeRight);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        {/* Right Action (revealed when swiping left) */}
        {rightAction && (
          <div className="flex items-center justify-center w-full bg-red-500 text-white">
            <div className="text-center">
              {rightAction.icon}
              <p className="text-sm font-medium mt-1">{rightAction.label}</p>
            </div>
          </div>
        )}
        
        {/* Left Action (revealed when swiping right) */}
        {leftAction && (
          <div className="flex items-center justify-center w-full bg-green-500 text-white">
            <div className="text-center">
              {leftAction.icon}
              <p className="text-sm font-medium mt-1">{leftAction.label}</p>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <motion.div
        className="relative bg-white z-10"
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(event, info) => {
          setIsDragging(false);
          setSwipeDirection(null);
          swipeGestures.onPanEnd(event, info);
        }}
        onDrag={(event, info) => {
          if (info.offset.x > 20) {
            setSwipeDirection('right');
          } else if (info.offset.x < -20) {
            setSwipeDirection('left');
          } else {
            setSwipeDirection(null);
          }
        }}
        animate={{
          rotate: isDragging ? (swipeDirection === 'left' ? -2 : swipeDirection === 'right' ? 2 : 0) : 0,
          scale: isDragging ? 0.98 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Componente de Pull to Refresh
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80 
}: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  return (
    <div ref={containerRef} className="relative h-full overflow-hidden">
      {/* Pull Indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center bg-green-50 text-green-600"
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: Math.min(pullDistance, threshold) + 20,
              opacity: 1 
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isRefreshing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Atualizando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.svg 
                  className="w-5 h-5"
                  animate={{ rotate: pullDistance > threshold ? 180 : 0 }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </motion.svg>
                <span className="text-sm font-medium">
                  {pullDistance > threshold ? 'Solte para atualizar' : 'Puxe para atualizar'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        className="h-full"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={() => {
          if (containerRef.current?.scrollTop === 0) {
            setIsPulling(true);
          }
        }}
        onDrag={(event, info) => {
          if (isPulling && info.offset.y > 0) {
            setPullDistance(info.offset.y);
          }
        }}
        onDragEnd={(event, info) => {
          if (isPulling) {
            if (pullDistance > threshold) {
              handleRefresh();
            } else {
              setIsPulling(false);
              setPullDistance(0);
            }
          }
        }}
        animate={{
          y: isPulling && !isRefreshing ? Math.min(pullDistance * 0.5, threshold * 0.5) : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Componente de Carousel/Slider móvel
interface MobileCarouselProps {
  children: React.ReactNode[];
  showDots?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  className?: string;
}

export const MobileCarousel = ({
  children,
  showDots = true,
  autoplay = false,
  autoplayInterval = 3000,
  className = ''
}: MobileCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % children.length);
      }, autoplayInterval);

      return () => clearInterval(interval);
    }
  }, [autoplay, autoplayInterval, children.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % children.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Slides */}
      <motion.div
        className="flex"
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onPanStart={(event, info) => {
          setDragStartX(info.point.x);
        }}
        onPanEnd={(event, info) => {
          const deltaX = info.point.x - dragStartX;
          const threshold = 50;

          if (deltaX > threshold) {
            goToPrev();
          } else if (deltaX < -threshold) {
            goToNext();
          }
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </motion.div>

      {/* Navigation Dots */}
      {showDots && children.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {children.map((_, index) => (
            <motion.button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              onClick={() => goToSlide(index)}
              whileTap={{ scale: 0.8 }}
              animate={{
                scale: index === currentIndex ? 1.2 : 1,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Hook para detecção de long press
export const useLongPress = (
  onLongPress: () => void,
  delay = 500
) => {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const start = () => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
    }, delay);
  };

  const stop = () => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    isPressed
  };
};

// Componente de Float Action Button
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FloatingActionButton = ({
  onClick,
  icon,
  className = '',
  size = 'md'
}: FloatingActionButtonProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  return (
    <motion.button
      className={`fixed bottom-20 right-4 ${sizeClasses[size]} bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 ${className}`}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {icon}
    </motion.button>
  );
};