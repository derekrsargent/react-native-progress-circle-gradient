# react-native-progress-circle-gradient

An animated progress circle with an angular gradient.  

This project is inspired by this [YouTube](https://www.youtube.com/watch?v=7SCzL-XnfUU) tutorial.

## Installation (not yet on npm)

```sh
npm install react-native-progress-circle-gradient
```

or 

```sh
yarn add react-native-progress-circle-gradient
```

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
/>
```
[](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example1.gif)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
