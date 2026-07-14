import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';

type LeadAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
  textClassName?: string;
  localPreviewUrl?: string | null;
};

const avatarColors = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
];

const LeadAvatar: React.FC<LeadAvatarProps> = ({
  name,
  imageUrl,
  className = 'h-11 w-11',
  textClassName = 'text-sm',
  localPreviewUrl,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const initial = (name || 'Lead').trim().charAt(0).toUpperCase() || 'L';
  const color = useMemo(() => {
    const code = initial.charCodeAt(0) || 0;
    return avatarColors[code % avatarColors.length];
  }, [initial]);

  useEffect(() => {
    if (!imageUrl || localPreviewUrl) {
      setObjectUrl(null);
      setFailed(false);
      return undefined;
    }

    let active = true;
    let nextUrl: string | null = null;
    setFailed(false);

    api.get(imageUrl, { responseType: 'blob' })
      .then((response) => {
        if (!active) return;
        nextUrl = URL.createObjectURL(response.data);
        setObjectUrl(nextUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [imageUrl, localPreviewUrl]);

  const src = localPreviewUrl || (!failed ? objectUrl : null);

  return (
    <div className={`${className} ${src ? 'bg-white' : color} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 shadow-sm ring-1 ring-gray-100`}>
      {src ? (
        <img
          src={src}
          alt={name ? `${name} profile` : 'Lead profile'}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={`${textClassName} font-black uppercase text-white`}>{initial}</span>
      )}
    </div>
  );
};

export default LeadAvatar;

