# Spice-Themed Design System

## Color Palette
Override shadcn/ui CSS variables in `src/app/globals.css`:
- **Turmeric** (#E6B04B) — Primary accent, QA role
- **Chili** (#C5351F) — Danger states, Admin role
- **Coriander** (#4A7C59) — Success states, Developer role
- **Cinnamon** (#5D4037) — Secondary, Stakeholder role
- **Cream** (#FFF8DC) — Background

Role-specific colors applied via `data-role` attribute on `<body>`. Zero runtime cost.

## UI Framework
- Tailwind CSS v4 with CSS variable theming
- shadcn/ui with stone base overridden by spice palette
- Radix primitives underneath

## Dashboard Widgets
- Every widget wrapped in `<ErrorBoundary fallback={<WidgetError />}>`
- Loading: use `<WidgetSkeleton variant="chart|table|stats|list" />` — no custom spinners
- Staleness badges: amber >10min, red >30min
- Config-driven: widget registry in `src/modules/dashboard/config/widget-registry.ts`
- Grid: 3-column (desktop 1280px+), 2-column (tablet 768px+)

## Anti-Patterns
- NEVER use hardcoded hex colors — use CSS custom properties
- NEVER create custom loading spinners — use `<WidgetSkeleton />`
- NEVER put `"use client"` on components that don't need interactivity
