import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M14.5 2H18a2 2 0 0 1 2 2v2.5L13 12.5V18a2 2 0 0 1-2 2h-1.5a2 2 0 0 1-2-2v-5.5L1 6.5V4a2 2 0 0 1 2-2h2.5" />
    <path d="M14.5 2V12" />
    <path d="M6 16h.01" />
  </svg>
);
