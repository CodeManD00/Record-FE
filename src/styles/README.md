# Design System Documentation

## Overview

This design system is based on Apple's Human Interface Guidelines (HIG) and provides a comprehensive set of design tokens, components, and utilities for the Record app.

## Table of Contents

- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Shadows](#shadows)
- [Layout](#layout)
- [Animations](#animations)
- [Component Styles](#component-styles)
- [UI Components](#ui-components)

## Colors

### Primary Colors
- `primary`: #CB3737 (App accent color - red)
- `primaryLight`: #D32F2F
- `primaryDark`: #8B0000

### System Colors (Apple HIG)
- `systemBackground`: #FFFFFF (Pure white background)
- `secondarySystemBackground`: #F2F2F2 (Light gray background)
- `tertiarySystemBackground`: #FFFFFF (White for cards)

### Grouped Background Colors
- `groupedBackground`: #F2F2F2
- `secondaryGroupedBackground`: #FFFFFF
- `tertiaryGroupedBackground`: #F2F2F2

### Text Colors
- `label`: #000000 (Primary text)
- `secondaryLabel`: #3C3C43 (60% opacity)
- `tertiaryLabel`: #3C3C4399 (30% opacity)
- `quaternaryLabel`: #3C3C432E (18% opacity)
- `placeholderText`: #3C3C434D (30% opacity)

### Semantic Colors
- `success`: #34C759
- `warning`: #FF9500
- `error`: #FF3B30
- `info`: #007AFF

### System Colors (Apple HIG Standard)
- `systemBlue`: #007AFF
- `systemGreen`: #34C759
- `systemIndigo`: #5856D6
- `systemOrange`: #FF9500
- `systemPink`: #FF2D92
- `systemPurple`: #AF52DE
- `systemRed`: #FF3B30
- `systemTeal`: #30B0C7
- `systemYellow`: #FFCC00

## Typography

All typography follows Apple HIG standards with proper font weights and line heights.

### Display
- `largeTitle`: 34pt, Regular, 41pt line height

### Titles
- `title1`: 28pt, Regular, 34pt line height
- `title2`: 22pt, Regular, 28pt line height
- `title3`: 20pt, Regular, 25pt line height

### Headline
- `headline`: 17pt, Semibold, 22pt line height

### Body
- `body`: 17pt, Regular, 22pt line height
- `callout`: 16pt, Regular, 21pt line height
- `subheadline`: 15pt, Regular, 20pt line height
- `footnote`: 13pt, Regular, 18pt line height

### Captions
- `caption1`: 12pt, Regular, 16pt line height
- `caption2`: 11pt, Regular, 13pt line height

## Spacing

Based on Apple HIG 8pt grid system.

### Scale
- `xs`: 4pt (0.5x)
- `sm`: 8pt (1x base unit)
- `md`: 12pt (1.5x)
- `lg`: 16pt (2x)
- `xl`: 20pt (2.5x)
- `xxl`: 24pt (3x)
- `xxxl`: 32pt (4x)

### Semantic Spacing
- `cardPadding`: 16pt
- `screenPadding`: 16pt
- `sectionSpacing`: 24pt
- `buttonPadding`: 16pt
- `inputPadding`: 16pt
- `iconPadding`: 8pt

## Border Radius

Following Apple HIG corner radius standards.

### Scale
- `xs`: 4pt
- `sm`: 6pt
- `md`: 8pt
- `lg`: 10pt (Apple standard)
- `xl`: 12pt
- `xxl`: 16pt
- `round`: 50pt (circular)

### Semantic Radius
- `cornerRadiusSmall`: 8pt
- `cornerRadiusMedium`: 10pt
- `cornerRadiusLarge`: 12pt
- `cornerRadiusExtraLarge`: 16pt

## Shadows

iOS-style shadows with proper elevation for Android.

### Sizes
- `small`: elevation 1
- `medium`: elevation 2
- `large`: elevation 4
- `modal`: elevation 8
- `none`: no shadow

### Component-specific
- `card`: elevation 2
- `button`: elevation 3
- `modal`: elevation 8

## Layout

### Navigation & System UI
- `statusBarHeight`: 44pt
- `navigationBarHeight`: 44pt
- `tabBarHeight`: 83pt

### Component Dimensions
- `buttonHeight`: 44pt (Apple standard touch target)
- `buttonHeightSmall`: 32pt
- `inputHeight`: 44pt
- `cardMinHeight`: 44pt

### Touch Targets (Apple HIG minimum 44x44pt)
- `minTouchTarget`: 44pt
- `iconTouchTarget`: 44pt

### Content Margins
- `contentMargin`: 16pt
- `sectionMargin`: 24pt
- `cardMargin`: 16pt

## Animations

### Spring Animations
- `spring`: tension 100, friction 8
- `springGentle`: tension 80, friction 12
- `springBouncy`: tension 150, friction 4

### Timing Animations
- `easeInOut`: 300ms, ease-in-out
- `easeOut`: 250ms, ease-out
- `easeIn`: 200ms, ease-in

### Standard Durations
- `fast`: 200ms
- `normal`: 300ms
- `slow`: 500ms
- `slower`: 800ms

### Component-specific
- `buttonPress`: 150ms, ease-out
- `modalPresent`: 350ms, ease-out
- `tabSwitch`: 300ms, ease-in-out
- `cardHover`: 200ms, ease-out

## Component Styles

Pre-defined styles for common components:

### Buttons
- `primaryButton`: Primary app button with accent color
- `secondaryButton`: Secondary button with border
- `tertiaryButton`: Transparent button

### Cards
- `card`: Standard card with shadow
- `groupedCard`: Card for grouped lists
- `modal`: Modal container style

### Inputs
- `input`: Standard text input with border

### Navigation
- `header`: Page header with shadow
- `tabBar`: Bottom tab bar
- `navigationBar`: Top navigation bar

### Lists
- `listItem`: Standard list item

## UI Components

### Button
Reusable button component with variants:
- `primary`, `secondary`, `tertiary`
- `small`, `medium`, `large` sizes
- Support for icons and loading states
- Disabled state handling

### Card
Flexible card component:
- `default`, `grouped`, `outlined` variants
- Optional title and subtitle
- Pressable functionality
- Custom padding and margins

### Input
Enhanced text input:
- `default`, `outlined`, `filled` variants
- `small`, `medium`, `large` sizes
- Label, error, and helper text
- Icon support (left and right)
- Error state styling

## Helper Functions

### getTextColor(variant)
Returns appropriate text color based on variant:
- `primary`, `secondary`, `tertiary`, `quaternary`

### getBackgroundColor(variant)
Returns appropriate background color:
- `primary`, `secondary`, `tertiary`, `grouped`

### getShadowForElevation(elevation)
Returns shadow style based on elevation level:
- 1, 2, 4, 8 (elevation values)

## Usage Examples

### Button
```tsx
import { Button } from '../components/ui';

<Button
  title="Primary Button"
  onPress={() => console.log('pressed')}
  variant="primary"
  size="medium"
/>

<Button
  title="Secondary Button"
  onPress={() => console.log('pressed')}
  variant="secondary"
  leftIcon={<Icon />}
/>
```

### Card
```tsx
import { Card } from '../components/ui';

<Card title="Card Title" subtitle="Card subtitle">
  <Text>Card content goes here</Text>
</Card>

<Card variant="outlined" onPress={() => console.log('pressed')}>
  <Text>Pressable card</Text>
</Card>
```

### Input
```tsx
import { Input } from '../components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={error}
  variant="outlined"
/>

<Input
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  rightIcon={<EyeIcon />}
/>
```

## Theme Support

The design system includes TypeScript interfaces for theme support:
- `ThemeContextType`: Interface for theme provider
- Ready for dark mode implementation
- Helper functions for dynamic theming

## Best Practices

1. **Use semantic tokens**: Prefer semantic colors like `label` over hard-coded values
2. **Follow spacing scale**: Use the defined spacing scale for consistency
3. **Maintain touch targets**: Ensure all interactive elements meet 44pt minimum
4. **Use appropriate typography**: Follow the hierarchy for text styling
5. **Leverage component library**: Use pre-built components for consistency
6. **Consider accessibility**: Ensure proper contrast ratios and touch targets

## Contributing

When adding new design tokens or components:
1. Follow Apple HIG guidelines
2. Maintain consistency with existing patterns
3. Add proper TypeScript types
4. Update documentation
5. Consider both iOS and Android implementations
