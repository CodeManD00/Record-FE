import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '../../styles/designSystem';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = {
      borderRadius: BorderRadius.lg,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? Colors.systemGray3 : Colors.primary,
          ...Shadows.button,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: Colors.secondarySystemBackground,
          borderWidth: 1,
          borderColor: Colors.systemGray5,
          ...Shadows.small,
        };
      case 'tertiary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = {
      ...Typography.body,
      fontWeight: '400' as const,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: disabled ? Colors.systemGray : Colors.white,
        };
      case 'secondary':
        return {
          ...baseTextStyle,
          color: disabled ? Colors.systemGray : Colors.label,
        };
      case 'tertiary':
        return {
          ...baseTextStyle,
          color: disabled ? Colors.systemGray : Colors.primary,
        };
      default:
        return baseTextStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          minHeight: Layout.buttonHeightSmall,
        };
      case 'medium':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: Layout.buttonHeight,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: Layout.buttonHeight + 8,
        };
      default:
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: Layout.buttonHeight,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginHorizontal: Spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
