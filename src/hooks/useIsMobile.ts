import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 1023px)';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener('change', onChange);
    setIsMobile(mediaQuery.matches);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return isMobile;
};
