import type {ReactNode} from 'react';

declare module 'react-native-svg' {
  interface SvgProps {
    children?: ReactNode;
    xmlns?: string;
    xmlnsXlink?: string;
  }
  interface GProps {
    children?: ReactNode;
    filter?: string;
  }
  interface ClipPathProps {
    children?: ReactNode;
  }
  interface PatternProps {
    children?: ReactNode;
  }
}
