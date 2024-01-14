import * as React from 'react';
import Svg, {
  SvgProps,
  G,
  Circle,
  Ellipse,
  Defs,
  ClipPath,
  Path,
} from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgProfile = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <G fill="#fff" clipPath="url(#a)" filter="url(#b)">
      <Circle cx={12} cy={6.5} r={4} />
      <Ellipse cx={12} cy={17.5} rx={7} ry={4} />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M4 0h24v24H4z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgProfile;
