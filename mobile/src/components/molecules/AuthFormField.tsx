import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface Props extends TextInputProps {
  label: string;
}

export function AuthFormField({ label, ...inputProps }: Props) {
  return (
    <View>
      <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
        {label}
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-800 text-base"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        {...inputProps}
      />
    </View>
  );
}
