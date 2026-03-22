# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

### 1. Install dependencies (npm)

From the **repository root**:

```sh
npm install
```

The **example app** is a separate package. Install its dependencies too:

```sh
cd example
npm install
cd ..
```

This repo uses **npm** for development. Use the same Node version as the project expects (see `.nvmrc` if present).

### 2. Run the example app (Expo)

The example lives in [`example/`](./example/). It uses **Expo** with **native modules** (Skia, Reanimated), so you typically use a **development build** (`expo run:*`), not Expo Go alone.

All commands below are run from the **`example`** directory unless noted.

#### Generate native `ios/` and `android/` folders — `expo prebuild`

`expo prebuild` creates or updates the **native Xcode / Gradle projects** from your Expo config (`app.json`, plugins, etc.). You need this before `expo run:ios` / `expo run:android` if those folders are missing or after changing native-related config.

```sh
cd example
npx expo prebuild
```

Useful variants:

| Command | When to use |
| -------- | ----------- |
| `npx expo prebuild` | First-time setup, or after config changes that affect native code. |
| `npx expo prebuild --clean` | Regenerate native projects from scratch (removes existing `ios/` / `android/` first). Use when native deps or plugins change and you hit odd build issues. |
| `npx expo prebuild --platform ios` | Only generate the **iOS** project. |
| `npx expo prebuild --platform android` | Only generate the **Android** project. |

#### Start Metro (JavaScript bundler)

```sh
cd example
npm start
```

This runs `expo start`. Press `i` for iOS simulator or `a` for Android emulator if you already have a dev build installed—or use the run commands below to build and launch in one step.

#### Build and run on iOS (simulator or device)

```sh
cd example
npx expo run:ios
```

This compiles the native app, installs it, and starts Metro. First run can take several minutes.

Optional:

```sh
npx expo run:ios --device          # physical iPhone (requires signing setup in Xcode)
npx expo run:ios --configuration Release
```

#### Build and run on Android

```sh
cd example
npx expo run:android
```

#### Web (optional)

```sh
cd example
npm run web
```

### 3. Library code and fast refresh

While Metro is running, edits under [`src/`](./src/) in the **root** package are picked up by the example app (see `example/metro.config.js` for how the library is linked). **JavaScript/TypeScript changes** usually hot reload without a native rebuild.

If you change **native** code, Expo config, or versions of Skia/Reanimated/etc., run **`npx expo prebuild`** again if needed, then **`npx expo run:ios`** / **`npx expo run:android`** to rebuild.

### 4. Quality checks (from repository root)

TypeScript:

```sh
npm run typecheck
```

ESLint:

```sh
npm run lint
```

Auto-fix where possible:

```sh
npm run lint -- --fix
```

Tests:

```sh
npm test
```

---

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes to documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and tests

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting, and [Jest](https://jestjs.io/) for testing.

Our pre-commit hooks verify that the linter and tests pass when committing.

### Publishing to npm

We use [release-it](https://github.com/release-it/release-it) to make it easier to publish new versions. It handles common tasks like bumping version based on semver, creating tags and releases, etc.

From the **repository root**:

```sh
npm run release
```

### Root `package.json` scripts

| Script | Description |
| ------ | ----------- |
| `npm run typecheck` | Type-check with TypeScript. |
| `npm run lint` | Lint with ESLint. |
| `npm test` | Run unit tests with Jest. |
| `npm run release` | Publish / version with release-it (maintainers). |

### Example `package.json` scripts (`example/`)

| Script | Description |
| ------ | ----------- |
| `npm start` | `expo start` — Metro / dev server. |
| `npm run ios` | `expo run:ios` — same as `npx expo run:ios` with local CLI resolution. |
| `npm run android` | `expo run:android`. |
| `npm run web` | `expo start --web`. |

---

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.

## Steps to create package

Created library scaffolding using `npx create-react-native-library react-native-progress-circle-gradient` and select the `JavaScript Library` option. When uploading a package to the npm registry it will first look at the `.gitignore` for files to exclude. You can also create a `.npmignore` file but note that will not be joined with the `.gitignore` file (it will now _only_ look at the `.npmignore` file). The best way to tell npm which files to include is to list them in the `files` property of `package.json`.
