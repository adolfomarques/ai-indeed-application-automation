---
name: JobPilot AI
description: State-of-the-art job automation with a premium Apple-Pro aesthetic.
colors:
  primary: "#6366f1"
  primary-light: "#8b5cf6"
  neutral-bg: "#0a0b14"
  neutral-card: "rgba(17, 24, 39, 0.7)"
  border-glass: "rgba(255, 255, 255, 0.08)"
typography:
  display:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "22px"
    fontWeight: 700
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
rounded:
  md: "12px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
---

# Design System: JobPilot AI

## 1. Overview

**Creative North Star: "The Liquid Automata"**

JobPilot AI is a premium automation suite that blends technical precision with organic fluidity. The system prioritizes "Kinetic Clarity"—where every transition and state change feels intentional, smooth, and liquid. It follows a "Refined and Restrained" philosophy, stripping away unnecessary decoration to focus on the intelligence of the pipeline.

The aesthetic is "Apple-Pro": high-end materials, precise typography, and a sophisticated dark environment. It rejects generic SaaS clutter, excessive gradients, and static, "dead" interfaces.

**Key Characteristics:**
- **Digital Materiality**: Multi-layered glass surfaces with varying levels of frost.
- **Micro-Fluidity**: Subtle, exponential easing for all state changes.
- **Information Elegance**: High data density handled with strict typographic hierarchy.

## 2. Colors

The palette is anchored in "Deep Obsidian" with "Indigo Pulse" accents, wrapped in "Glass Frost" textures.

### Primary
- **Indigo Pulse** (#6366f1): Used for primary actions, active states, and critical pipeline progress.
- **Violet Glow** (#8b5cf6): Secondary accent used in gradients and highlights to add depth.

### Neutral
- **Deep Obsidian** (#0a0b14): The primary canvas. A tinted dark neutral that avoids pure black for a more premium feel.
- **Slate Shadow** (#111827): Surface color for secondary containers.
- **Glass Frost** (rgba(255, 255, 255, 0.03)): The material for interactive surfaces and cards.

**The Glass Scarcity Rule.** Glass surfaces must be rare and purposeful. Overuse leads to visual noise; scarcity creates focus.

## 3. Typography

**Display & Body Font:** Inter (System fallback)
**Label/Mono Font:** JetBrains Mono

### Hierarchy
- **Display** (700, 22px, 1.2): Used for page headers and primary metrics.
- **Headline** (600, 18px, 1.3): Section titles and card headings.
- **Body** (400, 14px, 1.5): Primary content and descriptions. Max line length 70ch.
- **Label** (600, 11px, 1.0, Uppercase): Nav section labels and small metadata.

**The Semantic Weight Rule.** Use font weight (500/600) rather than color to create hierarchy among text elements of the same size.

## 4. Elevation

The system uses "Tonal Layering" combined with "Glass Materials" to create depth. There are no heavy shadows; depth is conveyed through border highlights and backdrop blurs.

**The Response-Depth Rule.** Surfaces are flat at rest. Depth (blur increase or subtle glow) appears only as a response to state (hover, active) or important notification.

## 5. Components

### Buttons
- **Shape**: Refined radius (10px).
- **Primary**: Indigo-to-Violet gradient with a subtle indigo glow (#6366f1, 0 4px 15px rgba(99, 102, 241, 0.3)).
- **Hover**: 1px upward translation with increased glow.

### Cards
- **Corner Style**: Large radius (16px).
- **Background**: Glass Frost with a 20px backdrop-blur.
- **Border**: 1px solid translucent white (rgba(255, 255, 255, 0.08)).

### Sidebar
- **Style**: Ultra-dark glass (rgba(10, 11, 20, 0.95)) with a 20px blur. 1px right border.

## 6. Do's and Don'ts

### Do:
- **Do** use OKLCH for any new color derivations to maintain perceptual uniformity.
- **Do** use exponential easing (`cubic-bezier(0.4, 0, 0.2, 1)`) for all transitions.
- **Do** tint neutrals toward the primary indigo hue (chroma 0.01).

### Don't:
- **Don't** use border-left/right stripes as colored accents on cards.
- **Don't** use pure black (#000) or pure white (#fff).
- **Don't** use emojis for primary navigation; use clean, geometric icons.
