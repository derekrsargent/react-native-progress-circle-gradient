import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  type TextProps,
  View,
} from 'react-native';
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
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { CanvasProps } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

type EasingOptions = 'cubic' | 'ease' | 'linear' | 'quad';

const EASING_MAP = {
  cubic: Easing.cubic,
  ease: Easing.ease,
  linear: Easing.linear,
  quad: Easing.quad,
} as const;

/** Normalized animated progress: 0 = 0%, 1 = 100%, 2 = 200%. */
const CircularProgressContext = createContext<SharedValue<number> | null>(null);

export type CircularProgressTextValueScale = 'percentRange' | 'normalized';

export type CircularProgressTextVariant = 'percent' | 'plain';

export type CircularProgressTextRounding = 'round' | 'floor' | 'ceil' | 'trunc';

function applyRounding(
  n: number,
  mode: CircularProgressTextRounding,
  fractionDigits: number
): number {
  const f = 10 ** fractionDigits;
  switch (mode) {
    case 'round':
      return Math.round(n * f) / f;
    case 'floor':
      return Math.floor(n * f) / f;
    case 'ceil':
      return Math.ceil(n * f) / f;
    case 'trunc':
      return Math.trunc(n * f) / f;
    default:
      return Math.round(n * f) / f;
  }
}

function formatDisplayNumber(n: number, fractionDigits: number): string {
  if (fractionDigits <= 0) {
    return String(Math.round(n));
  }
  return n.toFixed(fractionDigits);
}

export function buildCircularProgressTextLabel(
  animatedProgress: number,
  options: {
    valueScale: CircularProgressTextValueScale;
    variant: CircularProgressTextVariant;
    prefix?: string;
    suffix?: string;
    fractionDigits: number;
    rounding: CircularProgressTextRounding;
  }
): string {
  const raw =
    options.valueScale === 'normalized'
      ? animatedProgress
      : animatedProgress * 100;
  const rounded = applyRounding(raw, options.rounding, options.fractionDigits);
  const numStr = formatDisplayNumber(rounded, options.fractionDigits);
  const prefix = options.prefix ?? '';
  const suffix =
    options.suffix !== undefined
      ? options.suffix
      : options.variant === 'percent'
      ? '%'
      : '';
  return `${prefix}${numStr}${suffix}`;
}

export interface CircularProgressTextProps extends TextProps {
  /**
   * Maps the eased animated progress (0–2) to the label string.
   * When set, `valueScale`, `variant`, `prefix`, `suffix`, `fractionDigits`, and `rounding` are ignored.
   */
  format?: (animatedProgress: number) => string;
  /**
   * Numeric scale before prefix/suffix:
   * - `percentRange` (default): `animatedProgress * 100` → **0–200** (matches `percentageComplete`)
   * - `normalized`: **0–2** (same as the internal shared value)
   */
  valueScale?: CircularProgressTextValueScale;
  /**
   * - `percent` (default): append `suffix` or `'%'` if `suffix` omitted
   * - `plain`: number only unless you pass `prefix` / `suffix` (e.g. `"75"` or `"3/4"`-style via `format`)
   */
  variant?: CircularProgressTextVariant;
  /** Prepended to the numeric part (built-in formatter only). */
  prefix?: string;
  /**
   * Appended after the number (built-in formatter only).
   * Default: `'%'` when `variant` is `percent`, otherwise `''`.
   */
  suffix?: string;
  /** Fraction digits for the built-in formatter. Default `0` (whole numbers). */
  fractionDigits?: number;
  /** How values are rounded before formatting. Default `'round'`. */
  rounding?: CircularProgressTextRounding;
  /**
   * Smallest change in the **displayed numeric value** (after `valueScale`, before prefix/suffix) that triggers a refresh.
   * Defaults: `0.1` when `valueScale` is `percentRange`, `0.001` when `normalized`.
   */
  updateDisplayStep?: number;
  /**
   * @deprecated Use `updateDisplayStep`. Interpreted as a step in **0–200** percent-range units (same as before).
   */
  updateStepPercent?: number;
}

function CircularProgressText({
  format: formatProp,
  valueScale = 'percentRange',
  variant = 'percent',
  prefix,
  suffix,
  fractionDigits = 0,
  rounding = 'round',
  updateDisplayStep,
  updateStepPercent,
  style,
  ...textProps
}: CircularProgressTextProps) {
  const animatedProgress = useContext(CircularProgressContext);

  if (animatedProgress == null) {
    throw new Error(
      'CircularProgress.Text must be used as a child of CircularProgress'
    );
  }

  const displayStep = Math.max(
    updateDisplayStep ??
      (updateStepPercent != null && valueScale === 'percentRange'
        ? updateStepPercent
        : valueScale === 'normalized'
        ? 0.001
        : 0.1),
    0.0000001
  );

  const format = useMemo(() => {
    if (formatProp) {
      return formatProp;
    }
    return (v: number) =>
      buildCircularProgressTextLabel(v, {
        valueScale,
        variant,
        prefix,
        suffix,
        fractionDigits,
        rounding,
      });
  }, [
    formatProp,
    valueScale,
    variant,
    prefix,
    suffix,
    fractionDigits,
    rounding,
  ]);

  const [label, setLabel] = useState(() => format(animatedProgress.value));

  const updateLabel = useCallback(
    (value: number) => {
      setLabel(format(value));
    },
    [format]
  );

  useAnimatedReaction(
    () => animatedProgress.value,
    (value, prev) => {
      const toDisplay = (v: number) =>
        valueScale === 'normalized' ? v : v * 100;
      const q = Math.round(toDisplay(value) / displayStep);
      const prevQ =
        prev !== null && prev !== undefined
          ? Math.round(toDisplay(prev as number) / displayStep)
          : null;
      if (prevQ === null || q !== prevQ) {
        runOnJS(updateLabel)(value);
      }
    },
    [animatedProgress, updateLabel, displayStep, valueScale]
  );

  // Keep label in sync if format function changes
  useEffect(() => {
    setLabel(format(animatedProgress.value));
  }, [format, animatedProgress]);

  return (
    <Text style={style} {...textProps}>
      {label}
    </Text>
  );
}

export interface CircularProgressRef {
  /** Pause the animation at its current position */
  pause: () => void;
  /** Resume the animation from its paused position to the target */
  play: () => void;
  /** Cancel the animation and reset progress to 0 */
  reset: () => void;
  /** Animated progress value (0–2), useful for driving animated labels */
  animatedProgress: SharedValue<number>;
}

interface CircularProgressProps extends Omit<CanvasProps, 'children'> {
  /** Color hex values array to be used for the angular gradient */
  colors: string[];
  /** Content to render centered inside the progress circle */
  children?: React.ReactNode;
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

const CircularProgressRoot = React.forwardRef<
  CircularProgressRef,
  CircularProgressProps
>(
  (
    {
      colors,
      children,
      backgroundColor = '#F0F8FF',
      duration = 1250,
      easing = 'cubic',
      onAnimationFinish,
      percentageComplete = 0,
      radius = 100,
      rotation = 0,
      strokeWidth = 20,
      ...props
    },
    ref
  ) => {
    const prevPercentageComplete = useRef(0);
    const isPaused = useRef(false);
    const r = PixelRatio.roundToNearestPixel(radius - strokeWidth / 2);
    const progress = useSharedValue(0);

    const animateToTarget = (target: number) => {
      const remaining = Math.abs(target - progress.value);
      progress.value = withTiming(
        target,
        {
          duration: remaining * duration,
          easing: EASING_MAP[easing],
        },
        (finished) => {
          'worklet';
          if (finished && target >= 1 && onAnimationFinish) {
            runOnJS(onAnimationFinish)();
          }
        }
      );
    };

    useImperativeHandle(ref, () => ({
      pause: () => {
        cancelAnimation(progress);
        isPaused.current = true;
      },
      play: () => {
        if (isPaused.current) {
          isPaused.current = false;
          animateToTarget(percentageComplete / 100);
        }
      },
      reset: () => {
        cancelAnimation(progress);
        progress.value = 0;
        prevPercentageComplete.current = 0;
        isPaused.current = false;
      },
      animatedProgress: progress,
    }));

    useEffect(() => {
      if (isPaused.current) {
        prevPercentageComplete.current = percentageComplete;
        return;
      }

      const target = percentageComplete / 100;
      const delta = (percentageComplete - prevPercentageComplete.current) / 100;
      const adjustedDuration = Math.abs(delta) * duration;

      progress.value = withTiming(
        target,
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
    }, [duration, easing, percentageComplete, progress, onAnimationFinish]);

    const path = useMemo(() => {
      const p = Skia.Path.Make();
      p.addCircle(radius, radius, r);
      return p;
    }, [radius, r]);

    const firstLayerEnd = useDerivedValue(() => Math.min(progress.value, 1));

    const secondLayerEnd = useDerivedValue(() =>
      Math.max(progress.value - 1, 0)
    );

    const capBlendThreshold = 1 - strokeWidth / (2 * Math.PI * r);

    const startCapOpacity = useDerivedValue(() => {
      const fill = Math.min(progress.value, 1);
      if (fill <= 0 || fill >= capBlendThreshold) return 0;
      return 1;
    });

    const endCapOpacity = useDerivedValue(() => {
      const fill = Math.min(progress.value, 1);
      if (fill < capBlendThreshold) return 0;
      return 1;
    });

    const center = vec(radius, radius);
    const rotationRadians = ((rotation - 90) * Math.PI) / 180;
    const lastColor = colors[colors.length - 1] ?? colors[0]!;
    const size = radius * 2;

    return (
      <CircularProgressContext.Provider value={progress}>
        <View style={{ width: size, height: size }}>
          <Canvas style={StyleSheet.absoluteFill} {...props}>
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
              <Group opacity={endCapOpacity}>
                <Circle
                  cx={radius + r}
                  cy={radius}
                  r={strokeWidth / 2}
                  color={lastColor}
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
          {children && (
            <View style={styles.childrenContainer} pointerEvents="box-none">
              {children}
            </View>
          )}
        </View>
      </CircularProgressContext.Provider>
    );
  }
);

CircularProgressRoot.displayName = 'CircularProgress';

/** Compound component: use `CircularProgress.Text` for a label tied to eased progress. */
export const CircularProgress = Object.assign(CircularProgressRoot, {
  Text: CircularProgressText,
}) as typeof CircularProgressRoot & { Text: typeof CircularProgressText };

const styles = StyleSheet.create({
  childrenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
