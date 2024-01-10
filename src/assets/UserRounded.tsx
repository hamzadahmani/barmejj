import * as React from 'react';
import Svg, {SvgProps, G, Circle, Ellipse} from 'react-native-svg';
const SvgComponentUser = (props: SvgProps) => (
  <Svg width={24} height={25} fill="none" {...props}>
    <G fill="#755DCD">
      <Circle cx={12} cy={6.5} r={4} />
      <Ellipse cx={12} cy={17.5} rx={7} ry={4} />
    </G>
  </Svg>
);
export default SvgComponentUser;
