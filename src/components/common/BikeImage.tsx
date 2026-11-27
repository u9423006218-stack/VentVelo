import React from 'react';
import { useBikeImageSrc } from '../../utils/bikeImageStore';

interface BikeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

export const BikeImage: React.FC<BikeImageProps> = ({
  src,
  alt = '',
  className = '',
  ...rest
}) => {
  const resolvedSrc = useBikeImageSrc(src);

  if (!resolvedSrc) {
    return (
      <div
        className={`bg-white flex items-center justify-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt} className={className} {...rest} />;
};
