import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Jar, Note, DurationOption } from '@/types';

const JARS_KEY = 'gratitude_jars';
const NOTES_KEY = 'gratitude_notes';
const ONBOARDED_KEY = 'gratitude_onboarded';

function generateId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

export const [GratitudeProvider, useGratitude] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [jars, setJars] = useState<Jar[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);

  const jarsQuery = useQuery({
    queryKey: ['jars'],
    queryFn: async () => {
      console.log('[GratitudeProvider] Loading jars from AsyncStorage');
      const stored = await AsyncStorage.getItem(JARS_KEY);
      return stored ? (JSON.parse(stored) as Jar[]) : [];
    },
  });

  const notesQuery = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      console.log('[GratitudeProvider] Loading notes from AsyncStorage');
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      return stored ? (JSON.parse(stored) as Note[]) : [];
    },
  });

  const onboardedQuery = useQuery({
    queryKey: ['onboarded'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ONBOARDED_KEY);
      return stored === 'true';
    },
  });

  useEffect(() => {
    if (jarsQuery.data) {
      setJars(jarsQuery.data);
    }
  }, [jarsQuery.data]);

  useEffect(() => {
    if (notesQuery.data) {
      setNotes(notesQuery.data);
    }
  }, [notesQuery.data]);

  useEffect(() => {
    if (onboardedQuery.data !== undefined) {
      setHasOnboarded(onboardedQuery.data);
    }
  }, [onboardedQuery.data]);

  useEffect(() => {
    if (!jarsQuery.isLoading && !notesQuery.isLoading && onboardedQuery.data !== undefined) {
      setIsReady(true);
    }
  }, [jarsQuery.isLoading, notesQuery.isLoading, onboardedQuery.data]);

  const saveJars = useCallback(async (updated: Jar[]) => {
    await AsyncStorage.setItem(JARS_KEY, JSON.stringify(updated));
  }, []);

  const saveNotes = useCallback(async (updated: Note[]) => {
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    setHasOnboarded(true);
    queryClient.setQueryData(['onboarded'], true);
  }, [queryClient]);

  const createJar = useCallback((durationMinutes: DurationOption) => {
    console.log('[GratitudeProvider] Creating jar with duration:', durationMinutes);
    const now = new Date();
    const unlockDate = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const newJar: Jar = {
      id: generateId(),
      startDate: now.toISOString(),
      unlockDate: unlockDate.toISOString(),
      durationMinutes,
      isUnlocked: false,
      createdAt: now.toISOString(),
    };
    const updated = [...jars, newJar];
    setJars(updated);
    void saveJars(updated);
    return newJar;
  }, [jars, saveJars]);

  const getActiveJar = useCallback((): Jar | null => {
    return jars.find(j => !j.isUnlocked) ?? null;
  }, [jars]);

  const addNote = useCallback((text: string) => {
    const active = jars.find(j => !j.isUnlocked) ?? null;
    if (!active) return null;
    console.log('[GratitudeProvider] Adding note to jar:', active.id);
    const newNote: Note = {
      id: generateId(),
      jarId: active.id,
      text,
      createdAt: new Date().toISOString(),
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    void saveNotes(updated);
    return newNote;
  }, [jars, notes, saveNotes]);

  const unlockJar = useCallback((jarId: string) => {
    console.log('[GratitudeProvider] Unlocking jar:', jarId);
    const updated = jars.map(j => j.id === jarId ? { ...j, isUnlocked: true } : j);
    setJars(updated);
    void saveJars(updated);
  }, [jars, saveJars]);

  const updateJarDuration = useCallback((jarId: string, newDurationMinutes: DurationOption) => {
    console.log('[GratitudeProvider] Updating jar duration:', jarId, 'to', newDurationMinutes);
    const updated = jars.map(j => {
      if (j.id !== jarId) return j;
      const newUnlockDate = new Date(new Date(j.startDate).getTime() + newDurationMinutes * 60 * 1000);
      return { ...j, durationMinutes: newDurationMinutes, unlockDate: newUnlockDate.toISOString() };
    });
    setJars(updated);
    void saveJars(updated);
  }, [jars, saveJars]);

  const getNotesForJar = useCallback((jarId: string): Note[] => {
    return notes.filter(n => n.jarId === jarId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [notes]);

  const getArchivedJars = useCallback((): Jar[] => {
    return jars.filter(j => j.isUnlocked).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [jars]);

  const clearAllData = useCallback(async () => {
    console.log('[GratitudeProvider] Clearing all data');
    await AsyncStorage.multiRemove([JARS_KEY, NOTES_KEY, ONBOARDED_KEY]);
    setJars([]);
    setNotes([]);
    setHasOnboarded(false);
    queryClient.clear();
  }, [queryClient]);

  return useMemo(() => ({
    jars,
    notes,
    isReady,
    hasOnboarded,
    isLoading: jarsQuery.isLoading || notesQuery.isLoading,
    completeOnboarding,
    createJar,
    addNote,
    unlockJar,
    updateJarDuration,
    getActiveJar,
    getNotesForJar,
    getArchivedJars,
    clearAllData,
  }), [jars, notes, isReady, hasOnboarded, jarsQuery.isLoading, notesQuery.isLoading, completeOnboarding, createJar, addNote, unlockJar, updateJarDuration, getActiveJar, getNotesForJar, getArchivedJars, clearAllData]);
});
