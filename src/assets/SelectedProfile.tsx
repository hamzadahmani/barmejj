import * as React from 'react';
import Svg, {
  SvgProps,
  Circle,
  G,
  Ellipse,
  Defs,
  ClipPath,
  Path,
} from 'react-native-svg';
const SvgSelectedProfile = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={55}
    fill="none"
    {...props}>
    <Circle cx={12} cy={3} r={3} fill="#fff" />
    <G fill="#fff" clipPath="url(#a)">
      <Circle cx={12.25} cy={37.5} r={4} />
      <Ellipse cx={12.25} cy={48.5} rx={7} ry={4} />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 31h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgSelectedProfile;
