import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SocialButton({ label, onPress, loading = false, disabled = false }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className="border border-gray-200 py-4 rounded-full flex-row justify-center items-center gap-x-2"
    >
      {loading
        ? <ActivityIndicator color="#1f2937" />
        : <Text className="text-gray-800 font-semibold text-base">{label}</Text>}
    </TouchableOpacity>
  );
}
