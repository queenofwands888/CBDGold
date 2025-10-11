import React, { useMemo } from 'react';
import feather from 'feather-icons';
import { logger } from '../utils/logger';

type FeatherIconProps = {
  icon: string;
  className?: string;
  strokeWidth?: number;
};

// Lightweight wrapper around feather-icons auto replacement
const FeatherIcon: React.FC<FeatherIconProps> = ({ icon, className = 'w-4 h-4', strokeWidth = 2 }) => {
  const svgMarkup = useMemo(() => {
    const definition = feather.icons[icon];
    if (!definition) {
      logger.warn(`Feather icon "${icon}" is not available`);
      return null;
    }
    return definition.toSvg({ class: className, 'stroke-width': String(strokeWidth), 'aria-hidden': 'true', focusable: 'false' });
  }, [className, icon, strokeWidth]);

  if (!svgMarkup) {
    return null;
  }

  return (
    <span
      className={className}
      aria-hidden="true"
      role="img"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
};

export default FeatherIcon;
