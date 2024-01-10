import * as React from 'react';
import Svg, {SvgProps, G, Rect, Path, Defs} from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgComponentDown = (props: SvgProps) => (
  <Svg width={89} height={39} fill="none" {...props}>
    <G filter="url(#a)">
      <Rect width={27} height={27} x={48} y={6} fill="#fff" rx={4} />
    </G>
    <Path
      stroke="#6938D3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m56 17 5 5 5-5"
    />
    <Defs />
  </Svg>
);
export default SvgComponentDown;
