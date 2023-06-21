import React, { useEffect, useRef } from 'react';
import { PixelRatio } from 'react-native';
import interpolate from 'color-interpolate';
import {
  Canvas,
  Circle,
  Drawing,
  Easing,
  Group,
  Mask,
  PaintStyle,
  Path,
  runTiming,
  Skia,
  StrokeCap,
  StrokeJoin,
  TileMode,
  useValue,
} from '@shopify/react-native-skia';

import type { FC } from 'react';
import type { CanvasProps, SkPaint, SkPoint } from '@shopify/react-native-skia';

type Line = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  paint: SkPaint;
};

type EasingOptions = 'cubic' | 'ease' | 'linear' | 'quad';

interface CircularProgressProps extends Omit<CanvasProps, 'children'> {
  /** Color hex values array to be used for the angular gradient */
  colors: string[];
  /** Color hex value for the remaining progress */
  backgroundColor?: string;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing options for animation */
  easing?: EasingOptions;
  /** Smaller progress circle charts can use a smaller granularity to increase performance */
  granularity?: number;
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
  granularity = 200,
  onAnimationFinish = () => {},
  percentageComplete = 0,
  radius = 100,
  rotation = 0,
  strokeWidth = 20,
  ...props
}) => {
  const { cos, sin, PI } = Math;
  const prevPercentageComplete = useRef(0);
  const isAnimationComplete = useRef(false);
  const r = PixelRatio.roundToNearestPixel(radius - strokeWidth / 2);
  const animationState = useValue(0);

  // The duration is for 100% progress, so we adjust it based on the progress delta from the
  // previous state so that a small  increase in progress does not use the full duration
  const adjustedDuration =
    ((percentageComplete - prevPercentageComplete.current) / 100) * duration;

  useEffect(() => {
    animationState.current = prevPercentageComplete.current / 100;
    runTiming(animationState, percentageComplete / 100, {
      duration: adjustedDuration,
      easing: Easing[easing],
    });
    prevPercentageComplete.current = percentageComplete;
  }, [adjustedDuration, animationState, easing, percentageComplete]);

  // https://github.com/Shopify/react-native-skia/issues/239
  useEffect(() => {
    const unsubscribe = animationState.addListener((value) => {
      if (value >= 1.0 && !isAnimationComplete.current) {
        isAnimationComplete.current = true;
        onAnimationFinish();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [animationState, onAnimationFinish]);

  const path = Skia.Path.Make();
  path.addCircle(radius, radius, r);

  const basePaint = Skia.Paint();
  basePaint.setStrokeWidth(strokeWidth);
  basePaint.setStyle(PaintStyle.Stroke);
  basePaint.setStrokeJoin(StrokeJoin.Round);
  basePaint.setStrokeCap(StrokeCap.Round);

  const step = (2 * PI) / granularity;

  const convertDegreesToRadians = (degrees: number) =>
    ((2 * PI * degrees) / 360) % 360;

  // An array of the angles in radians of each sub-section of the progress chart.
  // We make an array with `granularity * 2` elements so that progress can go up to 200%
  const arcs = new Array(granularity * 2).fill(0).map((_, i) => {
    return (
      (2 * PI * i) / granularity + PI / 2 + convertDegreesToRadians(rotation)
    );
  });

  const x = (α: number) => radius - r * cos(α);
  const y = (α: number) => -r * sin(α) + radius;

  const palette = interpolate(colors);

  const calculateXY = (α: number, idx: number) => {
    const x0 = x(α);
    const y0 = y(α);
    const x1 = x(α + step);
    const y1 = y(α + step);

    const paint = basePaint.copy();

    const p0: SkPoint = { x: x0, y: y0 };
    const p1: SkPoint = { x: x1, y: y1 };

    const gradient = Skia.Shader.MakeLinearGradient(
      p0,
      p1,
      [palette(idx / granularity), palette((idx + 1) / granularity)].map(
        (color) => Skia.Color(color)
      ),
      null,
      TileMode.Clamp
    );
    paint.setShader(gradient);
    return { x0, y0, x1, y1, paint };
  };

  function calculateLines() {
    const lines: Line[] = [];
    arcs.forEach((arc, idx) => {
      const line = calculateXY(arc, idx);
      lines.push(line);
    });
    return lines;
  }

  const lines = calculateLines();

  return (
    <Canvas
      style={{ width: radius * 2 + 2, height: radius * 2 + 2 }}
      {...props}
    >
      <Group>
        {!!backgroundColor && (
          <Mask
            // White pixels will be visible and black pixels invisible
            mode="luminance"
            mask={
              <Group>
                <Path
                  path={path}
                  color="white"
                  style="stroke"
                  strokeJoin="round"
                  strokeWidth={strokeWidth}
                  strokeCap="round"
                />
              </Group>
            }
          >
            <Circle
              cx={radius}
              cy={radius}
              r={radius}
              color={backgroundColor}
            />
          </Mask>
        )}
        <Drawing
          drawing={({ canvas }) => {
            lines.forEach((line, idx) => {
              const point = idx / granularity;
              if (point <= animationState.current) {
                // TODO: fix animation being janky without this timeout
                setTimeout(() => {}, 0);
                canvas.drawLine(line.x0, line.y0, line.x1, line.y1, line.paint);
              }
            });
          }}
        />
      </Group>
    </Canvas>
  );
};
