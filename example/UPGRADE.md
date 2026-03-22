# Upgrade Guide: Expo SDK 48 → 55 & Skia v0.1 → v2

This document covers all changes made to upgrade the example project alongside the library's migration from `@shopify/react-native-skia` v0.1 to v2.

## Prerequisites

### Node.js >= 20.19.4

Expo SDK 55 and React Native 0.83 require Node.js 20 or later. The `.nvmrc` at the project root specifies `20.19.4`. Older Node versions will fail with errors like `configs.toReversed is not a function` because newer Metro uses JavaScript APIs that don't exist in Node 18.

```bash
nvm install 20.19.4
nvm use 20.19.4
```

---

## 1. Library changes (`package.json` at root)

### Version bump to 2.0.0

This is a semver major release because the peer dependency requirements changed and the `granularity` prop was removed.

### `@shopify/react-native-skia` and `color-interpolate` removed from `dependencies`

Skia is now a peer dependency instead of a direct dependency. This prevents version conflicts when the consuming app also installs Skia. The `color-interpolate` package is no longer needed because `SweepGradient` handles color interpolation natively.

### New `peerDependencies`

```json
"peerDependencies": {
  "@shopify/react-native-skia": ">=2.0.0",
  "react": ">=19.0.0",
  "react-native": ">=0.78.0",
  "react-native-reanimated": ">=3.19.1"
}
```

Skia v2 requires React 19+ and React Native 0.78+. The library now uses Reanimated for animations instead of Skia's deprecated built-in animation system, so Reanimated becomes a required peer dependency.

### `packageManager` field fix

Changed from `"^yarn@1.22.15"` to `"yarn@1.22.15"`. The `packageManager` field does not support semver range specifiers — it requires an exact version.

---

## 2. Example app dependency updates (`example/package.json`)

### Expo SDK 48 → 55

| Package | Before | After | Why |
|---------|--------|-------|-----|
| `expo` | `~48.0.15` | `^55.0.8` | Latest Expo SDK |
| `react` | `18.2.0` | `19.2.0` | Required by Skia v2 and Expo SDK 55 |
| `react-dom` | `18.2.0` | `19.2.0` | Must match `react` version |
| `react-native` | `0.71.14` | `0.83.2` | Required by Skia v2 and Expo SDK 55 |
| `expo-status-bar` | `~1.4.4` | `~2.2.3` | Compatible with Expo SDK 55 |
| `react-native-web` | `~0.18.10` | `~0.20.0` | v0.19 only supports React 18; v0.20+ adds React 19 support |

### New dependencies added

| Package | Version | Why |
|---------|---------|-----|
| `@shopify/react-native-skia` | `^2.5.3` | The library declares it as a peer dependency; the example app must install it |
| `react-native-reanimated` | `~4.2.3` | The library now uses Reanimated for animations; Expo SDK 55 ships with Reanimated v4 |

### Removed devDependencies

| Package | Why |
|---------|-----|
| `@expo/webpack-config` | Expo SDK 55 dropped webpack-based web bundling in favor of Metro for all platforms |
| `babel-loader` | Only needed for webpack; no longer used |

---

## 3. Metro config changes (`example/metro.config.js`)

### Removed `exclusionList` import

```diff
-const exclusionList = require('metro-config/src/defaults/exclusionList');
```

The internal path `metro-config/src/defaults/exclusionList` is no longer exported by newer versions of `metro-config`. Metro's `blockList` resolver option now accepts an array of RegExp directly, so the `exclusionList` wrapper function is unnecessary.

### Removed `escape-string-regexp` import

```diff
-const escape = require('escape-string-regexp');
```

Replaced with an inline regex escape to remove the external dependency:

```js
path.join(root, 'node_modules', m).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
```

### `blacklistRE` → `blockList`

```diff
-blacklistRE: exclusionList(modules.map(...)),
+blockList: modules.map(...),
```

`blacklistRE` was renamed to `blockList` in newer Metro versions. The old name still works as an alias in some versions but `blockList` is the canonical name going forward.

---

## 4. Babel config changes (`example/babel.config.js`)

### Added Reanimated babel plugin

```diff
 plugins: [
   ['module-resolver', { ... }],
+  'react-native-reanimated/plugin',
 ],
```

Reanimated requires its Babel plugin to transform worklet functions (code that runs on the UI thread). This plugin must be listed **last** in the plugins array. Without it, Reanimated will throw runtime errors about worklets not being defined.

---

## 5. App config changes (`example/app.json`)

### Removed `assetBundlePatterns`

```diff
-"assetBundlePatterns": ["**/*"],
```

This field is deprecated in newer Expo SDK versions and is no longer needed.

---

## 6. Deleted files

### `example/webpack.config.js`

Expo SDK 55 uses Metro for all platforms including web. The webpack config and its related dev dependencies (`@expo/webpack-config`, `babel-loader`) are no longer used.

---

## 7. Library source changes (`src/CircularProgress.tsx`)

### Replaced Skia animation API with Reanimated

| Before (Skia v0.1) | After (Reanimated) | Why |
|---------------------|---------------------|-----|
| `useValue(0)` | `useSharedValue(0)` | `useValue` was removed in Skia v2 |
| `runTiming(state, target, config)` | `withTiming(target, config)` | `runTiming` was removed in Skia v2 |
| `Easing` from Skia | `Easing` from Reanimated | Skia no longer exports easing functions |
| `animationState.addListener(cb)` | `useAnimatedReaction(() => ..., cb)` | Reanimated's reactive pattern for watching shared value changes |

### Replaced imperative `Drawing` with declarative components

The old approach used the `Drawing` component with an imperative callback that manually drew hundreds of line segments with individual linear gradients to simulate an angular gradient. This had several problems:

- Required a `setTimeout(() => {}, 0)` hack to prevent janky rendering
- Recreated expensive paint/shader objects on every render with no memoization
- The `Drawing` component was removed in Skia v2

The new approach uses:

- **`Path` with `start`/`end` trim** — Skia's declarative path trimming to show partial progress (0 to 1)
- **`SweepGradient`** — A native angular gradient shader applied directly to the path, replacing manual line segments and the `color-interpolate` dependency
- **Two `Path` layers** — First layer handles 0–100% with the sweep gradient, second layer handles 100–200% with the last color in the gradient
- **`useMemo`** — Memoizes the Skia path object so it isn't recreated on every render
- **`useDerivedValue`** — Derives animated trim values from the progress shared value on the UI thread

### Replaced `Mask` background with stroked `Path`

The old approach used a `Mask` component with a luminance mask and a filled `Circle` to create the background ring. The new approach simply draws a stroked `Path` with the background color underneath the progress layers, achieving the same visual result with less complexity.

### Bug fixes

- **`convertDegreesToRadians`** had `% 360` applied to a radians result (should have been `% (2 * PI)`, but was unnecessary altogether). Replaced with a direct calculation: `((rotation - 90) * Math.PI) / 180`.
- **Canvas size** changed from `radius * 2 + 2` (unexplained magic number) to `radius * 2` (the exact required size based on stroke geometry).

### Removed `granularity` prop

This prop controlled how many line segments were drawn to approximate the angular gradient. With `SweepGradient` handling color interpolation at the GPU level, granularity is no longer a concept.
