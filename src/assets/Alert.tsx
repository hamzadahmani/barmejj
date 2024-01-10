import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponentAlert = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      stroke="#DC6803"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M10.29 2.86 1.82 17a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 2.86a2 2 0 0 0-3.42 0Z"
    />
  </Svg>
);
export default SvgComponentAlert;
