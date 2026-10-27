import type { SVGProps } from 'react';

export type IconName = 'search' | 'bookmark' | 'arrow' | 'close' | 'heart' | 'repeat' | 'reply' | 'eye' | 'chevron' | 'spark' | 'info' | 'check' | 'copy' | 'signal' | 'code' | 'globe' | 'smile' | 'x';
const paths: Record<IconName, React.ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z"/>,
  arrow: <><path d="M6 18 18 6M6 6h12v12"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  heart: <path d="M20.5 5.5a5 5 0 0 0-7 0L12 7l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-8.5a5 5 0 0 0 0-7Z"/>,
  repeat: <><path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3"/></>,
  reply: <path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.8-5A9 9 0 1 1 21 11Z"/>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  chevron: <path d="m8 10 4 4 4-4"/>,
  spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/></>,
  signal: <><path d="M4 19v-3m5 3v-7m5 7V8m5 11V3"/></>,
  code: <><path d="m7 6-6 6 6 6m10-12 6 6-6 6m-3-16-4 20"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
  smile: <><circle cx="12" cy="12" r="9"/><path d="M8 14s1 3 4 3 4-3 4-3M8 8v1m8-1v1"/></>,
  x: <path d="M4 3h4l12 18h-4L4 3Zm16 0L4 21"/>,
};
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
