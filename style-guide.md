# LeadScout Design System & Style Guide

**Version**: 1.0
**Last Updated**: 2025-11-15
**Platforms**: Next.js (Web) + React Native (Mobile)

---

## Table of Contents
1. [Design Tokens](#1-design-tokens)
2. [Layout System](#2-layout-system)
3. [Component Specifications](#3-component-specifications)
4. [Interaction Patterns](#4-interaction-patterns)
5. [Icon System](#5-icon-system)
6. [Data Visualization](#6-data-visualization)
7. [Gamification Elements](#7-gamification-elements)
8. [Dark Mode](#8-dark-mode)
9. [Accessibility Guidelines](#9-accessibility-guidelines)
10. [Platform-Specific Implementation](#10-platform-specific-implementation)

---

## 1. Design Tokens

### 1.1 Color Tokens

#### Brand Colors - Light Mode

```javascript
// tailwind.config.js colors
colors: {
  // Primary Brand Colors
  brand: {
    blue: {
      50: '#E6F0FF',
      100: '#CCE0FF',
      200: '#99C2FF',
      300: '#66A3FF',
      400: '#3385FF',
      500: '#0066FF', // Main brand color
      600: '#0052CC',
      700: '#003D99',
      800: '#002966',
      900: '#001433',
    },
    teal: {
      50: '#E6F9F7',
      100: '#CCF3EF',
      200: '#99E7DF',
      300: '#66DBCF',
      400: '#33CFBF',
      500: '#00B8A9', // Scout success color
      600: '#009387',
      700: '#006E65',
      800: '#004A44',
      900: '#002522',
    },
  },

  // Semantic Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Approved leads, payments
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  warning: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#FF6B35', // Urgency CTAs (custom warmth orange)
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Rejected leads, errors
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Information, tips
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Neutral Scale (Light Mode)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
}
```

#### CSS Custom Properties (Theme Switching)

```css
:root {
  /* Brand Colors */
  --color-brand-blue: #0066FF;
  --color-brand-blue-hover: #0052CC;
  --color-brand-blue-active: #003D99;
  --color-brand-teal: #00B8A9;
  --color-brand-teal-hover: #009387;

  /* Semantic Colors */
  --color-success: #10B981;
  --color-success-bg: #ECFDF5;
  --color-success-border: #A7F3D0;

  --color-warning: #FF6B35;
  --color-warning-bg: #FFF7ED;
  --color-warning-border: #FED7AA;

  --color-danger: #EF4444;
  --color-danger-bg: #FEF2F2;
  --color-danger-border: #FECACA;

  --color-info: #3B82F6;
  --color-info-bg: #EFF6FF;
  --color-info-border: #BFDBFE;

  /* Background Colors */
  --color-background: #FFFFFF;
  --color-background-secondary: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #FFFFFF;
  --color-surface-overlay: rgba(0, 0, 0, 0.5);

  /* Text Colors */
  --color-text-primary: #171717;
  --color-text-secondary: #525252;
  --color-text-tertiary: #A3A3A3;
  --color-text-disabled: #D4D4D4;
  --color-text-inverse: #FFFFFF;

  /* Border Colors */
  --color-border: #E5E5E5;
  --color-border-hover: #D4D4D4;
  --color-border-focus: #0066FF;
  --color-border-error: #EF4444;

  /* Interactive States */
  --color-interactive-hover: rgba(0, 102, 255, 0.08);
  --color-interactive-active: rgba(0, 102, 255, 0.12);
  --color-interactive-disabled: #F5F5F5;
}

[data-theme="dark"] {
  /* Background Colors */
  --color-background: #0A0A0A;
  --color-background-secondary: #171717;
  --color-surface: #171717;
  --color-surface-elevated: #262626;
  --color-surface-overlay: rgba(0, 0, 0, 0.75);

  /* Text Colors */
  --color-text-primary: #FAFAFA;
  --color-text-secondary: #A3A3A3;
  --color-text-tertiary: #737373;
  --color-text-disabled: #525252;
  --color-text-inverse: #0A0A0A;

  /* Border Colors */
  --color-border: #404040;
  --color-border-hover: #525252;
  --color-border-focus: #3385FF;
  --color-border-error: #EF4444;

  /* Interactive States */
  --color-interactive-hover: rgba(51, 133, 255, 0.12);
  --color-interactive-active: rgba(51, 133, 255, 0.16);
  --color-interactive-disabled: #262626;
}
```

#### React Native Theme Object

```typescript
// theme.ts
export const lightTheme = {
  colors: {
    // Brand
    brandBlue: '#0066FF',
    brandBlueHover: '#0052CC',
    brandTeal: '#00B8A9',

    // Semantic
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#FF6B35',
    warningBg: '#FFF7ED',
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',

    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Text
    textPrimary: '#171717',
    textSecondary: '#525252',
    textTertiary: '#A3A3A3',
    textDisabled: '#D4D4D4',
    textInverse: '#FFFFFF',

    // Border
    border: '#E5E5E5',
    borderHover: '#D4D4D4',
    borderFocus: '#0066FF',

    // Interactive
    interactiveHover: 'rgba(0, 102, 255, 0.08)',
    interactiveActive: 'rgba(0, 102, 255, 0.12)',
    interactiveDisabled: '#F5F5F5',
  },
};

export const darkTheme = {
  colors: {
    // Brand (same as light)
    brandBlue: '#0066FF',
    brandBlueHover: '#3385FF',
    brandTeal: '#00B8A9',

    // Semantic (same as light for consistency)
    success: '#10B981',
    successBg: '#064E3B',
    warning: '#FF6B35',
    warningBg: '#7C2D12',
    danger: '#EF4444',
    dangerBg: '#7F1D1D',
    info: '#3B82F6',
    infoBg: '#1E3A8A',

    // Background
    background: '#0A0A0A',
    backgroundSecondary: '#171717',
    surface: '#171717',
    surfaceElevated: '#262626',

    // Text
    textPrimary: '#FAFAFA',
    textSecondary: '#A3A3A3',
    textTertiary: '#737373',
    textDisabled: '#525252',
    textInverse: '#0A0A0A',

    // Border
    border: '#404040',
    borderHover: '#525252',
    borderFocus: '#3385FF',

    // Interactive
    interactiveHover: 'rgba(51, 133, 255, 0.12)',
    interactiveActive: 'rgba(51, 133, 255, 0.16)',
    interactiveDisabled: '#262626',
  },
};
```

### 1.2 Typography Tokens

#### Font Family

**Primary Font**: Inter (Google Fonts)
- Available weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Variable font support for optimal loading
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif

```html
<!-- Google Fonts Import -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

#### Typography Scale (Tailwind Config)

```javascript
// tailwind.config.js
fontSize: {
  // Mobile-optimized base sizes
  'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],      // 12px
  'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.005em' }],  // 14px
  'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],            // 16px
  'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em' }], // 18px
  'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],     // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],  // 36px
  '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],         // 48px
  '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.035em' }],       // 60px (web only)
},

fontWeight: {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

#### Typography Styles (Semantic Usage)

```css
/* Display Text (Marketing pages, hero sections) */
.text-display-large {
  font-size: 3rem;        /* 48px */
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.text-display-medium {
  font-size: 2.25rem;     /* 36px */
  line-height: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.text-display-small {
  font-size: 1.875rem;    /* 30px */
  line-height: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Headings (Page titles, section headers) */
.text-heading-1 {
  font-size: 1.5rem;      /* 24px */
  line-height: 2rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.text-heading-2 {
  font-size: 1.25rem;     /* 20px */
  line-height: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.text-heading-3 {
  font-size: 1.125rem;    /* 18px */
  line-height: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.005em;
}

/* Body Text */
.text-body-large {
  font-size: 1rem;        /* 16px */
  line-height: 1.5rem;
  font-weight: 400;
}

.text-body-medium {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.25rem;
  font-weight: 400;
}

.text-body-small {
  font-size: 0.75rem;     /* 12px */
  line-height: 1rem;
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* Labels & UI Text */
.text-label-large {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.005em;
}

.text-label-medium {
  font-size: 0.75rem;     /* 12px */
  line-height: 1rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
```

#### React Native Typography

```typescript
// typography.ts
export const typography = {
  displayLarge: {
    fontSize: 48,
    lineHeight: 52.8,
    fontWeight: '700' as const,
    letterSpacing: -1.44,
    fontFamily: 'Inter-Bold',
  },
  displayMedium: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.9,
    fontFamily: 'Inter-Bold',
  },
  displaySmall: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '600' as const,
    letterSpacing: -0.6,
    fontFamily: 'Inter-SemiBold',
  },
  heading1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.36,
    fontFamily: 'Inter-Bold',
  },
  heading2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    fontFamily: 'Inter-SemiBold',
  },
  heading3: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.09,
    fontFamily: 'Inter-SemiBold',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    fontFamily: 'Inter-Regular',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
    fontFamily: 'Inter-Regular',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.12,
    fontFamily: 'Inter-Regular',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.07,
    fontFamily: 'Inter-Medium',
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.12,
    fontFamily: 'Inter-Medium',
  },
};
```

### 1.3 Spacing Tokens

**Base Unit**: 4px (0.25rem)

```javascript
// tailwind.config.js
spacing: {
  'px': '1px',
  '0': '0',
  '0.5': '0.125rem',  // 2px
  '1': '0.25rem',     // 4px
  '2': '0.5rem',      // 8px
  '3': '0.75rem',     // 12px
  '4': '1rem',        // 16px
  '5': '1.25rem',     // 20px
  '6': '1.5rem',      // 24px
  '8': '2rem',        // 32px
  '10': '2.5rem',     // 40px
  '12': '3rem',       // 48px
  '16': '4rem',       // 64px
  '20': '5rem',       // 80px
  '24': '6rem',       // 96px
  '32': '8rem',       // 128px
}
```

#### Semantic Spacing

```css
/* Component Internal Spacing */
--spacing-component-xs: 0.5rem;   /* 8px - tight padding */
--spacing-component-sm: 0.75rem;  /* 12px - button padding */
--spacing-component-md: 1rem;     /* 16px - input padding */
--spacing-component-lg: 1.5rem;   /* 24px - card padding */
--spacing-component-xl: 2rem;     /* 32px - section padding */

/* Layout Spacing */
--spacing-section-gap: 3rem;      /* 48px - between sections */
--spacing-container: 1rem;        /* 16px - container padding mobile */
--spacing-container-lg: 4rem;     /* 64px - container padding desktop */

/* Stack/List Spacing */
--spacing-stack-xs: 0.5rem;       /* 8px - tight list items */
--spacing-stack-sm: 1rem;         /* 16px - default list items */
--spacing-stack-md: 1.5rem;       /* 24px - spaced list items */
--spacing-stack-lg: 2rem;         /* 32px - section spacing */
```

#### React Native Spacing

```typescript
// spacing.ts
export const spacing = {
  px: 1,
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};
```

### 1.4 Border Radius Tokens

```javascript
// tailwind.config.js
borderRadius: {
  'none': '0',
  'sm': '0.25rem',    // 4px - subtle, inputs, badges
  'DEFAULT': '0.5rem', // 8px - buttons, cards
  'md': '0.75rem',    // 12px - larger cards
  'lg': '1rem',       // 16px - modals, images
  'xl': '1.5rem',     // 24px - hero sections
  '2xl': '2rem',      // 32px - special cards
  'full': '9999px',   // Pills, circular buttons
}
```

### 1.5 Shadow Tokens (Elevation System)

```javascript
// tailwind.config.js
boxShadow: {
  // Subtle elevation (cards at rest)
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',

  // Default elevation (buttons, inputs)
  'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',

  // Medium elevation (hover states, dropdowns)
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

  // High elevation (modals, popovers)
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

  // Maximum elevation (toasts, tooltips)
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  // Extra large (mega menus)
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Inner shadow (pressed states)
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // No shadow
  'none': '0 0 #0000',
}
```

#### React Native Shadows (Platform-specific)

```typescript
// shadows.ts
import { Platform } from 'react-native';

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
    },
    android: {
      elevation: 8,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
    },
    android: {
      elevation: 12,
    },
  }),
};
```

### 1.6 Z-Index Scale

```javascript
// tailwind.config.js extend
zIndex: {
  'dropdown': '1000',
  'sticky': '1020',
  'fixed': '1030',
  'modal-backdrop': '1040',
  'modal': '1050',
  'popover': '1060',
  'tooltip': '1070',
  'toast': '1080',
}
```

```typescript
// React Native z-index
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
};
```

### 1.7 Transition/Animation Tokens

```javascript
// tailwind.config.js
transitionDuration: {
  'fast': '100ms',
  'base': '200ms',
  'slow': '300ms',
  'slower': '500ms',
}

transitionTimingFunction: {
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy spring
}
```

#### Animation Usage

```css
/* Common Transitions */
.transition-colors { transition-property: color, background-color, border-color; }
.transition-transform { transition-property: transform; }
.transition-shadow { transition-property: box-shadow; }
.transition-all { transition-property: all; }

/* Typical Duration */
.duration-base { transition-duration: 200ms; }
```

---

## 2. Layout System

### 2.1 Breakpoints

```javascript
// tailwind.config.js
screens: {
  'sm': '640px',   // Mobile landscape, small tablets
  'md': '768px',   // Tablet portrait
  'lg': '1024px',  // Tablet landscape, small desktop
  'xl': '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
}
```

#### Mobile-First Responsive Strategy

Base styles target mobile (320px-639px), then progressively enhance:

```css
/* Mobile (default) */
.grid { grid-template-columns: 1fr; }

/* Tablet and up */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

### 2.2 Container System

```javascript
// tailwind.config.js
container: {
  center: true,
  padding: {
    DEFAULT: '1rem',   // 16px mobile
    sm: '1.5rem',      // 24px
    md: '2rem',        // 32px
    lg: '3rem',        // 48px
    xl: '4rem',        // 64px
    '2xl': '6rem',     // 96px
  },
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',   // Max container width
  },
}
```

### 2.3 Grid System

**12-Column Grid** (for complex layouts like data tables, dashboards)

```html
<!-- Full-width grid with 12 columns -->
<div class="grid grid-cols-12 gap-4">
  <!-- Sidebar: 3 columns on desktop, full width on mobile -->
  <aside class="col-span-12 lg:col-span-3">Sidebar</aside>

  <!-- Main content: 9 columns on desktop, full width on mobile -->
  <main class="col-span-12 lg:col-span-9">Content</main>
</div>
```

**Auto-Fit Grid** (for card grids, lead marketplace)

```html
<!-- Cards that automatically fit, minimum 280px each -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### 2.4 Mobile-Specific Layout (React Native)

#### Safe Area Handling

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Always wrap mobile screens
<SafeAreaView style={{ flex: 1 }}>
  {/* Content */}
</SafeAreaView>
```

#### Bottom Navigation Safe Area

```typescript
// Account for tab bar height: 56px + safe area
const BOTTOM_TAB_HEIGHT = 56;

<View style={{
  paddingBottom: BOTTOM_TAB_HEIGHT + insets.bottom
}}>
  {/* Scrollable content */}
</View>
```

---

## 3. Component Specifications

### 3.1 Button Component

#### Variants

**Primary Button** (Main CTAs, high-priority actions)

```typescript
// Tailwind (Web)
<button className="
  bg-brand-blue-500
  hover:bg-brand-blue-600
  active:bg-brand-blue-700
  text-white
  font-semibold
  px-6 py-3
  rounded-lg
  shadow-sm
  transition-colors duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
  focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2
">
  {children}
</button>

// React Native
<TouchableOpacity
  style={[
    styles.button,
    styles.buttonPrimary,
    disabled && styles.buttonDisabled,
  ]}
  disabled={disabled}
  activeOpacity={0.8}
>
  <Text style={styles.buttonTextPrimary}>{children}</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0066FF',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
```

**Secondary Button** (Alternative actions, cancel buttons)

```typescript
// Tailwind
<button className="
  bg-white
  border border-gray-300
  hover:bg-gray-50
  active:bg-gray-100
  text-gray-700
  font-semibold
  px-6 py-3
  rounded-lg
  shadow-sm
  transition-colors duration-200
  disabled:opacity-50
  focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
">
  {children}
</button>
```

**Success Button** (Approve, accept, confirm actions)

```typescript
// Tailwind
<button className="
  bg-success-500
  hover:bg-success-600
  active:bg-success-700
  text-white
  font-semibold
  px-6 py-3
  rounded-lg
  shadow-sm
  transition-colors duration-200
  disabled:opacity-50
  focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2
">
  Approve Lead
</button>
```

**Danger Button** (Reject, delete, destructive actions)

```typescript
// Tailwind
<button className="
  bg-danger-500
  hover:bg-danger-600
  active:bg-danger-700
  text-white
  font-semibold
  px-6 py-3
  rounded-lg
  shadow-sm
  transition-colors duration-200
  disabled:opacity-50
  focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2
">
  Reject Lead
</button>
```

**Ghost Button** (Tertiary actions, icon buttons)

```typescript
// Tailwind
<button className="
  bg-transparent
  hover:bg-gray-100
  active:bg-gray-200
  text-gray-700
  font-semibold
  px-6 py-3
  rounded-lg
  transition-colors duration-200
  disabled:opacity-50
  focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
">
  {children}
</button>
```

**Warning/Urgency Button** (CTAs with urgency - using warmth orange)

```typescript
// Tailwind
<button className="
  bg-warning-500
  hover:bg-warning-600
  active:bg-warning-700
  text-white
  font-semibold
  px-6 py-3
  rounded-lg
  shadow-md
  transition-all duration-200
  disabled:opacity-50
  focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2
  animate-pulse
">
  Claim Bonus Now
</button>
```

#### Button Sizes

```css
/* Small - mobile secondary actions */
.btn-sm {
  padding: 0.5rem 0.75rem;  /* 8px 12px */
  font-size: 0.875rem;       /* 14px */
  border-radius: 0.5rem;     /* 8px */
}

/* Medium - default */
.btn-md {
  padding: 0.75rem 1.5rem;   /* 12px 24px */
  font-size: 1rem;           /* 16px */
  border-radius: 0.5rem;     /* 8px */
}

/* Large - primary CTAs */
.btn-lg {
  padding: 1rem 2rem;        /* 16px 32px */
  font-size: 1.125rem;       /* 18px */
  border-radius: 0.75rem;    /* 12px */
}
```

#### Button States

- **Hover**: Background color darkens by 100-200 in color scale
- **Active/Pressed**: Background darkens by 200-300 in color scale
- **Focus**: 2px ring in button color with 2px offset (keyboard navigation)
- **Disabled**: 50% opacity, pointer-events-none, not-allowed cursor
- **Loading**: Spinner + disabled state + optional "Loading..." text

```typescript
// Loading State Example
<button disabled className="btn-primary relative">
  <span className={isLoading ? 'invisible' : ''}>Submit Lead</span>
  {isLoading && (
    <span className="absolute inset-0 flex items-center justify-center">
      <svg className="animate-spin h-5 w-5 text-white" /* spinner icon */ />
    </span>
  )}
</button>
```

#### Icon Buttons

```typescript
// Tailwind
<button className="
  p-2
  rounded-lg
  hover:bg-gray-100
  active:bg-gray-200
  transition-colors
  focus:outline-none focus:ring-2 focus:ring-gray-400
" aria-label="Delete lead">
  <TrashIcon className="h-5 w-5 text-gray-600" />
</button>
```

#### Accessibility Requirements

- Always include `type="button"` (or `submit`/`reset`)
- Icon-only buttons MUST have `aria-label`
- Focus ring must be visible for keyboard navigation
- Disabled buttons should have `aria-disabled="true"`
- Loading buttons should have `aria-busy="true"`
- Touch target minimum 44x44px on mobile

---

### 3.2 Input Component

#### Text Input

```typescript
// Tailwind (Web)
<input
  type="text"
  className="
    w-full
    px-4 py-3
    border border-gray-300
    rounded-lg
    text-gray-900
    placeholder:text-gray-400
    focus:outline-none
    focus:ring-2
    focus:ring-brand-blue-500
    focus:border-transparent
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
  "
  placeholder="Enter company name"
/>

// React Native
<TextInput
  style={[
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
  ]}
  placeholder="Enter lead details"
  placeholderTextColor="#A3A3A3"
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
/>

const styles = StyleSheet.create({
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    fontSize: 16,
    color: '#171717',
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#0066FF',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
});
```

#### Text Area

```typescript
// Tailwind
<textarea
  rows={4}
  className="
    w-full
    px-4 py-3
    border border-gray-300
    rounded-lg
    text-gray-900
    placeholder:text-gray-400
    focus:outline-none
    focus:ring-2
    focus:ring-brand-blue-500
    focus:border-transparent
    resize-none
  "
  placeholder="Describe the lead opportunity..."
/>
```

#### Select/Dropdown

```typescript
// Tailwind (using Shadcn Select)
<select className="
  w-full
  px-4 py-3
  border border-gray-300
  rounded-lg
  text-gray-900
  bg-white
  focus:outline-none
  focus:ring-2
  focus:ring-brand-blue-500
  focus:border-transparent
  appearance-none
  cursor-pointer
">
  <option value="">Select industry</option>
  <option value="tech">Technology</option>
  <option value="healthcare">Healthcare</option>
</select>

// React Native (using Picker or custom modal)
// Recommendation: Use react-native-picker-select or custom bottom sheet
```

#### Number Input (Budget)

```typescript
// Tailwind
<input
  type="number"
  min="100"
  max="1000000"
  step="100"
  className="
    w-full
    px-4 py-3
    border border-gray-300
    rounded-lg
    text-gray-900
    focus:outline-none
    focus:ring-2
    focus:ring-brand-blue-500
    focus:border-transparent
  "
  placeholder="Min budget"
/>
```

#### Input States

**Default State**
```css
border: 1px solid #E5E5E5;
background: #FFFFFF;
```

**Focus State**
```css
border: 2px solid #0066FF;
outline: none;
ring: 2px #0066FF with 2px offset;
```

**Error State**
```css
border: 2px solid #EF4444;
background: #FEF2F2;
```

**Success State** (validated input)
```css
border: 2px solid #10B981;
background: #ECFDF5;
```

**Disabled State**
```css
background: #F5F5F5;
color: #A3A3A3;
cursor: not-allowed;
```

#### Input with Label & Helper Text

```typescript
// Complete input field pattern
<div className="space-y-1.5">
  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
    Company Name <span className="text-danger-500">*</span>
  </label>

  <input
    id="company-name"
    type="text"
    className="input"
    placeholder="Acme Corp"
    aria-describedby="company-name-help"
    required
  />

  <p id="company-name-help" className="text-xs text-gray-500">
    Enter the official registered company name
  </p>

  {error && (
    <p className="text-xs text-danger-500 flex items-center gap-1">
      <AlertIcon className="h-4 w-4" />
      {error}
    </p>
  )}
</div>
```

#### Accessibility Requirements

- All inputs MUST have associated `<label>` with `htmlFor`
- Use `aria-describedby` for helper text
- Error messages should be announced to screen readers
- Placeholder text is NOT a replacement for labels
- Required fields indicated with `*` and `aria-required="true"`
- Touch target minimum 44x44px on mobile

---

### 3.3 Card Component

#### Basic Card

```typescript
// Tailwind
<div className="
  bg-white
  border border-gray-200
  rounded-xl
  p-6
  shadow-sm
  hover:shadow-md
  transition-shadow duration-200
">
  {children}
</div>

// React Native
<View style={styles.card}>
  {children}
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 24,
    ...shadows.sm,
  },
});
```

#### Lead Card (Marketplace)

```typescript
// Web version
<div className="
  bg-white
  border border-gray-200
  rounded-xl
  p-6
  shadow-sm
  hover:shadow-md
  hover:border-brand-blue-300
  transition-all duration-200
  cursor-pointer
  group
">
  {/* Header */}
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-blue-600">
        {leadTitle}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{industry}</p>
    </div>
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
      Verified
    </span>
  </div>

  {/* Content */}
  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
    {description}
  </p>

  {/* Footer */}
  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
    <div className="flex items-center gap-4">
      <span className="text-xs text-gray-500">Budget</span>
      <span className="text-base font-semibold text-gray-900">${budget}</span>
    </div>
    <button className="btn-sm btn-primary">
      View Details
    </button>
  </div>
</div>
```

#### Stat Card (Dashboard)

```typescript
// Tailwind
<div className="
  bg-white
  border border-gray-200
  rounded-xl
  p-6
  shadow-sm
">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">Total Leads</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">1,247</p>
      <p className="text-sm text-success-600 mt-1 flex items-center gap-1">
        <ArrowUpIcon className="h-4 w-4" />
        12% from last month
      </p>
    </div>
    <div className="p-3 bg-brand-blue-100 rounded-lg">
      <UsersIcon className="h-8 w-8 text-brand-blue-600" />
    </div>
  </div>
</div>
```

#### Interactive Card (Clickable)

```typescript
// React Native (Touchable Card)
<TouchableOpacity
  style={styles.card}
  onPress={onPress}
  activeOpacity={0.8}
>
  {children}
</TouchableOpacity>
```

#### Card Variants

```css
/* Elevated Card */
.card-elevated {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Outlined Card (no shadow) */
.card-outlined {
  border: 1px solid #E5E5E5;
  box-shadow: none;
}

/* Filled Card (colored background) */
.card-filled {
  background: #F5F5F5;
  border: none;
}

/* Success Card */
.card-success {
  border-color: #10B981;
  background: #ECFDF5;
}

/* Warning Card */
.card-warning {
  border-color: #FF6B35;
  background: #FFF7ED;
}
```

---

### 3.4 Badge/Tag Component

#### Status Badges

```typescript
// Tailwind - Approved
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-success-100
  text-success-700
">
  Approved
</span>

// Pending
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-warning-100
  text-warning-700
">
  Pending Review
</span>

// Rejected
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-danger-100
  text-danger-700
">
  Rejected
</span>

// Verified
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-brand-blue-100
  text-brand-blue-700
">
  <CheckCircleIcon className="h-3 w-3 mr-1" />
  Verified
</span>
```

#### Category Tags (Removable)

```typescript
// Tailwind
<span className="
  inline-flex items-center gap-1
  px-3 py-1
  rounded-full
  text-sm font-medium
  bg-gray-100
  text-gray-700
  hover:bg-gray-200
  transition-colors
">
  Technology
  <button className="hover:text-gray-900" aria-label="Remove tag">
    <XIcon className="h-3 w-3" />
  </button>
</span>
```

#### Achievement Badges (Gamification)

```typescript
// React Native
<View style={styles.achievementBadge}>
  <Text style={styles.badgeIcon}>🏆</Text>
  <Text style={styles.badgeText}>Gold Scout</Text>
</View>

const styles = StyleSheet.create({
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C2410C',
  },
});
```

---

### 3.5 Modal/Dialog Component

#### Modal Overlay & Content

```typescript
// Tailwind (Web)
// Backdrop
<div className="
  fixed inset-0
  bg-black/50
  backdrop-blur-sm
  z-modal-backdrop
  transition-opacity duration-200
" />

// Modal Content
<div className="
  fixed
  left-1/2 top-1/2
  -translate-x-1/2 -translate-y-1/2
  bg-white
  rounded-2xl
  p-6
  w-full max-w-md
  shadow-2xl
  z-modal
  transition-all duration-200
  max-h-[90vh] overflow-y-auto
">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-gray-900">Modal Title</h2>
    <button
      className="p-1 hover:bg-gray-100 rounded-lg"
      aria-label="Close modal"
    >
      <XIcon className="h-5 w-5 text-gray-500" />
    </button>
  </div>

  {/* Body */}
  <div className="mb-6">
    {children}
  </div>

  {/* Footer */}
  <div className="flex gap-3 justify-end">
    <button className="btn-secondary">Cancel</button>
    <button className="btn-primary">Confirm</button>
  </div>
</div>
```

#### React Native Modal (Bottom Sheet)

```typescript
// React Native
import { Modal } from 'react-native';

<Modal
  visible={visible}
  transparent
  animationType="slide"
  onRequestClose={onClose}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Modal Title</Text>
        <TouchableOpacity onPress={onClose}>
          <XIcon size={24} color="#525252" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.modalBody}>
        {children}
      </View>

      {/* Footer */}
      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
          <Text style={styles.btnSecondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={onConfirm}>
          <Text style={styles.btnPrimaryText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#171717',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
});
```

#### Confirmation Dialog

```typescript
// Tailwind (Smaller, centered)
<div className="
  fixed left-1/2 top-1/2
  -translate-x-1/2 -translate-y-1/2
  bg-white rounded-xl p-6
  w-full max-w-sm
  shadow-2xl z-modal
">
  <div className="text-center">
    <div className="mx-auto w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center mb-4">
      <AlertTriangleIcon className="h-6 w-6 text-warning-600" />
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Reject this lead?
    </h3>

    <p className="text-sm text-gray-600 mb-6">
      This action cannot be undone. The scout will be notified.
    </p>

    <div className="flex gap-3">
      <button className="btn-secondary flex-1">Cancel</button>
      <button className="btn-danger flex-1">Reject Lead</button>
    </div>
  </div>
</div>
```

#### Accessibility Requirements

- Focus trap: Tab cycles through modal elements only
- Escape key closes modal
- Click outside modal closes it (optional)
- Focus returns to trigger element on close
- `aria-modal="true"` and `role="dialog"`
- Modal title has `id` referenced by `aria-labelledby`

---

### 3.6 Toast/Notification Component

```typescript
// Tailwind (Success Toast)
<div className="
  fixed top-4 right-4
  bg-white
  border border-success-200
  rounded-lg
  p-4
  shadow-xl
  z-toast
  min-w-[320px]
  flex items-start gap-3
  animate-slide-in-right
">
  <div className="flex-shrink-0">
    <CheckCircleIcon className="h-5 w-5 text-success-500" />
  </div>

  <div className="flex-1">
    <p className="text-sm font-semibold text-gray-900">Lead Approved</p>
    <p className="text-xs text-gray-600 mt-0.5">
      Payment of $50 sent to scout
    </p>
  </div>

  <button className="flex-shrink-0 p-1 hover:bg-gray-100 rounded">
    <XIcon className="h-4 w-4 text-gray-400" />
  </button>
</div>

// Error Toast
<div className="
  fixed top-4 right-4
  bg-white
  border border-danger-200
  rounded-lg
  p-4
  shadow-xl
  z-toast
  min-w-[320px]
  flex items-start gap-3
">
  <div className="flex-shrink-0">
    <AlertCircleIcon className="h-5 w-5 text-danger-500" />
  </div>

  <div className="flex-1">
    <p className="text-sm font-semibold text-gray-900">Submission Failed</p>
    <p className="text-xs text-gray-600 mt-0.5">
      Please check your internet connection and try again
    </p>
  </div>

  <button className="flex-shrink-0 p-1 hover:bg-gray-100 rounded">
    <XIcon className="h-4 w-4 text-gray-400" />
  </button>
</div>
```

#### React Native Toast (using toast library or custom)

```typescript
// Recommendation: Use react-native-toast-message
import Toast from 'react-native-toast-message';

Toast.show({
  type: 'success',
  text1: 'Lead Submitted',
  text2: 'You will be notified when reviewed',
  position: 'top',
  visibilityTime: 4000,
});
```

---

### 3.7 Loading States

#### Spinner

```typescript
// Tailwind (Inline Spinner)
<svg className="animate-spin h-5 w-5 text-brand-blue-500" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
</svg>

// React Native (ActivityIndicator)
import { ActivityIndicator } from 'react-native';

<ActivityIndicator size="large" color="#0066FF" />
```

#### Skeleton Loader (for cards, lists)

```typescript
// Tailwind
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
  <div className="h-20 bg-gray-200 rounded mb-3" />
  <div className="h-4 bg-gray-200 rounded w-full" />
</div>
```

#### Full-Page Loading

```typescript
// Tailwind (Centered)
<div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-fixed flex items-center justify-center">
  <div className="text-center">
    <div className="animate-spin h-12 w-12 border-4 border-brand-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
    <p className="text-sm text-gray-600">Loading...</p>
  </div>
</div>
```

---

### 3.8 Empty State Component

```typescript
// Tailwind
<div className="text-center py-12 px-4">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <InboxIcon className="h-8 w-8 text-gray-400" />
  </div>

  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    No leads yet
  </h3>

  <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
    Start submitting leads to earn rewards. Each approved lead earns you $10-$100.
  </p>

  <button className="btn-primary">
    Submit Your First Lead
  </button>
</div>
```

---

### 3.9 Data Table Component (Web Only)

```typescript
// Tailwind
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Lead Title
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Budget
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          Enterprise CRM Lead
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="badge-success">Approved</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          $50,000
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button className="text-brand-blue-600 hover:text-brand-blue-900">
            View
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 3.10 Bottom Navigation (Mobile Only)

```typescript
// React Native
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

<Tab.Navigator
  screenOptions={{
    tabBarActiveTintColor: '#0066FF',
    tabBarInactiveTintColor: '#A3A3A3',
    tabBarStyle: {
      height: 56,
      paddingBottom: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#E5E5E5',
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500',
      fontFamily: 'Inter-Medium',
    },
  }}
>
  <Tab.Screen
    name="Home"
    component={HomeScreen}
    options={{
      tabBarIcon: ({ color, size }) => (
        <HomeIcon color={color} size={size} />
      ),
    }}
  />
  <Tab.Screen
    name="Submit"
    component={SubmitScreen}
    options={{
      tabBarIcon: ({ color, size }) => (
        <PlusCircleIcon color={color} size={size} />
      ),
    }}
  />
  <Tab.Screen
    name="Earnings"
    component={EarningsScreen}
    options={{
      tabBarIcon: ({ color, size }) => (
        <DollarSignIcon color={color} size={size} />
      ),
    }}
  />
  <Tab.Screen
    name="Profile"
    component={ProfileScreen}
    options={{
      tabBarIcon: ({ color, size }) => (
        <UserIcon color={color} size={size} />
      ),
    }}
  />
</Tab.Navigator>
```

---

## 4. Interaction Patterns

### 4.1 Hover States (Web Only)

```css
/* Buttons */
.btn:hover {
  background-color: /* darker shade */;
  box-shadow: /* slightly larger shadow */;
}

/* Cards */
.card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border-color: /* accent color */;
  transform: translateY(-2px);
}

/* Links */
.link:hover {
  color: /* brand blue */;
  text-decoration: underline;
}

/* Icon Buttons */
.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
```

### 4.2 Active/Pressed States

```css
/* Buttons */
.btn:active {
  transform: scale(0.98);
  box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}

/* Cards (mobile) */
.card:active {
  opacity: 0.8;
}
```

### 4.3 Focus States (Keyboard Navigation)

```css
/* All interactive elements */
.interactive:focus-visible {
  outline: none;
  ring: 2px solid var(--color-brand-blue);
  ring-offset: 2px;
}

/* Inputs */
input:focus {
  border-color: var(--color-brand-blue);
  ring: 2px solid var(--color-brand-blue);
}
```

### 4.4 Loading States

**Optimistic UI**: Show success immediately, rollback on error

```typescript
// Example: Lead submission
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);

  // Optimistically show success
  showToast('Lead submitted!', 'success');

  try {
    await submitLead(data);
  } catch (error) {
    // Rollback on error
    showToast('Submission failed. Please try again.', 'error');
  } finally {
    setIsSubmitting(false);
  }
};
```

**Progressive Loading**: Show skeleton first, then data

```typescript
{isLoading ? (
  <SkeletonCard />
) : (
  <LeadCard data={lead} />
)}
```

### 4.5 Error States

```typescript
// Input error
<div>
  <input
    className={error ? 'input-error' : 'input'}
    aria-invalid={!!error}
    aria-describedby="error-message"
  />
  {error && (
    <p id="error-message" className="text-xs text-danger-500 mt-1 flex items-center gap-1">
      <AlertCircleIcon className="h-3 w-3" />
      {error}
    </p>
  )}
</div>

// Form-level error
<div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6">
  <div className="flex gap-3">
    <AlertCircleIcon className="h-5 w-5 text-danger-500 flex-shrink-0" />
    <div>
      <h4 className="text-sm font-semibold text-danger-800">Submission Failed</h4>
      <p className="text-sm text-danger-700 mt-1">
        Please fix the errors below and try again.
      </p>
    </div>
  </div>
</div>
```

### 4.6 Success Confirmations

```typescript
// Toast notification (non-blocking)
showToast('Lead approved! Payment sent.', 'success');

// Modal confirmation (blocking)
<Modal>
  <div className="text-center">
    <CheckCircleIcon className="h-12 w-12 text-success-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold">Lead Approved</h3>
    <p className="text-sm text-gray-600 mt-2">
      $50 has been credited to the scout's account
    </p>
    <button className="btn-primary mt-6">Done</button>
  </div>
</Modal>
```

### 4.7 Transitions & Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}

/* Slide In (Toast) */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in-right {
  animation: slideInRight 300ms ease-out;
}

/* Scale Pop (Achievement Unlock) */
@keyframes scalePop {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.animate-scale-pop {
  animation: scalePop 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Pulse (CTA Urgency) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 5. Icon System

### 5.1 Icon Library

**Recommended**: **Lucide React** (consistent across web and mobile)
- Lightweight (tree-shakeable)
- Consistent stroke width (2px)
- Available for React and React Native
- 1000+ icons

```bash
# Web
npm install lucide-react

# Mobile
npm install lucide-react-native
```

### 5.2 Icon Sizes

```typescript
// Standardized sizes
const ICON_SIZES = {
  xs: 16,   // Small UI elements, table icons
  sm: 20,   // Input icons, badges
  md: 24,   // Buttons, navigation (default)
  lg: 32,   // Feature cards, empty states
  xl: 48,   // Hero sections, illustrations
};

// Tailwind usage
<HomeIcon className="h-6 w-6" /> // 24px (md)

// React Native usage
<HomeIcon size={24} color="#0066FF" />
```

### 5.3 Icon Usage Guidelines

**DO:**
- Use icons to support text, not replace it (except universal actions: close, search, menu)
- Maintain consistent stroke width across all icons
- Use semantic colors (success icons = green, error = red)
- Include `aria-label` on icon-only buttons

**DON'T:**
- Mix icon libraries (stick to Lucide)
- Use decorative icons without purpose
- Scale icons non-proportionally
- Use icons smaller than 16px (accessibility)

### 5.4 Common Icons

```typescript
// Navigation
import { Home, Search, User, Settings, Bell, Menu, X } from 'lucide-react';

// Actions
import { Plus, Edit, Trash2, Download, Upload, Share2, Copy } from 'lucide-react';

// Status
import { Check, CheckCircle, AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

// Content
import { File, FileText, Image, Video, Link, Calendar } from 'lucide-react';

// Business
import { DollarSign, TrendingUp, Users, Briefcase, Target } from 'lucide-react';

// Arrows
import { ArrowUp, ArrowDown, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
```

---

## 6. Data Visualization

### 6.1 Chart Color Palette

```javascript
// Chart-specific colors (high contrast, colorblind-friendly)
const CHART_COLORS = {
  primary: '#0066FF',     // Brand blue
  secondary: '#00B8A9',   // Scout teal
  success: '#10B981',     // Green
  warning: '#FF6B35',     // Orange
  danger: '#EF4444',      // Red
  purple: '#8B5CF6',      // Purple (additional data series)
  amber: '#F59E0B',       // Amber (additional data series)

  // Neutral scale for multi-series
  series: [
    '#0066FF', // Blue
    '#00B8A9', // Teal
    '#10B981', // Green
    '#FF6B35', // Orange
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EF4444', // Red
  ],
};
```

### 6.2 Chart Types

**Line Chart** (Performance over time)
- **Use**: Lead submission trends, earnings over time
- **Library**: Recharts (web), Victory Native (mobile)
- **Style**: 2px line, smooth curves, filled area below line (gradient)

**Bar Chart** (Categorical comparison)
- **Use**: Leads by industry, monthly earnings comparison
- **Library**: Recharts (web), Victory Native (mobile)
- **Style**: Rounded top corners (8px), 8px gap between bars

**Donut Chart** (Proportions)
- **Use**: Lead status breakdown, industry distribution
- **Library**: Recharts (web), Victory Native (mobile)
- **Style**: Center hole 60%, 16px gap between segments

### 6.3 Chart Specifications

```typescript
// Web (Recharts)
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
    <XAxis
      dataKey="date"
      stroke="#A3A3A3"
      style={{ fontSize: 12 }}
    />
    <YAxis
      stroke="#A3A3A3"
      style={{ fontSize: 12 }}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    />
    <Line
      type="monotone"
      dataKey="earnings"
      stroke="#0066FF"
      strokeWidth={2}
      dot={{ fill: '#0066FF', r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
```

### 6.4 Legend Styles

```typescript
// Below chart, horizontal layout
<div className="flex items-center justify-center gap-6 mt-4">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-brand-blue-500" />
    <span className="text-sm text-gray-600">Approved</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-warning-500" />
    <span className="text-sm text-gray-600">Pending</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full bg-danger-500" />
    <span className="text-sm text-gray-600">Rejected</span>
  </div>
</div>
```

### 6.5 Tooltip Styles

```css
.chart-tooltip {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.chart-tooltip-label {
  font-size: 12px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 4px;
}

.chart-tooltip-value {
  font-size: 14px;
  font-weight: 700;
  color: #0066FF;
}
```

---

## 7. Gamification Elements

### 7.1 Badge Designs

**Achievement Tiers**
- **Bronze**: 1-10 approved leads
- **Silver**: 11-50 approved leads
- **Gold**: 51-100 approved leads
- **Diamond**: 100+ approved leads

```typescript
// React Native Badge Component
<View style={styles.achievementBadge}>
  <LinearGradient
    colors={['#CD7F32', '#E8B87E']} // Bronze gradient
    style={styles.badgeGradient}
  >
    <Text style={styles.badgeIcon}>🥉</Text>
    <Text style={styles.badgeTier}>Bronze Scout</Text>
    <Text style={styles.badgeCount}>5 Leads</Text>
  </LinearGradient>
</View>

const styles = StyleSheet.create({
  achievementBadge: {
    width: 120,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeTier: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
});

// Tier Gradients
const TIER_GRADIENTS = {
  bronze: ['#CD7F32', '#E8B87E'],
  silver: ['#C0C0C0', '#E8E8E8'],
  gold: ['#FFD700', '#FFA500'],
  diamond: ['#B9F2FF', '#00D4FF'],
};
```

### 7.2 Progress Bars

```typescript
// Tailwind (Web)
<div className="w-full bg-gray-200 rounded-full h-2.5">
  <div
    className="bg-brand-teal-500 h-2.5 rounded-full transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>

// With label
<div>
  <div className="flex justify-between text-sm mb-2">
    <span className="text-gray-600">Progress to Silver</span>
    <span className="font-semibold text-gray-900">7/11 leads</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-brand-teal-500 h-2.5 rounded-full"
      style={{ width: '64%' }}
    />
  </div>
</div>

// React Native
<View style={styles.progressBarContainer}>
  <View style={styles.progressBarBackground}>
    <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
  </View>
  <Text style={styles.progressText}>{progress}%</Text>
</View>
```

### 7.3 Quality Score Display (Circular Gauge)

```typescript
// React Native (using react-native-circular-progress or SVG)
import { AnimatedCircularProgress } from 'react-native-circular-progress';

<AnimatedCircularProgress
  size={120}
  width={12}
  fill={qualityScore} // 0-100
  tintColor="#10B981"
  backgroundColor="#E5E5E5"
  rotation={0}
  lineCap="round"
>
  {(fill) => (
    <View style={styles.scoreCenter}>
      <Text style={styles.scoreValue}>{Math.round(fill)}</Text>
      <Text style={styles.scoreLabel}>Quality Score</Text>
    </View>
  )}
</AnimatedCircularProgress>

const styles = StyleSheet.create({
  scoreCenter: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#171717',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#737373',
    marginTop: 4,
  },
});
```

### 7.4 Leaderboard Rows

```typescript
// Tailwind (Web)
<div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      {/* Rank */}
      <div className="w-8 h-8 rounded-full bg-brand-blue-100 flex items-center justify-center">
        <span className="text-sm font-bold text-brand-blue-700">1</span>
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <img
          src="/avatar.jpg"
          alt="User"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-gray-900">John Doe</p>
          <p className="text-xs text-gray-500">@johndoe</p>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="flex items-center gap-6">
      <div className="text-right">
        <p className="text-sm text-gray-500">Leads</p>
        <p className="text-lg font-bold text-gray-900">142</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Earnings</p>
        <p className="text-lg font-bold text-success-600">$7,100</p>
      </div>
    </div>
  </div>
</div>

// React Native
<View style={styles.leaderboardRow}>
  <View style={styles.rank}>
    <Text style={styles.rankText}>1</Text>
  </View>

  <Image source={{ uri: avatarUrl }} style={styles.avatar} />

  <View style={styles.userInfo}>
    <Text style={styles.userName}>John Doe</Text>
    <Text style={styles.userHandle}>@johndoe</Text>
  </View>

  <View style={styles.stats}>
    <Text style={styles.statValue}>142</Text>
    <Text style={styles.statLabel}>Leads</Text>
  </View>

  <View style={styles.stats}>
    <Text style={styles.earningsValue}>$7,100</Text>
    <Text style={styles.statLabel}>Earned</Text>
  </View>
</View>
```

### 7.5 Achievement Unlock Animation

```typescript
// React Native (with react-native-reanimated)
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';

const AchievementUnlock = ({ badge, onClose }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 2 }),
      withSpring(1, { damping: 3 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.unlockOverlay}>
        <Animated.View style={[styles.unlockCard, animatedStyle]}>
          <Text style={styles.unlockTitle}>Achievement Unlocked!</Text>
          <View style={styles.badgeContainer}>
            {/* Badge component */}
          </View>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
```

---

## 8. Dark Mode

### 8.1 Color Adaptations

**Light Mode** → **Dark Mode** mapping:

```css
/* Background */
#FFFFFF → #0A0A0A
#FAFAFA → #171717
#F5F5F5 → #262626

/* Text */
#171717 → #FAFAFA
#525252 → #A3A3A3
#A3A3A3 → #737373

/* Borders */
#E5E5E5 → #404040
#D4D4D4 → #525252

/* Surfaces */
White cards → #171717
Elevated surfaces → #262626

/* Brand colors remain the same */
#0066FF → #0066FF (but may need lightening to #3385FF for readability)
```

### 8.2 Component Dark Mode Examples

```typescript
// Tailwind (using dark: variant)
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border border-gray-200 dark:border-gray-700
">
  {children}
</div>

// Button in dark mode
<button className="
  bg-brand-blue-500
  text-white
  hover:bg-brand-blue-600
  dark:bg-brand-blue-600
  dark:hover:bg-brand-blue-500
">
  {children}
</button>

// Input in dark mode
<input className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border-gray-300 dark:border-gray-600
  placeholder:text-gray-400 dark:placeholder:text-gray-500
" />
```

### 8.3 Dark Mode Toggle (Web)

```typescript
// React hook
import { useEffect, useState } from 'react';

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return [isDark, setIsDark] as const;
};

// Toggle button
<button
  onClick={() => setIsDark(!isDark)}
  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
  aria-label="Toggle dark mode"
>
  {isDark ? <SunIcon /> : <MoonIcon />}
</button>
```

### 8.4 Dark Mode in React Native

```typescript
// Use system appearance
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

// Apply theme
<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.textPrimary }}>
    {content}
  </Text>
</View>
```

### 8.5 Image/Illustration Handling

For images that don't work in dark mode:
```css
/* Invert and reduce brightness for logos/illustrations */
.dark .invert-dark {
  filter: invert(1) brightness(0.8);
}

/* Or provide separate dark mode assets */
<img src={isDark ? '/logo-dark.svg' : '/logo-light.svg'} alt="Logo" />
```

---

## 9. Accessibility Guidelines

### 9.1 Color Contrast (WCAG AA)

**Minimum Ratios**:
- Normal text (<18px): **4.5:1**
- Large text (18px+ or 14px+ bold): **3:1**
- UI components (buttons, borders): **3:1**

**Testing**: Use WebAIM Contrast Checker or browser DevTools

**Compliant Pairings** (from our palette):
- White (#FFFFFF) + Gray 700 (#404040): 10.4:1 ✅
- White (#FFFFFF) + Brand Blue (#0066FF): 4.8:1 ✅
- Brand Blue (#0066FF) + White (#FFFFFF): 4.8:1 ✅
- Success Green (#10B981) + White: 2.9:1 ❌ (use for large text only)

### 9.2 Keyboard Navigation

**All interactive elements must be keyboard accessible**:
- Tab order follows logical visual order
- Enter/Space activates buttons and links
- Escape closes modals and dropdowns
- Arrow keys navigate menus and dropdowns
- Focus indicators are always visible

```typescript
// Skip to main content link (first focusable element)
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-brand-blue-600 focus:border focus:rounded-lg"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

### 9.3 Screen Reader Support

**Semantic HTML**:
```html
<!-- Use semantic elements -->
<header>, <nav>, <main>, <aside>, <footer>, <article>, <section>

<!-- Instead of -->
<div class="header">, <div class="nav">, etc.
```

**ARIA Labels**:
```typescript
// Icon-only button
<button aria-label="Delete lead">
  <TrashIcon />
</button>

// Modal
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm Action</h2>
  {/* Modal content */}
</div>

// Loading state
<button aria-busy="true" disabled>
  <Spinner /> Loading...
</button>

// Form errors
<input
  aria-invalid="true"
  aria-describedby="error-message"
/>
<p id="error-message" role="alert">
  This field is required
</p>
```

**Image Alt Text**:
```html
<!-- Informative images -->
<img src="/chart.png" alt="Line chart showing 25% increase in leads over last month" />

<!-- Decorative images -->
<img src="/decorative.svg" alt="" aria-hidden="true" />

<!-- Icons with adjacent text -->
<button>
  <CheckIcon aria-hidden="true" />
  <span>Approve Lead</span>
</button>
```

### 9.4 Touch Targets (Mobile)

**Minimum size**: 44x44px (iOS HIG) / 48x48dp (Material Design)

```typescript
// React Native
<TouchableOpacity
  style={{
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <Icon size={24} />
</TouchableOpacity>

// If icon is smaller, add padding to reach minimum
<TouchableOpacity style={{ padding: 12 }}>
  <Icon size={20} /> {/* 20 + 12*2 = 44px total */}
</TouchableOpacity>
```

### 9.5 Form Accessibility

```html
<!-- Proper label association -->
<label for="email">Email Address *</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
  aria-describedby="email-help"
/>
<p id="email-help">We'll never share your email</p>

<!-- Fieldset for grouped inputs -->
<fieldset>
  <legend>Lead Budget Range</legend>
  <label for="min-budget">Minimum</label>
  <input id="min-budget" type="number" />

  <label for="max-budget">Maximum</label>
  <input id="max-budget" type="number" />
</fieldset>

<!-- Error announcement -->
<div role="alert" aria-live="assertive">
  <p>Form submission failed. Please correct the errors below.</p>
</div>
```

### 9.6 Dynamic Content

```html
<!-- Live regions for dynamic updates -->
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

<!-- Assertive for urgent updates -->
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>

<!-- Loading state -->
<div aria-live="polite" aria-busy="true">
  Loading leads...
</div>
```

### 9.7 Reduced Motion

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Platform-Specific Implementation

### 10.1 Tailwind CSS Configuration (Next.js Web)

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: '#E6F0FF',
            100: '#CCE0FF',
            200: '#99C2FF',
            300: '#66A3FF',
            400: '#3385FF',
            500: '#0066FF',
            600: '#0052CC',
            700: '#003D99',
            800: '#002966',
            900: '#001433',
          },
          teal: {
            50: '#E6F9F7',
            100: '#CCF3EF',
            200: '#99E7DF',
            300: '#66DBCF',
            400: '#33CFBF',
            500: '#00B8A9',
            600: '#009387',
            700: '#006E65',
            800: '#004A44',
            900: '#002522',
          },
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF6B35',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.005em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
      },
      spacing: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      transitionDuration: {
        'fast': '100ms',
        'base': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
    },
  },
  plugins: [],
}
```

### 10.2 Shadcn/UI Customization

```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-brand-blue-500 text-white hover:bg-brand-blue-600 active:bg-brand-blue-700 focus-visible:ring-brand-blue-500",
        secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-400",
        success: "bg-success-500 text-white hover:bg-success-600 active:bg-success-700 focus-visible:ring-success-500",
        danger: "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 focus-visible:ring-danger-500",
        ghost: "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus-visible:ring-gray-400",
        warning: "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 focus-visible:ring-warning-500",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 10.3 React Native Theme Structure

```typescript
// theme/index.ts
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    // Brand
    brandBlue: '#0066FF',
    brandBlueHover: '#0052CC',
    brandTeal: '#00B8A9',

    // Semantic
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#FF6B35',
    warningBg: '#FFF7ED',
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',

    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Text
    textPrimary: '#171717',
    textSecondary: '#525252',
    textTertiary: '#A3A3A3',
    textDisabled: '#D4D4D4',
    textInverse: '#FFFFFF',

    // Border
    border: '#E5E5E5',
    borderHover: '#D4D4D4',
    borderFocus: '#0066FF',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    '4xl': 64,
  },

  typography: {
    displayLarge: {
      fontSize: 48,
      lineHeight: 52.8,
      fontWeight: '700' as const,
      letterSpacing: -1.44,
      fontFamily: 'Inter-Bold',
    },
    heading1: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.36,
      fontFamily: 'Inter-Bold',
    },
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
      fontFamily: 'Inter-Regular',
    },
    labelMedium: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
      letterSpacing: 0.12,
      fontFamily: 'Inter-Medium',
    },
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  shadows: {
    sm: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
    md: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
    lg: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  layout: {
    screenWidth: width,
    screenHeight: height,
    isSmallDevice: width < 375,
    isTablet: width >= 768,
  },
};

export type Theme = typeof theme;
```

### 10.4 React Native StyleSheet Examples

```typescript
// components/Button.tsx
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { theme } from '@/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: string;
  onPress: () => void;
  disabled?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  disabled
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, styles[`text_${variant}`]]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.brandBlue,
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  size_md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  size_lg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },

  // Text
  text: {
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  text_primary: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  text_secondary: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  text_success: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  text_danger: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
});
```

### 10.5 Platform-Specific Adaptations

```typescript
// React Native - Platform-specific styles
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },

  // iOS-specific safe area
  container: {
    ...Platform.select({
      ios: {
        paddingTop: 44, // Status bar
      },
      android: {
        paddingTop: 24,
      },
    }),
  },
});
```

---

## 11. Design QA Checklist

Before handing off to developers, ensure:

### Visual Design
- [ ] All colors are defined in design tokens (no hardcoded hex values)
- [ ] Typography scale is consistent across all components
- [ ] Spacing follows 4px base grid system
- [ ] Border radius is consistent (4px, 8px, 12px, 16px)
- [ ] Shadows follow elevation system (sm, md, lg, xl)

### Accessibility
- [ ] All text meets WCAG AA contrast requirements (4.5:1 for normal, 3:1 for large)
- [ ] Focus states are visible on all interactive elements
- [ ] Touch targets are minimum 44x44px on mobile
- [ ] All icons have accessible labels
- [ ] Forms have proper label associations

### Responsive Design
- [ ] Components work on mobile (320px), tablet (768px), and desktop (1280px+)
- [ ] Typography scales appropriately across breakpoints
- [ ] Touch targets are accessible on mobile
- [ ] Navigation adapts (hamburger on mobile, full nav on desktop)

### Component States
- [ ] All buttons have hover, active, focus, disabled, and loading states
- [ ] All inputs have default, focus, error, success, and disabled states
- [ ] Cards have hover states (web) and pressed states (mobile)
- [ ] Loading states are defined (spinner, skeleton)
- [ ] Empty states are designed
- [ ] Error states are designed with clear messaging

### Dark Mode
- [ ] All components have dark mode variants
- [ ] Color contrast is maintained in dark mode
- [ ] Images and illustrations work in dark mode
- [ ] Brand colors are adjusted for readability

### Platform Consistency
- [ ] Design tokens are cross-platform compatible
- [ ] Components have both Tailwind (web) and React Native implementations
- [ ] Platform-specific patterns are documented (iOS vs Android)

### Documentation
- [ ] All design tokens are documented
- [ ] Component variants and sizes are specified
- [ ] Usage guidelines are clear
- [ ] Code examples are provided for both platforms
- [ ] Accessibility requirements are listed

---

## 12. Developer Handoff Notes

### For Frontend Developers

**Web (Next.js + Tailwind)**:
1. Install Tailwind CSS and configure with provided `tailwind.config.js`
2. Use Shadcn/UI as base component library
3. Customize Shadcn components with design tokens
4. Implement dark mode with `class` strategy
5. Use Inter font from Google Fonts
6. Install Lucide React for icons

**Mobile (React Native + Expo)**:
1. Create theme file with provided theme object
2. Install Lucide React Native for icons
3. Set up Inter font (expo-google-fonts)
4. Use Platform-specific shadow styles
5. Implement dark mode with `useColorScheme()`
6. Use react-native-safe-area-context for safe areas

### Key Principles
- **NO hardcoded colors** - always use theme tokens
- **Mobile-first** - design for mobile, enhance for desktop
- **Accessibility-first** - WCAG AA compliance is mandatory
- **Consistent spacing** - use 4px grid system
- **Smooth transitions** - 200ms default duration
- **Dark mode support** - all components must support dark mode

### Testing Checklist
- [ ] Test all components in light and dark mode
- [ ] Test on mobile (iOS + Android) and desktop
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test color contrast ratios
- [ ] Test responsive breakpoints (320px, 768px, 1024px, 1280px)
- [ ] Test touch targets on mobile (minimum 44x44px)

---

**This design system is the single source of truth for LeadScout's visual identity. All UI implementation must reference this guide to ensure consistency, accessibility, and quality across both web and mobile platforms.**

---

## Document Metadata

**Created**: 2025-11-15
**Platform**: Next.js (Web) + React Native (Mobile)
**Stack**: Tailwind CSS, Shadcn/UI, Lucide Icons, Inter Font
**Accessibility**: WCAG 2.1 AA Compliant
**Version**: 1.0

**Next Steps**: Pass to Product Designer for page-specific UI/UX designs
