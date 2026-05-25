<!--
STATUS: ✅ IMPLEMENTADO
Completado: 2024
Archivos: app/frontend/styles/tokens.css con color tokens
-->

# 003 - Fix Missing Colors and Layout Issues

## Problem Statement

The design system colors and container centering are not being applied to the landing pages. This is caused by Tailwind CSS v4's new configuration approach:

1. **Colors not applied**: Tailwind v4 doesn't automatically read `tailwind.config.js`. The config must be explicitly imported via `@config` directive in CSS.
2. **Container not centered**: The `container` utility settings (`center: true`, `padding: "2rem"`) from the config are not being applied.

## Root Cause Analysis

Tailwind CSS v4 has a different configuration approach:
- v3: Reads `tailwind.config.js` automatically
- v4: Requires `@config` directive in CSS or uses CSS-native `@theme` for customization

Current setup:
```css
/* application.css */
@import "tailwindcss";
@import "../styles/tokens.css";
```

Missing:
```css
@config "../../../tailwind.config.js";
```

## User Stories

### US-3.1: Design System Colors
**As a** user visiting the landing page
**I want to** see the correct brand colors (teal/cyan primary color)
**So that** the website has a consistent and professional appearance

**Acceptance Criteria:**
- [ ] Primary color (teal: `174 55% 47%`) is visible in buttons, links, and accents
- [ ] Background uses the design system background color
- [ ] Text colors use foreground/muted-foreground appropriately
- [ ] Dark mode colors work when `.dark` class is applied

### US-3.2: Centered Container Layout
**As a** user viewing the landing page
**I want to** see content properly centered with consistent margins
**So that** the page is readable and visually balanced

**Acceptance Criteria:**
- [ ] Content is centered horizontally on the page
- [ ] Container has consistent padding (2rem on sides)
- [ ] Maximum width is constrained (1400px on 2xl screens)
- [ ] Responsive behavior works correctly

### US-3.3: All UI Components Use Design Tokens
**As a** developer
**I want** all UI components to use the design system tokens
**So that** styling is consistent and maintainable

**Acceptance Criteria:**
- [ ] Button component uses `bg-primary` and shows correct color
- [ ] Card component uses `bg-card` color
- [ ] Borders use `border` color token
- [ ] All semantic colors (success, warning, info, destructive) work

## Technical Implementation

### Option A: Import Config via @config (Recommended)

Add config import to `application.css`:

```css
@import "tailwindcss";
@config "../../../tailwind.config.js";
@import "../styles/tokens.css";
```

**Pros:**
- Minimal changes
- Keeps existing tailwind.config.js
- All theme extensions work immediately

**Cons:**
- Relative path can be fragile

### Option B: Migrate to CSS @theme

Convert `tailwind.config.js` theme to CSS `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-primary: hsl(174 55% 47%);
  --color-primary-foreground: hsl(0 0% 100%);
  /* ... all other colors */

  --container-center: true;
  --container-padding: 2rem;
  --container-max-width-2xl: 1400px;
}

@import "../styles/tokens.css";
```

**Pros:**
- Native v4 approach
- No config file needed
- Better IDE support for CSS

**Cons:**
- More migration work
- Need to convert all JS config to CSS

### Option C: Hybrid Approach

Use `@config` for complex settings (animations, plugins) and `@theme` for simple overrides.

## Implementation Plan

### Phase 1: Fix Configuration (Immediate)
1. Add `@config` directive to `application.css`
2. Verify colors are applied
3. Verify container centering works

### Phase 2: Verification
1. Test all landing pages visually
2. Verify buttons show primary color
3. Verify container is centered with padding
4. Test responsive breakpoints

### Phase 3: Dark Mode (Optional)
1. Verify dark mode tokens work
2. Add dark mode toggle if needed

## Files to Modify

1. `app/frontend/entrypoints/application.css` - Add @config directive
2. Potentially `app/frontend/styles/tokens.css` - Ensure compatibility

## Testing

- Visual inspection of landing pages
- Verify in browser DevTools that CSS variables are applied
- Check computed styles for container (margin, padding, max-width)

## Dependencies

- Tailwind CSS v4.1.17 (already installed)
- @tailwindcss/postcss v4.1.17 (already installed)
- tailwindcss-animate v1.0.7 (already installed)
