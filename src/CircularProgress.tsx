import React, { useEffect, useMemo, useRef } from 'react';
import { PixelRatio } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { FC } from 'react';
import type { CanvasProps } from '@shopify/react-native-skia';

type EasingOptions = 'cubic' | 'ease' | 'linear' | 'quad';

const EASING_MAP = {
  cubic: Easing.cubic,
  ease: Easing.ease,
  linear: Easing.linear,
  quad: Easing.quad,
} as const;

interface CircularProgressProps extends Omit<CanvasProps, 'children'> {
  /** Color hex values array to be used for the angular gradient */
  colors: string[];
  /** Color hex value for the remaining progress */
  backgroundColor?: string;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing options for animation */
  easing?: EasingOptions;
  /** Callback for when animation reaches 100% */
  onAnimationFinish?: () => void;
  /** Percentage of progress completed ranging from 0-200 */
  percentageComplete?: number;
  /** Radius of the progress circle in points, measured from the center of the stroke */
  radius?: number;
  /** Rotation of progress circle in degrees */
  rotation?: number;
  /** Thickness of the progress circle */
  strokeWidth?: number;
}

export const CircularProgress: FC<CircularProgressProps> = ({
  colors,
  backgroundColor = '#F0F8FF',
  duration = 1250,
  easing = 'cubic',
  onAnimationFinish,
  percentageComplete = 0,
  radius = 100,
  rotation = 0,
  strokeWidth = 20,
  ...props
}) => {
  const prevPercentageComplete = useRef(0);
  const r = PixelRatio.roundToNearestPixel(radius - strokeWidth / 2);
  const progress = useSharedValue(0);

  const adjustedDuration =
    ((percentageComplete - prevPercentageComplete.current) / 100) * duration;

  useEffect(() => {
    progress.value = withTiming(
      percentageComplete / 100,
      {
        duration: adjustedDuration,
        easing: EASING_MAP[easing],
      },
      (finished) => {
        'worklet';
        if (finished && percentageComplete >= 100 && onAnimationFinish) {
          runOnJS(onAnimationFinish)();
        }
      }
    );
    prevPercentageComplete.current = percentageComplete;
  }, [
    adjustedDuration,
    easing,
    percentageComplete,
    progress,
    onAnimationFinish,
  ]);

  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(radius, radius, r);
    return p;
  }, [radius, r]);

  const firstLayerEnd = useDerivedValue(() => Math.min(progress.value, 1));

  const secondLayerEnd = useDerivedValue(() => Math.max(progress.value - 1, 0));

  const startCapOpacity = useDerivedValue(() => (progress.value > 0 ? 1 : 0));

  const center = vec(radius, radius);
  const rotationRadians = ((rotation - 90) * Math.PI) / 180;
  const lastColor = colors[colors.length - 1] ?? colors[0]!;

  return (
    <Canvas style={{ width: radius * 2, height: radius * 2 }} {...props}>
      <Group origin={center} transform={[{ rotate: rotationRadians }]}>
        {!!backgroundColor && (
          <Path
            path={path}
            color={backgroundColor}
            style="stroke"
            strokeJoin="round"
            strokeWidth={strokeWidth}
            strokeCap="round"
          />
        )}
        <Path
          path={path}
          style="stroke"
          strokeJoin="round"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={firstLayerEnd}
        >
          <SweepGradient c={center} colors={colors} />
        </Path>
        <Group opacity={startCapOpacity}>
          <Circle
            cx={radius + r}
            cy={radius}
            r={strokeWidth / 2}
            color={colors[0]!}
          />
        </Group>
        <Path
          path={path}
          color={lastColor}
          style="stroke"
          strokeJoin="round"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={secondLayerEnd}
        />
      </Group>
    </Canvas>
  );
};
