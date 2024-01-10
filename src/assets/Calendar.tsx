import * as React from 'react';
import Svg, {SvgProps, G, Path} from 'react-native-svg';
const SvgComponentCalendar = (props: SvgProps) => (
  <Svg width={25} height={24} fill="none" {...props}>
    <G fill="#755DCD">
      <Path d="M8.25 2.5a.75.75 0 0 0-1.5 0v1.58c-1.44.115-2.384.397-3.078 1.092-.695.694-.977 1.639-1.093 3.078h19.842c-.116-1.44-.398-2.384-1.093-3.078-.694-.695-1.639-.977-3.078-1.093V2.5a.75.75 0 0 0-1.5 0v1.513C16.085 4 15.339 4 14.5 4h-4c-.839 0-1.585 0-2.25.013V2.5Z" />
      <Path
        fillRule="evenodd"
        d="M2.5 12c0-.839 0-1.585.013-2.25h19.974c.013.665.013 1.411.013 2.25v2c0 3.771 0 5.657-1.172 6.828C20.157 22 18.271 22 14.5 22h-4c-3.771 0-5.657 0-6.828-1.172C2.5 19.657 2.5 17.771 2.5 14v-2Zm15 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-4-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-6-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </G>
  </Svg>
);
export default SvgComponentCalendar;
