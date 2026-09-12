import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(pointer: coarse)';
const MOBILE_MAX_WIDTH = 768;

function hasCoarsePointer(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_QUERY).matches;
}

function detect(): boolean {
  if (typeof window === 'undefined') return false;
  return hasCoarsePointer() || window.innerWidth <= MOBILE_MAX_WIDTH;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(detect);

  useEffect(() => {
    const update = () => setIsMobile(hasCoarsePointer() || window.innerWidth <= MOBILE_MAX_WIDTH);
    update();
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia(MOBILE_QUERY) : null;
    mq?.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mq?.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return isMobile;
}
