declare module 'qrcode.react' {
  import * as React from 'react';
  export interface QRProps extends React.SVGAttributes<SVGSVGElement> {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height?: number;
      width?: number;
      excavate?: boolean;
      x?: number;
      y?: number;
    };
  }
  export const QRCodeSVG: React.FC<QRProps>;
  export const QRCodeCanvas: React.FC<QRProps>;
  const _default: React.FC<QRProps>;
  export default _default;
}
