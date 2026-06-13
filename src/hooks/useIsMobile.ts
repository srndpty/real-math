import { useMediaQuery } from './useMediaQuery';

export const useIsMobile = (): boolean => useMediaQuery('(max-width: 1023px)');
