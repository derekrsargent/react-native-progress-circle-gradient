# react-native-progress-circle-gradient

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![Version](https://img.shields.io/npm/v/react-native-progress-circle-gradient.svg)](https://www.npmjs.com/package/react-native-progress-circle-gradient)
[![npm](https://img.shields.io/npm/dt/react-native-progress-circle-gradient.svg)](https://www.npmjs.com/package/react-native-progress-circle-gradient)

**High-performance circular progress with an angular (sweep) gradient** for React Native—built on [**React Native Skia**](https://shopify.github.io/react-native-skia/) and [**React Native Reanimated**](https://docs.swmansion.com/react-native-reanimated/) so your ring stays **buttery smooth at 60 FPS** (device refresh rate permitting) while React stays out of the per-frame hot path.

![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example7.gif)

---

## What’s new in v2.x

**v2** redraws the ring with **Skia 2** (declarative paths + sweep gradient) and **Reanimated** timing—so animation stays on the UI thread and feels smooth at **60 FPS**. You also get **pause / play / reset** via ref and **0–200%** when you need more than one full turn. **Center text is optional**—add **`CircularProgress.Text`** only when you want a label that tracks the eased value.

**Upgrading from v1?** Add **Skia** + **Reanimated** as peers and the **Reanimated Babel plugin**—see [Installation](#installation-step-by-step).

---

## Requirements

Install these **peer dependencies** in your app (versions are minimums; align with your Expo / React Native template when applicable):

| Package                     | Purpose                          |
| --------------------------- | -------------------------------- |
| `react`                     | UI                               |
| `react-native`              | Runtime                          |
| `@shopify/react-native-skia`| GPU-accelerated drawing          |
| `react-native-reanimated`   | 60 FPS–friendly animation        |

---

## Installation (step by step)

### 1. Install the library

```sh
npm install react-native-progress-circle-gradient
```

or

```sh
yarn add react-native-progress-circle-gradient
```

### 2. Install peer dependencies

```sh
npm install @shopify/react-native-skia react-native-reanimated
```

Use the versions recommended by your **Expo SDK** or **React Native** version (e.g. `npx expo install @shopify/react-native-skia react-native-reanimated` in Expo projects).

### 3. Configure Reanimated (required)

Add the Reanimated Babel plugin to **`babel.config.js`**. It must be **listed last** in `plugins`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ...other plugins
    'react-native-reanimated/plugin',
  ],
};
```

Clear Metro cache after changing Babel config (`npx react-native start --reset-cache` or your usual Expo command).

### 4. Build / run

- **Bare React Native:** iOS `pod install` under `ios/` as usual for your setup.
- **Expo:** Skia and Reanimated require a **development build** (not Expo Go) if your SDK expects native modules outside the Go binary—use `expo prebuild` / EAS or local `expo run:ios` / `expo run:android` as documented for your SDK.

---

## Quick start

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { CircularProgress } from 'react-native-progress-circle-gradient';

export function Example() {
  const [value, setValue] = useState(0);

  return (
    <View>
      <CircularProgress
        colors={['#3B82F6', '#22C55E']}
        percentageComplete={value}
        radius={100}
        strokeWidth={16}
        backgroundColor="#1F1B24"
        duration={800}
      />
    </View>
  );
}
```

**Center text is optional.** The example above is ring-only; you don’t need `children` or `CircularProgress.Text` unless you want something in the middle.

---

## API reference

### `CircularProgress` props

| Prop                 | Type       | Default     | Description |
| -------------------- | ---------- | ----------- | ----------- |
| `colors`             | `string[]` | —           | **Required.** Gradient stops around the arc (hex or supported color strings). |
| `percentageComplete` | `number`   | `0`         | Target progress **0–200** (100 = one full turn; 200 = two laps). |
| `radius`             | `number`   | `100`       | Outer layout size is `radius * 2`; stroke is centered in that box. |
| `strokeWidth`        | `number`   | `20`        | Ring thickness. |
| `backgroundColor`    | `string`   | `'#F0F8FF'` | Track color behind the gradient stroke. Pass a falsy value to hide the track. |
| `duration`           | `number`   | `1250`      | Base duration (ms); actual step duration scales with the change in `percentageComplete`. |
| `easing`             | `string`   | `'cubic'`   | `'cubic'` \| `'ease'` \| `'linear'` \| `'quad'`. |
| `rotation`           | `number`   | `0`         | Rotation in degrees (0° starts at the top). |
| `onAnimationFinish`  | `function` | —           | Called on JS when a timing run **finishes** at or past **100%** (see implementation for exact conditions). |
| `children`           | `node`     | —           | **Optional.** Centered overlay (e.g. `CircularProgress.Text`). Omit for a ring with no label. |

Additional props are forwarded to Skia’s `Canvas` (see `CanvasProps` from `@shopify/react-native-skia`).

### Imperative handle (`ref`)

Attach a ref typed as `CircularProgressRef`:

| Method / field        | Description |
| --------------------- | ----------- |
| `pause()`             | **Stops** the animation at the current value (same idea as “stop” without resetting). |
| `play()`              | **Resumes** animation from the paused value toward the current `percentageComplete` prop. |
| `reset()`             | Cancels animation and sets internal progress to **0**. You usually also reset your own `percentageComplete` state. |
| `animatedProgress`    | Reanimated `SharedValue<number>` in **0–2** (normalized: `percentageComplete / 100`). For advanced, UI-thread-driven UI. |

```tsx
import React, { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import {
  CircularProgress,
  type CircularProgressRef,
} from 'react-native-progress-circle-gradient';

export function ControlsExample() {
  const [pct, setPct] = useState(0);
  const ref = useRef<CircularProgressRef>(null);

  return (
    <>
      <CircularProgress
        ref={ref}
        colors={['#6366F1', '#A855F7']}
        percentageComplete={pct}
        radius={96}
        strokeWidth={18}
      />
      <Pressable onPress={() => ref.current?.pause()}>
        <Text>Pause</Text>
      </Pressable>
      <Pressable onPress={() => ref.current?.play()}>
        <Text>Play</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          ref.current?.reset();
          setPct(0);
        }}
      >
        <Text>Reset</Text>
      </Pressable>
    </>
  );
}
```

### `CircularProgress.Text` (optional compound component)

**Optional**—use only when you want centered text. Renders a label that follows the **eased** animated value (not just the target prop). Must be a **child** of `CircularProgress`.

**Built-in formatting** (omit `format` to use these):

| Prop                 | Description |
| -------------------- | ----------- |
| `valueScale`         | `'percentRange'` (0–200, default) or `'normalized'` (0–2). |
| `variant`            | `'percent'` (default, suffix `%`) or `'plain'` (number only unless you set `suffix`). |
| `prefix` / `suffix`  | Optional strings around the number. |
| `fractionDigits`     | Decimal places (default `0`). |
| `rounding`           | `'round'` \| `'floor'` \| `'ceil'` \| `'trunc'`. |
| `updateDisplayStep`  | Minimum change in the displayed number before updating (tunes JS updates vs smoothness). |

Override completely with **`format={(animatedProgress) => '…'}`** (receives normalized **0–2**).

```tsx
<CircularProgress colors={['#0EA5E9', '#22C55E']} percentageComplete={pct} radius={120} strokeWidth={20}>
  <CircularProgress.Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }} />
</CircularProgress>

<CircularProgress.Text variant="plain" />

<CircularProgress.Text fractionDigits={1} />

<CircularProgress.Text format={(v) => `${Math.round(v * 100)} / 200`} />
```

---

## Examples

### Increment progress (0–200%)

```tsx
const [progress, setProgress] = useState(0);

<Pressable onPress={() => setProgress((p) => Math.min(200, p + 25))}>
  <Text>+25%</Text>
</Pressable>

<CircularProgress
  colors={['#0000FF', '#00FF00']}
  percentageComplete={progress}
  radius={128}
  strokeWidth={20}
  duration={1200}
  easing="cubic"
  onAnimationFinish={() => console.log('Reached ≥100% on this run')}
/>
```

### Center label synced to easing (optional)

```tsx
<CircularProgress
  colors={['#2563EB', '#16A34A']}
  percentageComplete={progress}
  radius={100}
  strokeWidth={16}
  backgroundColor="#121212"
>
  <CircularProgress.Text
    style={{ color: '#F9FAFB', fontSize: 32, fontWeight: '600' }}
    variant="percent"
  />
</CircularProgress>
```

### Multiple gradient stops and rotation

```tsx
<CircularProgress
  colors={['#3B82F6', '#EAB308', '#EF4444']}
  percentageComplete={75}
  radius={100}
  strokeWidth={20}
  rotation={270}
/>
```

---

## Screen recordings

Other examples recordings for reference.

![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example1.gif)


![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example3.gif)


![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example5.gif)


![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example6.gif)

---

## Why it feels smooth at 60 FPS

- **Reanimated** updates a **shared value** on the UI worklet thread during `withTiming`.
- **Skia** reads that value through derived props (`start` / `end` trim, opacities)—drawing stays on the GPU path without React diffing every frame.
- React only re-renders when **your props/state** change (e.g. new target percentage). If you use **`CircularProgress.Text`** (optional), it also updates on the JS thread at a controlled step size when the eased value crosses your display step.

---

## Troubleshooting

| Issue | What to check |
| ----- | ------------- |
| Reanimated / worklet errors | Babel plugin present and **last** in `plugins`; clean Metro cache. |
| Skia / native mismatch | Peer versions aligned with Expo RN or your bare RN version. |
| `CircularProgress.Text` throws | Ensure it is nested **inside** `<CircularProgress>`. |

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) for workflow and how to open PRs.

---

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
