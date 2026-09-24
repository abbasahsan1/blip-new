import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

let isConfigured = false;

/**
 * Configure global audio session for background playback and silent-mode bypass.
 * Critical for uninterrupted hands-free commuter playback.
 */
export async function setupAudioMode(): Promise<void> {
  if (isConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });
    isConfigured = true;
  } catch (err) {
    console.warn('Audio mode setup error:', err);
  }
}
