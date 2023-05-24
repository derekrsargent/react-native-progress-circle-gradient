import React, { FC, useEffect, useRef } from 'react';
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
  SkPaint,
  SkPoint,
  StrokeCap,
  StrokeJoin,
  TileMode,
  useValue,
} from '@shopify/react-native-skia';

type Line = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  paint: SkPaint;
};

type CircularProgressProps = {
  colors: string[];
  percentageComplete: number;
  radius: number;
  strokeWidth: number;
  backgroundColor?: string;
  duration?: number;
  granularity?: number;
};

export const CircularProgress: FC<CircularProgressProps> = ({
  colors,
  percentageComplete,
  radius,
  strokeWidth,
  backgroundColor,
  duration = 1250,
  granularity = 200,
}) => {
  const { cos, sin, PI } = Math;
  const prevPercentageComplete = useRef(0);
  const r = PixelRatio.roundToNearestPixel(radius - strokeWidth / 2);
  const animationState = useValue(0);

  // The duration is for 100% progress, so we adjust based on the delta
  const adjustedDuration =
    ((percentageComplete - prevPercentageComplete.current) / 100) * duration;

  useEffect(() => {
    animationState.current = prevPercentageComplete.current / 100;
    runTiming(animationState, percentageComplete / 100, {
      duration: adjustedDuration,
      easing: Easing.cubic,
    });
    prevPercentageComplete.current = percentageComplete;
  }, [adjustedDuration, animationState, percentageComplete]);

  const path = Skia.Path.Make();
  path.addCircle(radius, radius, r);

  const basePaint = Skia.Paint();
  basePaint.setStrokeWidth(strokeWidth);
  basePaint.setStyle(PaintStyle.Stroke);
  basePaint.setStrokeJoin(StrokeJoin.Round);
  basePaint.setStrokeCap(StrokeCap.Round);

  const step = (2 * PI) / granularity;

  const arcs = new Array(granularity).fill(0).map((_, i) => {
    return (2 * PI * i) / granularity;
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
    <Canvas style={{ width: radius * 2 + 2, height: radius * 2 + 2 }}>
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
