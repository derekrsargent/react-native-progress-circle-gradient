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

type CircularProgressProps = {
  colors: string[];
  percentageComplete: number;
  radius: number;
  strokeWidth: number;
  backgroundColor?: string;
  duration?: number;
  granularity?: number;
};

## Props

| Prop | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| colors | The color hex values to be used for the angular gradient | String[] | N/A / true
| percentageComplete | Show file differences that haven't been staged |

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
![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example1.gif)

```js
 <CircularProgress
    backgroundColor={'#1F1B24'}
    radius={100}
    strokeWidth={20}
    percentageComplete={percentageComplete}
    colors={['#0000FF', '#FF0000', '#00FF00']}
/>
```
![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example2.gif)

```js
 <CircularProgress
    backgroundColor={'#1F1B24'}
    radius={100}
    strokeWidth={20}
    percentageComplete={percentageComplete}
    colors={['#0000FF', '#00FF00', '#0000FF']}
/>
```
![](https://github.com/derekrsargent/react-native-progress-circle-gradient/blob/main/example/assets/example3.gif)

## Roadmap

- Add support for children components (e.g. Text)
- Add support for when progress > 100%
- Add support for prop overloading 

## Steps to Create Package

Create library scaffolding using `npx create-react-native-library react-native-progress-circle-gradient`. And select the `JavaScript Library` option. When uploading a package to the npm registry it will first look at the `.gitignore` for files to exclude. You can also create a `.npmignore` file but note that will not be joined with the `.gitignore` file (it will now *only* look at the `.npmignore` file). The best way to tell npm would files to include is to list them in the `files` property in `package.json`. 

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
