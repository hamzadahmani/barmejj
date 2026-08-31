import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

export type VectorIconName =
  | 'arrowRight' | 'calendar' | 'clock' | 'coffee' | 'gift' | 'heart' | 'mapPin'
  | 'search' | 'sparkles' | 'star' | 'ticket' | 'users' | 'utensils' | 'wallet' | 'x';

const paths: Record<VectorIconName, React.ReactNode> = {
  arrowRight: <Path d="M5 12h14M13 6l6 6-6 6" />,
  calendar: <><Rect x="3" y="5" width="18" height="16" rx="3"/><Path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
  clock: <><Circle cx="12" cy="12" r="9"/><Path d="M12 7v5l3 2"/></>,
  coffee: <><Path d="M4 9h13v5a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V9Z"/><Path d="M17 11h1a3 3 0 0 1 0 6h-2M8 4v2M12 3v3"/></>,
  gift: <><Rect x="3" y="8" width="18" height="13" rx="2"/><Path d="M12 8v13M3 12h18M7.5 8C5.5 8 4 6.9 4 5.5S5.2 3 6.7 3C9.2 3 12 8 12 8M16.5 8C18.5 8 20 6.9 20 5.5S18.8 3 17.3 3C14.8 3 12 8 12 8"/></>,
  heart: <Path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  mapPin: <><Path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><Circle cx="12" cy="10" r="2.5"/></>,
  search: <><Circle cx="11" cy="11" r="7"/><Path d="m20 20-4-4"/></>,
  sparkles: <><Path d="m12 3 1.2 3.5L17 8l-3.8 1.5L12 13l-1.3-3.5L7 8l3.7-1.5L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15ZM19 14l.7 1.8 1.8.7-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.7L19 14Z"/></>,
  star: <Path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>,
  ticket: <Path d="M3 7a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4V7ZM12 7v2M12 11v2M12 15v2"/>,
  users: <><Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><Circle cx="9" cy="7" r="4"/><Path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
  utensils: <><Path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3v18M17 3c-3 2-4 6-4 9h4"/></>,
  wallet: <><Path d="M4 6h15a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12"/><Path d="M16 12h5M16 12a1 1 0 1 0 0 2"/></>,
  x: <Path d="m6 6 12 12M18 6 6 18"/>,
};

export default function VectorIcon({name, size = 20, color = '#4D3B80', strokeWidth = 1.9}: {name: VectorIconName; size?: number; color?: string; strokeWidth?: number}) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</Svg>;
}
