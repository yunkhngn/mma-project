import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface Props extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
}

export function PasswordField({ label, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
        {label}
      </Text>
      <View className="relative">
        <TextInput
          secureTextEntry={!visible}
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
          className="bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-12 py-4 text-gray-800 text-base"
          {...inputProps}
        />
        <TouchableOpacity
          onPress={() => setVisible(!visible)}
          className="absolute right-4 top-4"
          activeOpacity={0.7}
        >
          {visible
            ? <EyeOff size={20} color="#9ca3af" />
            : <Eye size={20} color="#9ca3af" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
