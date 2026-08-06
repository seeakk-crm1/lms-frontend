import React from 'react';

type BrandLogoProps = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
};

const BrandLogo: React.FC<BrandLogoProps> = ({
  src = '/Seeakknewlogo.png',
  alt = 'Seeakk',
  width = 160,
  height = 44,
  className = '',
  imgClassName = '',
}) => (
  <div
    className={`shrink-0 overflow-hidden flex items-center ${className}`.trim()}
    style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
  >
    <img
      src={src}
      alt={alt}
      className={`h-full w-auto max-w-full object-contain object-left ${imgClassName}`.trim()}
    />
  </div>
);

export default BrandLogo;
