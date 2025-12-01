export const Colors = {
  // Primary Colors
  primary: '#CB3737',           // App accent color (red)
  primaryLight: '#D32F2F',      // Lighter variant
  primaryDark: '#8B0000',       // Darker variant
  
  // System Colors (Apple Human Interface Guidelines)
  systemBackground: '#FFFFFF',   // Pure white background
  secondarySystemBackground: '#F2F2F2',  // Light gray background
  tertiarySystemBackground: '#FFFFFF',   // White for cards
  
  // Grouped Background Colors
  groupedBackground: '#F2F2F2',
  secondaryGroupedBackground: '#FFFFFF',
  tertiaryGroupedBackground: '#F2F2F2',
  
  // Basic Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Label Colors (Apple HIG)
  label: '#000000',             // Primary text
  secondaryLabel: '#3C3C43',    // Secondary text (60% opacity)
  tertiaryLabel: '#3C3C4399',   // Tertiary text (30% opacity)
  quaternaryLabel: '#3C3C432E', // Quaternary text (18% opacity)
  placeholderText: '#3C3C434D', // Placeholder text (30% opacity)
  
  // Separator Colors
  separator: '#3C3C434A',       // Light separator (29% opacity)
  opaqueSeparator: '#C6C6C8',   // Opaque separator
  
  // Fill Colors
  systemFill: '#78788033',      // Primary fill (20% opacity)
  secondarySystemFill: '#78788028', // Secondary fill (16% opacity)
  tertiarySystemFill: '#7676801E',  // Tertiary fill (12% opacity)
  quaternarySystemFill: '#74748014', // Quaternary fill (8% opacity)
  
  // Standard Colors (Apple HIG)
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemIndigo: '#5856D6',
  systemOrange: '#FF9500',
  systemPink: '#FF2D92',
  systemPurple: '#AF52DE',
  systemRed: '#FF3B30',
  systemTeal: '#30B0C7',
  systemYellow: '#FFCC00',
  
  // System Gray Colors (Apple HIG)
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
  
  // Semantic Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
};

// Typography (Apple HIG)
export const Typography = {
  // Large Title
  largeTitle: {
    fontSize: 34,
    fontWeight: '400' as const,
    lineHeight: 41,
  },
  
  // Title Styles
  title1: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 25,
  },
  
  // Headline
  headline: {
    fontSize: 17,
    fontWeight: '600' as const, // Semibold
    lineHeight: 22,
  },
  
  // Body Styles
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  
  // Caption Styles
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
};

// Spacing (Apple HIG - 8pt grid system)
export const Spacing = {
  xs: 4,    // 0.5x
  sm: 8,    // 1x base unit
  md: 12,   // 1.5x
  lg: 16,   // 2x
  xl: 20,   // 2.5x
  xxl: 24,  // 3x
  xxxl: 32, // 4x
  
  // Apple HIG specific spacing
  cardPadding: 16,
  screenPadding: 16,
  sectionSpacing: 24,
  buttonPadding: 16,
  inputPadding: 16,
  
  // Component spacing
  iconPadding: 8,
  smallSpacing: 4,
  mediumSpacing: 8,
  largeSpacing: 16,
};

// Border Radius (Apple HIG)
export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10, // Apple standard
  xl: 12,
  xxl: 16,
  round: 50,
  
  // Apple HIG specific
  cornerRadiusSmall: 8,
  cornerRadiusMedium: 10,
  cornerRadiusLarge: 12,
  cornerRadiusExtraLarge: 16,
};

// Shadows (Apple HIG style)
export const Shadows = {
  // iOS-style shadows with proper elevation
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Component-specific shadows
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Layout (Apple HIG)
export const Layout = {
  // Navigation and system UI
  statusBarHeight: 44,
  navigationBarHeight: 44,
  tabBarHeight: 83,
  
  // Component dimensions (Apple HIG standards)
  buttonHeight: 44, // Apple standard touch target
  buttonHeightSmall: 28,
  inputHeight: 44,
  cardMinHeight: 44,
  
  // Touch targets (Apple HIG minimum 44x44pt)
  minTouchTarget: 44,
  iconTouchTarget: 44,
  
  // Screen dimensions
  screenSizes: {
    small: 320,
    medium: 375,
    large: 414,
    extraLarge: 768,
  },
  
  // Content margins
  contentMargin: 16,
  sectionMargin: 24,
  cardMargin: 16,
};

// Common component styles (Apple HIG)
export const ComponentStyles = {
  // Button styles
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Shadows.button,
    minHeight: Layout.buttonHeight,
  },
  
  secondaryButton: {
    backgroundColor: Colors.secondarySystemBackground,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Shadows.small,
    minHeight: Layout.buttonHeight,
    borderWidth: 1,
    borderColor: Colors.systemGray5,
  },
  
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: Layout.buttonHeightSmall,
  },
  
  // Card styles
  card: {
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.systemGray5,
  },
  
  groupedCard: {
    backgroundColor: Colors.secondaryGroupedBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    ...Shadows.small,
  },
  
  // Input styles
  input: {
    backgroundColor: Colors.systemBackground,
    borderWidth: 1,
    borderColor: Colors.systemGray5,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.inputPadding,
    paddingHorizontal: Spacing.inputPadding,
    ...Typography.body,
    color: Colors.label,
    ...Shadows.small,
    minHeight: Layout.inputHeight,
  },
  
  // Header styles
  header: {
    backgroundColor: Colors.systemBackground,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.lg,
    ...Shadows.small,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  
  // Tab bar styles
  tabBar: {
    backgroundColor: Colors.systemBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    ...Shadows.small,
    height: Layout.tabBarHeight,
  },
  
  // Modal styles
  modal: {
    backgroundColor: Colors.systemBackground,
    borderRadius: BorderRadius.xxl,
    padding: 0,
    ...Shadows.modal,
  },
  
  // List styles
  listItem: {
    backgroundColor: Colors.systemBackground,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    minHeight: Layout.buttonHeight,
  },
  
  // Navigation styles
  navigationBar: {
    backgroundColor: Colors.systemBackground,
    height: Layout.navigationBarHeight,
    paddingHorizontal: Spacing.screenPadding,
    ...Shadows.small,
  },
};

// Animation tokens (Apple HIG)
export const Animations = {
  // Spring animations
  spring: {
    tension: 100,
    friction: 8,
  },
  
  springGentle: {
    tension: 80,
    friction: 12,
  },
  
  springBouncy: {
    tension: 150,
    friction: 4,
  },
  
  // Timing animations
  easeInOut: {
    duration: 300,
    easing: 'ease-in-out',
  },
  
  easeOut: {
    duration: 250,
    easing: 'ease-out',
  },
  
  easeIn: {
    duration: 200,
    easing: 'ease-in',
  },
  
  // Standard durations
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  
  // Component-specific animations
  buttonPress: {
    duration: 150,
    easing: 'ease-out',
  },
  
  modalPresent: {
    duration: 350,
    easing: 'ease-out',
  },
  
  tabSwitch: {
    duration: 300,
    easing: 'ease-in-out',
  },
  
  cardHover: {
    duration: 200,
    easing: 'ease-out',
  },
};

// Helper functions
export const getTextColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'quaternary' = 'primary') => {
  switch (variant) {
    case 'primary':
      return Colors.label;
    case 'secondary':
      return Colors.secondaryLabel;
    case 'tertiary':
      return Colors.tertiaryLabel;
    case 'quaternary':
      return Colors.quaternaryLabel;
    default:
      return Colors.label;
  }
};

export const getBackgroundColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'grouped' = 'primary') => {
  switch (variant) {
    case 'primary':
      return Colors.systemBackground;
    case 'secondary':
      return Colors.secondarySystemBackground;
    case 'tertiary':
      return Colors.tertiarySystemBackground;
    case 'grouped':
      return Colors.groupedBackground;
    default:
      return Colors.systemBackground;
  }
};

export const getShadowForElevation = (elevation: number) => {
  switch (elevation) {
    case 1:
      return Shadows.small;
    case 2:
      return Shadows.medium;
    case 4:
      return Shadows.large;
    case 8:
      return Shadows.modal;
    default:
      return Shadows.none;
  }
};

// Theme provider interface
export interface ThemeContextType {
  theme: typeof Colors;
  isDark: boolean;
  toggleTheme: () => void;
}
