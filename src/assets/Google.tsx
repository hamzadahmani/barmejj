import * as React from 'react';
import Svg, {SvgProps, G, Path, Defs, ClipPath} from 'react-native-svg';
const SvgComponentGoogle = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <G clipPath="url(#a)">
      <Path
        fill="#4285F4"
        d="M23.713 12.276c0-.816-.066-1.636-.207-2.438H12.187v4.62h6.482a5.554 5.554 0 0 1-2.399 3.647v2.999h3.867c2.271-2.09 3.576-5.177 3.576-8.828Z"
      />
      <Path
        fill="#34A853"
        d="M12.188 24c3.236 0 5.965-1.062 7.954-2.896l-3.867-2.998c-1.076.731-2.465 1.146-4.083 1.146-3.13 0-5.785-2.112-6.737-4.952h-3.99v3.091a12.002 12.002 0 0 0 10.723 6.61Z"
      />
      <Path
        fill="#FBBC04"
        d="M5.45 14.3a7.188 7.188 0 0 1 0-4.594V6.615H1.464a12.01 12.01 0 0 0 0 10.776l3.986-3.09Z"
      />
      <Path
        fill="#EA4335"
        d="M12.188 4.75a6.52 6.52 0 0 1 4.603 1.799l3.426-3.426A11.533 11.533 0 0 0 12.187 0 11.998 11.998 0 0 0 1.465 6.615l3.986 3.09c.948-2.843 3.607-4.955 6.738-4.955Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgComponentGoogle;
