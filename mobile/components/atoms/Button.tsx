import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ title, onPress, disabled = false, loading = false, variant = 'primary' }: ButtonProps) => {
  const isInteractionDisabled = disabled || loading;

  const buttonStyles = [
    styles.baseButton,
    styles[`${variant}Button`],
    isInteractionDisabled && styles.disabledButton,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
  ];

  const handlePress = (event: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress(event);
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={isInteractionDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#007AFF' : '#FFFFFF'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#E6F4FE',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  outlineText: {
    color: '#007AFF',
  },
});
