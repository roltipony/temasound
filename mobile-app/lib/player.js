import { Audio } from 'expo-av';
import { create } from 'zustand';
import { SERVER_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let soundObject = null;

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  isVisible: false,

  playSong: async (song, queue = null, index = 0) => {
    const { stopCurrentSound } = get();
    await stopCurrentSound();

    set({ isLoading: true, currentSong: song, isVisible: true });
    if (queue) set({ queue, queueIndex: index });

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const token = await AsyncStorage.getItem('token');
      const uri = `${SERVER_URL}/api/stream/${song.id}`;

      soundObject = new Audio.Sound();
      await soundObject.loadAsync(
        { uri, headers: { Authorization: `Bearer ${token}` } },
        { shouldPlay: true }
      );

      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        set({
          isPlaying: status.isPlaying,
          position: status.positionMillis || 0,
          duration: status.durationMillis || 0,
          isLoading: false,
        });
        if (status.didJustFinish) get().playNext();
      });

      set({ isPlaying: true, isLoading: false });
    } catch (e) {
      console.error('Playback error:', e);
      set({ isLoading: false });
    }
  },

  stopCurrentSound: async () => {
    if (soundObject) {
      try {
        await soundObject.unloadAsync();
      } catch {}
      soundObject = null;
    }
    set({ isPlaying: false, position: 0, duration: 0 });
  },

  togglePlayPause: async () => {
    if (!soundObject) return;
    const { isPlaying } = get();
    if (isPlaying) {
      await soundObject.pauseAsync();
    } else {
      await soundObject.playAsync();
    }
  },

  seek: async (ms) => {
    if (soundObject) await soundObject.setPositionAsync(ms);
  },

  playNext: () => {
    const { queue, queueIndex, playSong } = get();
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      set({ queueIndex: nextIndex });
      playSong(queue[nextIndex], queue, nextIndex);
    }
  },

  playPrev: () => {
    const { queue, queueIndex, playSong, position, seek } = get();
    if (position > 3000) {
      seek(0);
      return;
    }
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      set({ queueIndex: prevIndex });
      playSong(queue[prevIndex], queue, prevIndex);
    }
  },
}));
