import * as React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CircularProgress,
  type CircularProgressRef,
} from 'react-native-progress-circle-gradient';

export default function App() {
  const [progress, setProgress] = React.useState(2);
  const progressRef = React.useRef<CircularProgressRef>(null);

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <CircularProgress
          ref={progressRef}
          backgroundColor={'#1F1B24'}
          radius={128}
          strokeWidth={20}
          percentageComplete={progress}
          colors={['#0000FF', '#00FF00', '#FF0000']}
          duration={1200}
          onAnimationFinish={() => {
            Alert.alert('Animation has finished!');
          }}
        >
          <CircularProgress.Text style={styles.label} />
        </CircularProgress>
        <View style={styles.spacer}></View>
        <View style={styles.buttons}>
          {[25, 50, 75, 100].map((amount) => (
            <Pressable
              key={amount}
              style={styles.button}
              onPress={() => setProgress(progress + amount)}
            >
              <Text style={styles.buttonText}>+{amount}%</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.buttons}>
          <Pressable
            style={styles.button}
            onPress={() => progressRef.current?.pause()}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => progressRef.current?.play()}
          >
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => {
              progressRef.current?.reset();
              setProgress(0);
            }}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
        </View>
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
  label: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  button: {
    backgroundColor: '#2A2A3A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 50,
  },
});
