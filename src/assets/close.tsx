import * as React from 'react';
import Svg, {SvgProps, Rect, Path} from 'react-native-svg';
const SvgClose = (props: SvgProps) => (
  <Svg width={40} height={40} fill="none" {...props}>
    <Rect width={40} height={40} fill="#CED0D4" rx={10} />
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M26 14 14 26M14 14l12 12"
    />
  </Svg>
);
export default SvgClose;
