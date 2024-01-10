import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponentPassword = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" {...props}>
    <Path
      fill="#7D7F88"
      d="M18.14 3.868c-2.713-2.704-7.113-2.704-9.808 0-1.897 1.88-2.465 4.584-1.732 6.967l-4.308 4.308c-.303.312-.514.926-.45 1.366l.275 1.998c.101.66.715 1.284 1.375 1.375l1.999.275c.44.065 1.054-.137 1.366-.458l.751-.752a.454.454 0 0 0 0-.65L5.83 16.518a.692.692 0 0 1 0-.971.692.692 0 0 1 .972 0l1.787 1.787a.46.46 0 0 0 .642 0l1.943-1.934a6.943 6.943 0 0 0 6.967-1.714c2.704-2.704 2.704-7.114 0-9.818ZM13.293 11a2.292 2.292 0 1 1 .001-4.585A2.292 2.292 0 0 1 13.292 11Z"
    />
  </Svg>
);
export default SvgComponentPassword;
