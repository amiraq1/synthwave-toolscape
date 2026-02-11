declare module "web-vitals" {
  type WebVitalMetric = {
    name: string;
    value: number;
  };

  type WebVitalCallback = (metric: WebVitalMetric) => void;

  export function onCLS(callback: WebVitalCallback): void;
  export function onFID(callback: WebVitalCallback): void;
  export function onLCP(callback: WebVitalCallback): void;
  export function onFCP(callback: WebVitalCallback): void;
  export function onTTFB(callback: WebVitalCallback): void;
}
