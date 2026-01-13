import { useMediaQuery } from 'react-responsive';

type Breakpoint = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const BREAKPOINTS: Record<Breakpoint, number> = {
  xxs: 479,   // max-width for xxs
  xs: 599,    // max-width for xs
  sm: 767,
  md: 991,
  lg: 1199,
  xl: Infinity,
};

export function useScreenSize(breakpoint: Breakpoint): boolean {
  const maxWidth = BREAKPOINTS[breakpoint];
  return useMediaQuery({ maxWidth });
}
