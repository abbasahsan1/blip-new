import { setAudioModeAsync } from 'expo-audio';

let isConfigured = false;

/**
 * Configure global audio session for background playback and silent-mode bypass using expo-audio.
 * Critical for uninterrupted hands-free commuter playback with screen locked.
 */
export async function setupAudioMode(): Promise<void> {
  if (isConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
    isConfigured = true;
  } catch (err) {
    console.warn('Audio mode setup error:', err);
  }
}
