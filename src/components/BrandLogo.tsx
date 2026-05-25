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
  src = '/logo.png',
  alt = 'Seeakk',
  width = 150,
  height = 50,
  className = '',
  imgClassName = '',
}) => (
  <div
    className={`shrink-0 overflow-hidden ${className}`.trim()}
    style={{ width: `${width}px`, height: `${height}px` }}
  >
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-contain object-left ${imgClassName}`.trim()}
    />
  </div>
);

export default BrandLogo;
