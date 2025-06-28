import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export const BeefIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
    <path d="M12 5c-1.488 0-2.827.695-3.667 1.8A4.002 4.002 0 006 10.5V12h12v-1.5a4.002 4.002 0 00-2.333-3.7A4.002 4.002 0 0012 5z" />
    <path d="M8 9h.01" />
    <path d="M16 9h.01" />
  </svg>
);

export const PorkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15.14 13.3a1 1 0 0 0-1.28 1.54 9.17 9.17 0 0 1-2.09 3.06 9.17 9.17 0 0 1-2.09 1.1Z" />
    <path d="M10.13 14.86a4.8 4.8 0 0 0-3.21-1.78c-2.83.3-5.32 2.7-5.63 5.53-.25 2.3.93 4.41 2.89 5.42" />
    <path d="m19.29 11.6-4.22-4.13a3.52 3.52 0 0 0-4.73 0L5.38 12.4a1 1 0 0 0 0 1.48l.25.24a1 1 0 0 0 1.48 0l4.22-4.12a1.52 1.52 0 0 1 2.08 0l4.22 4.12a1 1 0 0 0 1.48 0l.25-.24a1 1 0 0 0 0-1.48Z" />
    <path d="M15.46 7.21a2.23 2.23 0 0 0 0 3.1l.25.25" />
  </svg>
);

export const ChickenIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18.87 10.33c.32-.23.5-.6.43-.99-.07-.38-.34-.69-.71-.82a3.53 3.53 0 0 0-3.52.41 3.53 3.53 0 0 0-2.01 3.19c.1.6.39 1.15.82 1.57l-2.4 2.88c-.2.24-.48.38-.77.38-.29 0-.57-.14-.77-.38a.96.96 0 0 1 0-1.38l2.4-2.88" />
    <path d="M13.2 10.33c.32-.23.5-.6.43-.99a1.03 1.03 0 0 0-.71-.82 3.53 3.53 0 0 0-3.52.41 3.53 3.53 0 0 0-2.01 3.19c.1.6.39 1.15.82 1.57" />
    <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" />
    <path d="M6 17.5c-2 0-2-2-2-2" />
  </svg>
);

export const ProductIcon = ({ type, className }: { type: 'beef' | 'pork' | 'chicken', className?: string }) => {
  const Icon = {
    beef: BeefIcon,
    pork: PorkIcon,
    chicken: ChickenIcon
  }[type];

  const colors = {
    beef: 'bg-red-200/50 text-red-700',
    pork: 'bg-pink-200/50 text-pink-700',
    chicken: 'bg-amber-200/50 text-amber-700'
  }

  return (
    <div className={cn("flex items-center justify-center w-8 h-8 rounded-full", colors[type])}>
      <Icon className={cn('w-5 h-5', className)} />
    </div>
  )
}
