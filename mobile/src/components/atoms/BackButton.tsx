import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface Props {
  onPress: () => void;
}

export function BackButton({ onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button} activeOpacity={0.75}>
      <ArrowLeft size={20} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 56,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
});
