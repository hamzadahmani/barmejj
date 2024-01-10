import * as React from 'react';
import Svg, {SvgProps, Circle, Path} from 'react-native-svg';
const SvgSelectedFavoris = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={55}
    fill="none"
    {...props}>
    <Circle cx={12} cy={3} r={3} fill="#fff" />
    <Path
      fill="#fff"
      d="M2 40.318c0 3.729 4.02 7.673 6.962 10.06C10.294 51.46 10.96 52 12 52c1.04 0 1.706-.54 3.038-1.621C17.981 47.99 22 44.047 22 40.318c0-6.23-5.5-8.556-10-3.744-4.5-4.812-10-2.486-10 3.744Z"
    />
  </Svg>
);
export default SvgSelectedFavoris;
