import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgHeart = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      fill="#fff"
      d="M2 9.318c0 3.729 4.02 7.673 6.962 10.06C10.294 20.46 10.96 21 12 21c1.04 0 1.706-.54 3.038-1.621C17.981 16.99 22 13.047 22 9.317c0-6.23-5.5-8.556-10-3.743C7.5.761 2 3.087 2 9.318Z"
    />
  </Svg>
);
export default SvgHeart;
