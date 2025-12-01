import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../styles/designSystem';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'grouped' | 'outlined';
  padding?: number;
  margin?: number;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = Spacing.cardPadding,
  margin = 0,
  onPress,
  title,
  subtitle,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = {
      borderRadius: BorderRadius.lg,
      padding,
      margin,
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          backgroundColor: Colors.systemBackground,
          borderWidth: 1,
          borderColor: Colors.separator,
          ...Shadows.card,
        };
      case 'grouped':
        return {
          ...baseStyle,
          backgroundColor: Colors.secondaryGroupedBackground,
          ...Shadows.small,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: Colors.systemBackground,
          borderWidth: 1,
          borderColor: Colors.systemGray6,
        };
      default:
        return baseStyle;
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress } : {};

  return (
    <CardComponent
      style={[styles.card, getCardStyle(), style]}
      {...cardProps}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 44,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.callout,
    color: Colors.secondaryLabel,
  },
  content: {
    flex: 1,
  },
});

export default Card;
