import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '../../styles/designSystem';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'medium',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  style,
  ...textInputProps
}) => {
  const getInputStyle = (): TextStyle => {
    const baseStyle = {
      ...Typography.body,
      borderRadius: BorderRadius.md,
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          backgroundColor: Colors.systemBackground,
          borderColor: error ? Colors.error : Colors.systemGray5,
          ...Shadows.small,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: Colors.systemBackground,
          borderColor: error ? Colors.error : Colors.systemGray4,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: Colors.secondarySystemBackground,
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          minHeight: Layout.inputHeight,
          borderWidth: 1,
          borderColor: Colors.systemGray5,
          backgroundColor: Colors.systemBackground,
          borderRadius: BorderRadius.lg,
        };
      case 'medium':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: Layout.inputHeight,
          borderWidth: 1,
          borderColor: Colors.systemGray5,
          backgroundColor: Colors.systemBackground,
          borderRadius: BorderRadius.lg,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: Layout.inputHeight + 6, // borderWidth 2px 제거
          borderWidth: 1,
          borderColor: Colors.systemGray5,
          backgroundColor: Colors.systemBackground,
          borderRadius: BorderRadius.lg,
          ...Shadows.small,
        };
      default:
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: Layout.inputHeight,
        };
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={[styles.inputContainer, getSizeStyle()]}>
        {leftIcon && (
          <View style={styles.iconContainer}>{leftIcon}</View>
        )}
        
        <TextInput
          style={[
            styles.input,
            getInputStyle(),
            inputStyle,
            style,
          ]}
          placeholderTextColor={Colors.placeholderText}
          {...textInputProps}
        />
        
        {rightIcon && (
          <View style={styles.iconContainer}>{rightIcon}</View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...Typography.callout,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: Colors.label,
  },
  iconContainer: {
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.caption1,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  helperText: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
  },
});

export default Input;
