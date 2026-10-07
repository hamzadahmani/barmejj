import React, {memo} from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

export type FeedIconName =
  | 'play'
  | 'pin'
  | 'heart'
  | 'share'
  | 'search'
  | 'sound'
  | 'mute'
  | 'arrow'
  | 'close'
  | 'refresh';

type Props = {
  name: FeedIconName;
  size?: number;
  color?: string;
  filled?: boolean;
  strokeWidth?: number;
};

function FeedIcon({
  name,
  size = 23,
  color = '#FFF',
  filled = false,
  strokeWidth = 2,
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {name === 'play' && <Path d="m9 6 9 6-9 6V6Z" fill={color} />}
      {name === 'pin' && (
        <>
          <Path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <Circle cx="12" cy="10" r="2.5" />
        </>
      )}
      {name === 'heart' && (
        <Path
          fill={filled ? color : 'none'}
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"
        />
      )}
      {name === 'share' && (
        <>
          <Circle cx="18" cy="5" r="3" />
          <Circle cx="6" cy="12" r="3" />
          <Circle cx="18" cy="19" r="3" />
          <Path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4" />
        </>
      )}
      {name === 'search' && (
        <>
          <Circle cx="11" cy="11" r="7" />
          <Path d="m20 20-4-4" />
        </>
      )}
      {(name === 'sound' || name === 'mute') && (
        <Path d="M11 5 6 9H3v6h3l5 4V5Z" fill={color} />
      )}
      {name === 'sound' && (
        <Path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
      )}
      {name === 'mute' && <Path d="m16 9 5 6m0-6-5 6" />}
      {name === 'arrow' && <Path d="M5 12h14m-6-6 6 6-6 6" />}
      {name === 'close' && <Path d="M6 6l12 12M18 6 6 18" />}
      {name === 'refresh' && (
        <>
          <Path d="M20 11a8 8 0 1 0-2.3 5.7" />
          <Path d="M20 4v7h-7" />
        </>
      )}
    </Svg>
  );
}

export default memo(FeedIcon);
