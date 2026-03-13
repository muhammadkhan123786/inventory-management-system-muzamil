
import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  trackColor?: string;
  progressColor?: string;
  height?: number;
  borderRadius?: number;

  showLabel?: boolean;
  labelPosition?: "inside" | "outside" | "none";
  labelText?: string;

  labelColor?: string;
  animationDuration?: number;
  striped?: boolean;
  animated?: boolean;
  className?: string;
  containerClassName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  trackColor = 'var(--secondary)',
  progressColor = 'var(--primary)',
  height = 8,
  borderRadius = 4,
  showLabel = false,
  labelPosition = 'outside',
  labelText,
  labelColor = 'var(--foreground)',
  animationDuration = 300,
  striped = false,
  animated = false,
  className = '',
  containerClassName = '',
}) => {
  // Ensure value is within bounds
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = (clampedValue / max) * 100;
  
  // Container styles
  const containerStyles: React.CSSProperties = {
    width: '100%',
    ...(labelPosition === 'outside' && showLabel ? { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px' 
    } : {}),
  };
  
  // Track styles
  const trackStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: `${height}px`,
    backgroundColor: trackColor,
    borderRadius: `${borderRadius}px`,
    overflow: 'hidden',
    flex: 1,
  };
  
  // Progress styles
  const progressStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: progressColor,
    borderRadius: `${borderRadius}px`,
    transition: `width ${animationDuration}ms ease-in-out`,
    ...(striped && {
      backgroundImage: `linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      )`,
      backgroundSize: `${height * 2}px ${height * 2}px`,
    }),
    ...(animated && striped && {
      animation: `progressStripes 1s linear infinite`,
    }),
  };
  
  // Label styles
  const labelStyles: React.CSSProperties = {
    color: labelColor,
    fontSize: '12px',
    fontWeight: 500,
    minWidth: labelPosition === 'outside' ? '40px' : 'auto',
    textAlign: labelPosition === 'outside' ? 'right' : 'center',
    ...(labelPosition === 'inside' && {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1,
    }),
  };
  
  // Determine label content
  const getLabelContent = () => {
    if (labelText) return labelText;
    return `${Math.round(percentage)}%`;
  };

  return (
    <div className={containerClassName} style={containerStyles}>
      {labelPosition === 'outside' && showLabel && (
        <span style={labelStyles}>{getLabelContent()}</span>
      )}
      
      <div className={className} style={trackStyles}>
        <div style={progressStyles}>
          {labelPosition === 'inside' && showLabel && (
            <span style={labelStyles}>{getLabelContent()}</span>
          )}
        </div>
      </div>
      
      {/* CSS Animation for stripes */}
      <style jsx>{`
        @keyframes progressStripes {
          from {
            background-position: ${height * 2}px 0;
          }
          to {
            background-position: 0 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;