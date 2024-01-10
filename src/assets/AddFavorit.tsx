import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';
const SvgComponentHeart = (props: SvgProps) => (
  <Svg width={26} height={24} fill="none" {...props}>
    <Path
      fill="#E74C3C"
      d="M16.514 4.053c-1.29.176-2.58.778-3.514 1.756-.934-.978-2.225-1.58-3.514-1.756-1.636-.222-3.42.231-4.525 1.678a5.305 5.305 0 0 0 0 6.395l4.752 6.224a4.099 4.099 0 0 0 6.574 0l4.752-6.224a5.305 5.305 0 0 0 0-6.395c-1.104-1.447-2.89-1.9-4.525-1.678Z"
    />
  </Svg>
);
export default SvgComponentHeart;
