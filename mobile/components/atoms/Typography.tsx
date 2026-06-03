import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'body' | 'caption' | 'error';
  color?: string;
}

export const Typography = ({ variant = 'body', color, style, children, ...props }: TypographyProps) => {
  const textStyle = [
    styles.base,
    styles[variant],
    color ? { color } : null,
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: '#1A1A1A',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    color: '#666666',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
