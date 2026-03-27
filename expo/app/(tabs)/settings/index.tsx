import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Heart, Sparkles, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { triggerHaptic } from '@/utils/helpers';

export default function SettingsScreen() {
  const { jars, notes, clearAllData } = useGratitude();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This will permanently delete all your jars and notes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('medium');
            void clearAllData();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerTitleStyle: {
            fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
            fontWeight: '700',
            color: Colors.textPrimary,
          },
          headerStyle: {
            backgroundColor: Colors.cream,
          },
        }}
      />
      <LinearGradient
        colors={[Colors.cream, Colors.sand]}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Sparkles color={Colors.honey} size={18} />
                <Text style={styles.statNumber}>{jars.length}</Text>
                <Text style={styles.statLabel}>Jars</Text>
              </View>
              <View style={styles.statCard}>
                <Heart color={Colors.roseGold} size={18} />
                <Text style={styles.statNumber}>{notes.length}</Text>
                <Text style={styles.statLabel}>Notes</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearData}
              activeOpacity={0.7}
              testID="clear-data-button"
            >
              <Trash2 color={Colors.danger} size={17} />
              <Text style={styles.dangerButtonText}>Clear All Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Heart color={Colors.roseGold} size={13} fill={Colors.roseGold} />
            <Text style={styles.footerText}>Made with love</Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textLight,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(196, 75, 75, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(196, 75, 75, 0.1)',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 'auto' as const,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
