# PFET Project Memory

## Project Overview
Personal Finance and Expense Tracker (PFET) for Kenyan salary workers.
- **Stack**: Next.js 14, TypeScript, Supabase, shadcn/ui, Tailwind CSS, Recharts
- **Currency**: KES (Kenyan Shilling)
- **Features**: Accounts, Income, Expenses, Budgets, Loans, Goals, Reports, M-Pesa integration

## Technical Patterns
- Zod validation with manual type definitions (avoid `z.infer` due to Zod 4 issues)
- Supabase type bypass: `(supabase.from('table') as any)` for strict typing issues
- Always set `isLoading: false` before early returns in hooks when `!user`
- Currency formatting: `Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' })`

---

# Frontend Design Guidelines

## Design Thinking Process

Before coding any UI, establish a BOLD aesthetic direction:

1. **Purpose**: What problem does this interface solve? Who uses it?
2. **Tone**: Pick a clear aesthetic direction (minimal, refined, playful, professional, etc.)
3. **Constraints**: Technical requirements (framework, performance, accessibility)
4. **Differentiation**: What makes this UNFORGETTABLE?

**CRITICAL**: Choose a clear conceptual direction and execute with precision. The key is **intentionality, not intensity**.

## Implementation Requirements

Code must be:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Typography
- Choose fonts that are **beautiful, unique, and interesting**
- **Avoid generic fonts** (Arial, Inter, Roboto, system fonts)
- Use **unexpected, characterful font choices**
- Pair a **distinctive display font** with a **refined body font**

## Color & Theme
- Commit to a **cohesive aesthetic**
- Use **CSS variables for consistency**
- **Dominant colors with sharp accents** outperform timid, evenly-distributed palettes

## Motion & Animation
- Use animations for **effects and micro-interactions**
- Prioritize **CSS-only solutions for HTML**
- Focus on **high-impact moments**: One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions
- Use **scroll-triggering and hover states** that surprise

## Spatial Composition
- **Unexpected layouts**
- **Asymmetry**
- **Overlap**
- **Grid-breaking elements**
- **Generous negative space OR controlled density**

## Backgrounds & Visual Details
- Create **atmosphere and depth** rather than solid colors
- Add **contextual effects and textures** matching the aesthetic:
  - Gradient meshes
  - Noise textures
  - Geometric patterns
  - Layered transparencies
  - Dramatic shadows
  - Decorative borders
  - Grain overlays

## What to NEVER Do
- Generic AI-generated aesthetics
- Overused font families (Inter, Roboto, Arial, system fonts)
- Cliched color schemes (purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design lacking context-specific character
- Convergence on common choices across projects

## Key Principles

1. **Interpret creatively** - Make unexpected choices that feel genuinely designed for the context
2. **No design should be the same** - Vary between themes, fonts, and aesthetics
3. **Match complexity to vision** - Maximalist needs elaborate code; minimalist needs restraint and precision
4. **Elegance from intentionality** - Execute the vision well with precision
5. **Show extraordinary creative work** - Commit fully to a distinctive vision
