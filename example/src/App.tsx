import * as React from 'react';

import { StyleSheet, View, Pressable, Text } from 'react-native';
import { CircularProgress } from 'react-native-progress-circle-gradient';

export default function App() {
  const [progress, setProgress] = React.useState(50);

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <CircularProgress
          backgroundColor={'aliceblue'}
          radius={128}
          strokeWidth={20}
          percentageComplete={progress}
          colors={['#0000FF', '#00FF00']}
        />
        <Pressable onPress={() => setProgress(progress + 10)}>
          <Text>Press me</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  progress: {
    flex: 1,
    marginTop: 100,
    marginLeft: 50,
  },
  image: {
    height: 400,
    width: 100,
    position: 'absolute',
  },
});
