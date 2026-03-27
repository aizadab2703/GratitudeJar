import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useGratitude } from '@/providers/GratitudeProvider';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/helpers';
import JarVisualization from '@/components/JarVisualization';
import AmbientParticles from '@/components/AmbientParticles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { completeOnboarding } = useGratitude();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const jarScale = useRef(new Animated.Value(0.6)).current;
  const jarY = useRef(new Animated.Value(30)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;
  const decorFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(jarScale, {
          toValue: 1,
          tension: 35,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(jarY, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(decorFade, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, jarScale, jarY, buttonFade, buttonSlide, taglineFade, taglineSlide, decorFade]);

  const handleGetStarted = async () => {
    triggerHaptic('success');
    await completeOnboarding();
    router.replace('/');
  };

  return (
    <LinearGradient
      colors={[Colors.cream, Colors.sand, Colors.parchment, Colors.gradientSunrise]}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      <AmbientParticles />

      <Animated.View style={[styles.decorCircle1, { opacity: decorFade }]} />
      <Animated.View style={[styles.decorCircle2, { opacity: decorFade }]} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.jarSection,
            {
              opacity: fadeAnim,
              transform: [
                { scale: jarScale },
                { translateY: jarY },
              ],
            },
          ]}
        >
          <JarVisualization fillPercent={35} size={220} />
        </Animated.View>

        <Animated.View
          style={[
            styles.titleSection,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.appName}>GratitudeJar</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.taglineSection,
            {
              opacity: taglineFade,
              transform: [{ translateY: taglineSlide }],
            },
          ]}
        >
          <Text style={styles.subtitle}>
            Capture the good things.{'\n'}Open them when the time comes.
          </Text>
          <View style={styles.decorDivider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: buttonFade,
              transform: [{ translateY: buttonSlide }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
            testID="get-started-button"
          >
            <LinearGradient
              colors={[Colors.terracotta, Colors.terracottaDark]}
              style={styles.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <ArrowRight color="#FFFFFF" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(212, 162, 78, 0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(194, 120, 92, 0.06)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  jarSection: {
    marginBottom: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  taglineSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 25,
    letterSpacing: 0.2,
  },
  decorDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  dividerLine: {
    width: 32,
    height: 1,
    backgroundColor: Colors.terracottaLight,
    opacity: 0.4,
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.terracottaLight,
    opacity: 0.5,
  },
  buttonSection: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.terracottaDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
