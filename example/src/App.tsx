import * as React from 'react';

import { StyleSheet, View, Pressable, Text } from 'react-native';
import { CircularProgress } from 'react-native-progress-circle-gradient';

export default function App() {
  const [progress, setProgress] = React.useState(3);

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <CircularProgress
          backgroundColor={'#1F1B24'}
          radius={128}
          strokeWidth={20}
          percentageComplete={progress}
          colors={['#0000FF', '#00FF00']}
        />
        <Pressable onPress={() => setProgress(progress + 25)}>
          <Text style={styles.text}>Press me</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  progress: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    color: '#121224',
    marginTop: 100,
  },
});
