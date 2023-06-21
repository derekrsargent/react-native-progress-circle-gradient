# react-native-progress-circle-gradient

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![Version](https://img.shields.io/npm/v/react-native-progress-circle-gradient.svg)](https://www.npmjs.com/package/react-native-progress-circle-gradient)
[![npm](https://img.shields.io/npm/dt/react-native-progress-circle-gradient.svg)](https://www.npmjs.com/package/react-native-progress-circle-gradient)

An animated progress circle with an angular gradient. The differentiator between this package and other React Native animated circular progress charts with a gradient is that the start color can be different than the stop color.

This package has only 2 dependencies (_@shopify/react-native-skia_ and _color-interpolate_). It has 0 peer dependencies and so does **not** require _react-native-reanimated_ to also be installed, linked and configured for your project.

This project is inspired by this [YouTube](https://www.youtube.com/watch?v=7SCzL-XnfUU) tutorial.

## Installation

```sh
npm install react-native-progress-circle-gradient
```

or

```sh
yarn add react-native-progress-circle-gradient
```

## Props

| Prop               | Description                                                                          | Type     | Default   | Required |
| ------------------ | ------------------------------------------------------------------------------------ | -------- | --------- | -------- |
| colors             | The color hex values array to be used for the angular gradient                       | String[] | N/A       | ✓        |
| backgroundColor    | The color hex value for the remaining progress                                       | String   | '#F0F8FF' |          |
| duration           | The duration of the animation in milliseconds                                        | Number   | 1250      |          |
| easing  |          | The easing options for the animation: 'cubic', 'ease', 'linear', 'quad'              | String   | 1250      |          |
| granularity        | Smaller progress circle charts can use a smaller granularity to increase performance | Number   | 200       |          |
| onAnimationFinish  | Callback for when animation reaches 100%                                             | Function | N/A       |          |
| percentageComplete | The percentage of progress completed ranging from 0-100                              | Number   | 0         |          |
| radius             | The radius of the progress circle in points, measured from the center of the stroke  | Number   | 100       |          |
| rotation           | The rotation of the progress circle in degrees                                       | Number   | 0         |          |
| strokeWidth        | The thickness of the progress circle                                                 | Number   | 30        |          |

## Usage

```js
import { CircularProgress } from 'react-native-progress-circle-gradient';

// ...

<CircularProgress
  backgroundColor={'#1F1B24'}
  radius={100}
  strokeWidth={20}
  percentageComplete={percentageComplete}
  colors={['#0000FF', '#00FF00']}
/>;
```

![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example1.gif)

```js
import { CircularProgress } from 'react-native-progress-circle-gradient';

// ...

<CircularProgress
  backgroundColor={'#1F1B24'}
  radius={128}
  strokeWidth={20}
  percentageComplete={progress}
  colors={['#0000FF', '#00FF00']}
  duration={3000}
  onAnimationFinish={() => {
    Alert.alert('Animation has finished!');
  }}
/>;
```

![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example6.gif)

```js
<CircularProgress
  backgroundColor={'#1F1B24'}
  radius={100}
  strokeWidth={20}
  percentageComplete={percentageComplete}
  colors={['#0000FF', '#00FF00', '#FF0000']}
/>
```

![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example5.gif)

```js
<CircularProgress
  backgroundColor={'#1F1B24'}
  radius={100}
  strokeWidth={20}
  percentageComplete={percentageComplete}
  colors={['#0000FF', '#00FF00', '#0000FF']}
  rotation={270}
/>
```

![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example3.gif)

## Roadmap

- Add support for text once default system fonts become available in [this PR](https://github.com/Shopify/react-native-skia/issues/1249)
- Add support for children components

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
