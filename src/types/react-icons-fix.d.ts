declare module 'react-icons/lib/iconBase' {
  import * as React from 'react';
  export interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
    attr?: Record<string, string>;
    title?: string;
  }
  export type IconType = (props: IconBaseProps) => React.JSX.Element;
  export const GenIcon: (icon: any) => IconType;
} 
