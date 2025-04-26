import React, { useEffect, useRef, useState } from 'react';

interface Logo {
  id: string;
  ref: React.RefObject<HTMLDivElement>;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
  logoClass: string;
  src: string;
  alt: string;
}

interface FloatingSchoolLogosProps {
  logos: { 
    src: string; 
    alt: string;
    logoClass: string;
  }[];
}

const FloatingSchoolLogos: React.FC<FloatingSchoolLogosProps> = ({ logos }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const [floatingLogos, setFloatingLogos] = useState<Logo[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Initialize logos with random positions and velocities
  useEffect(() => {
    if (containerRef.current && logos.length > 0) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width || 300;
      const containerHeight = containerRect.height || 200;
      setContainerSize({ width: containerWidth, height: containerHeight });
      
      const initialLogos = logos.map((logo, index) => {
        // Create refs for each logo
        const logoRef = React.createRef<HTMLDivElement>();
        
        // Random starting position within container bounds
        const x = Math.random() * (containerWidth - 80);
        const y = Math.random() * (containerHeight - 80);
        
        // Random velocity with slight bias for natural looking flock behavior
        // The logos will tend to move together based on these velocities
        const baseVx = Math.random() * 1.0 - 0.5; // -0.5 to 0.5 (slower)
        const baseVy = Math.random() * 1.0 - 0.5; // -0.5 to 0.5 (slower)
        
        // Add slight variations to create more realistic flock movement
        const vx = baseVx + (Math.random() * 0.2 - 0.1); // smaller variation
        const vy = baseVy + (Math.random() * 0.2 - 0.1); // smaller variation
        
        return {
          id: `logo-${index}`,
          ref: logoRef,
          x,
          y,
          vx,
          vy,
          rotation: Math.random() * 10 - 5, // -5 to 5 degrees
          scale: 0.9 + Math.random() * 0.2, // 0.9 to 1.1
          logoClass: logo.logoClass,
          src: logo.src,
          alt: logo.alt
        };
      });
      
      setFloatingLogos(initialLogos);
    }
  }, [logos]);
  
  // Main animation loop
  useEffect(() => {
    if (!containerRef.current || floatingLogos.length === 0) return;
    
    const updateLogoPositions = () => {
      setFloatingLogos(prevLogos => {
        return prevLogos.map(logo => {
          // Apply velocity
          let newX = logo.x + logo.vx;
          let newY = logo.y + logo.vy;
          let newVx = logo.vx;
          let newVy = logo.vy;
          
          // Check for wall collisions and bounce with damping
          const damping = 0.85; // Reduces velocity slightly on bounce
          
          // Right and left walls
          if (newX > containerSize.width - 60) {
            newX = containerSize.width - 60;
            newVx = -Math.abs(logo.vx) * damping;
          } else if (newX < 10) {
            newX = 10;
            newVx = Math.abs(logo.vx) * damping;
          }
          
          // Bottom and top walls
          if (newY > containerSize.height - 60) {
            newY = containerSize.height - 60;
            newVy = -Math.abs(logo.vy) * damping;
          } else if (newY < 10) {
            newY = 10;
            newVy = Math.abs(logo.vy) * damping;
          }
          
          // Slight acceleration effect to create more natural movement
          const accelerationFactor = 0.01;
          const maxSpeed = 0.8;
          
          // Randomly adjust velocity slightly for more natural movement
          if (Math.random() < 0.03) {
            newVx += (Math.random() * 0.2 - 0.1);
            newVy += (Math.random() * 0.2 - 0.1);
          }
          
          // Limit maximum speed
          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed;
            newVy = (newVy / speed) * maxSpeed;
          }
          
          // Adjust rotation based on movement direction for more natural look
          const newRotation = (newVx > 0 ? 1 : -1) * Math.min(Math.abs(newVx * 3), 5);
          
          // Scale based on vertical position (closer to edges = smaller)
          let newScale = logo.scale;
          if (Math.random() < 0.02) {
            newScale = 0.9 + Math.random() * 0.2;
          }
          
          return {
            ...logo,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: newRotation,
            scale: newScale
          };
        });
      });
      
      requestRef.current = requestAnimationFrame(updateLogoPositions);
    };
    
    requestRef.current = requestAnimationFrame(updateLogoPositions);
    
    // Cleanup animation frame on unmount
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [containerSize, floatingLogos.length]);
  
  // Update container size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: containerRect.width || 300,
          height: containerRect.height || 200
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div ref={containerRef} className="logo-animation-container">
      {floatingLogos.map(logo => (
        <div
          key={logo.id}
          ref={logo.ref}
          className={`floating-logo ${logo.logoClass}`}
          style={{
            transform: `translate(${logo.x}px, ${logo.y}px) rotate(${logo.rotation}deg) scale(${logo.scale})`,
          }}
        >
          <img src={logo.src} alt={logo.alt} />
        </div>
      ))}
    </div>
  );
};

export default FloatingSchoolLogos;