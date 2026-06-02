import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Typography } from '../atoms/Typography';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const FormField = ({ label, error, style, ...props }: FormFieldProps) => {
  return (
    <View style={styles.container}>
      <Typography variant="caption" style={styles.label}>
        {label}
      </Typography>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#999999"
        {...props}
      />
      {error ? (
        <Typography variant="error">
          {error}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
});
