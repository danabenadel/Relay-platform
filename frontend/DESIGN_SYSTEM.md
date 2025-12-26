# Design System - Relay


---

## Table des matières

- [Couleurs](#couleurs)
- [Gradients](#gradients)
- [Backgrounds](#backgrounds)
- [Bordures](#bordures)
- [États](#états)
- [Typographie](#typographie)
- [Spacing](#spacing)
- [Composants](#composants)

---

## Couleurs

### Palette principale

**Bleu**
```css
bg-blue-400
bg-blue-500
bg-blue-600
bg-blue-700

text-blue-200
text-blue-300
text-blue-400
```

**Indigo**
```css
bg-indigo-500
bg-indigo-600
bg-indigo-700
bg-indigo-900
```

**Purple**
```css
bg-purple-400
bg-purple-600
bg-purple-700

text-purple-200
text-purple-400
```

**Slate**
```css
bg-slate-800
bg-slate-900
```

### Couleurs d'état

**Vert (Success)**
```css
bg-green-400
bg-green-500
bg-green-600
bg-green-700

bg-green-500/20
bg-green-600/20

text-green-300
text-green-400
```

**Rouge (Error)**
```css
bg-red-500
bg-red-600
bg-red-700

bg-red-500/20
bg-red-600/20

text-red-300
text-red-400
```

**Jaune (Warning)**
```css
bg-yellow-400
bg-yellow-500

text-yellow-300
text-yellow-400
```

**Gris (Inactive)**
```css
bg-gray-500/20
text-gray-300
```

### Blanc et noir

```css
/* Blanc avec opacité */
bg-white/5
bg-white/10
bg-white/20

text-white
text-white/50
text-white/60
text-white/70
text-white/80

border-white/10
border-white/20

/* Noir */
bg-black/50
```

---

## Gradients

### Background principal
```css
bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900
```

### Boutons

**Primary**
```css
bg-gradient-to-r from-blue-600 to-purple-600
hover:from-blue-700 hover:to-purple-700
```

**Auth**
```css
bg-gradient-to-r from-blue-600 to-indigo-600
hover:from-blue-700 hover:to-indigo-700
```

**Success**
```css
bg-gradient-to-r from-green-600 to-blue-600
hover:from-green-700 hover:to-blue-700
```

**Secondary**
```css
bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-700 hover:to-pink-700
```

### Overlays

```css
bg-gradient-to-br from-blue-500/5 to-indigo-500/5
bg-gradient-to-r from-blue-600/10 to-green-600/10
bg-gradient-to-r from-blue-600/10 to-purple-600/10
```

---

## Backgrounds

### Glass effect
```css
bg-white/10 backdrop-blur-xl border border-white/20
```

### Cards
```css
/* Standard */
bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20

/* Hover */
hover:bg-white/10
hover:bg-white/20
```

### Navigation
```css
bg-white/10 backdrop-blur-xl border-b border-white/20
```

### Headers
```css
bg-white/5 backdrop-blur-sm border-b border-white/10
```

### Modals
```css
/* Backdrop */
bg-black/50 backdrop-blur-sm

/* Content */
bg-slate-800 rounded-2xl border border-white/20
```

---

## Bordures

### Épaisseurs
```css
border       /* 1px */
border-2     /* 2px */
border-b     /* Bottom only */
```

### Couleurs
```css
border-white/10
border-white/20
border-blue-500
border-green-500
border-red-500
border-red-500/30
border-yellow-500/30
border-green-500/30
```

---

## États

### Badges

**Actif**
```css
bg-green-500/20 text-green-300 px-3 py-1 rounded-full
```

**Inactif**
```css
bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full
```

**Populaire**
```css
bg-yellow-500/20 text-yellow-300 border border-yellow-500/30
```

### Alertes

**Success**
```css
bg-green-500/20 border border-green-500/30 rounded-xl p-4
```

**Error**
```css
bg-red-500/20 border border-red-500/30 rounded-xl p-4
```

**Info**
```css
bg-blue-600/10 border border-blue-500/30 rounded-xl p-4
```

**Warning**
```css
bg-red-500/10 border border-red-500/30 rounded-lg p-3
```

---

## Typographie

### Tailles
```css
text-4xl    /* h1 */
text-3xl    /* h2 */
text-2xl    /* h3 */
text-xl     /* h4 */
text-lg     /* h5 */
text-base   /* Corps */
text-sm     /* Secondaire */
text-xs     /* Labels, badges */
```

### Poids
```css
font-bold      /* Titres */
font-medium    /* Sous-titres, boutons */
font-normal    /* Corps */
```

### Couleurs
```css
text-white           /* Principal */
text-white/80        /* Hover */
text-white/70        /* Secondaire */
text-white/60        /* Tertiaire */
text-white/50        /* Placeholders */

text-blue-200
text-blue-300
text-green-300
text-green-400
text-red-300
text-red-400
text-yellow-300
text-purple-200
```

---

## Spacing

### Padding
```css
/* Cards */
p-4     /* Small */
p-6     /* Standard */
p-8     /* Large */

/* Buttons */
px-3 py-2    /* Small */
px-4 py-2    /* Standard */
px-6 py-3    /* Large */
px-8 py-3    /* Extra large */
```

### Gap
```css
gap-2        /* Tight */
gap-3        /* Standard */
gap-4        /* Comfortable */
gap-6        /* Spacious */

space-y-2
space-y-3
space-y-4
space-y-6
space-y-8
```

### Border Radius
```css
rounded-lg      /* 8px */
rounded-xl      /* 12px */
rounded-2xl     /* 16px */
rounded-3xl     /* 24px */
rounded-full    /* Pills, badges */
```

### Max Width
```css
max-w-md       /* 448px */
max-w-2xl      /* 672px */
max-w-5xl      /* 1024px */
max-w-7xl      /* 1280px */
```

---

## Composants

### Boutons

**Primary**
```css
px-6 py-3
bg-gradient-to-r from-blue-600 to-purple-600
text-white
rounded-xl
hover:from-blue-700 hover:to-purple-700
transition-all
font-medium
```

**Secondary**
```css
px-4 py-2
bg-white/10
text-white
rounded-xl
hover:bg-white/20
transition-all
```

**Danger**
```css
px-4 py-2
bg-red-600
hover:bg-red-700
text-white
rounded-lg
transition-all
```

**Subtle**
```css
px-4 py-2
bg-blue-600/20
border border-blue-500/30
text-blue-300
rounded-lg
hover:bg-blue-600/30
```

### Inputs
```css
w-full
px-4 py-3
bg-white/10
border border-white/20
rounded-xl
text-white
placeholder-white/50
focus:outline-none
focus:ring-2
focus:ring-blue-500
```

### Cards
```css
bg-white/10
backdrop-blur-xl
rounded-2xl
p-6
border border-white/20
```

### Navigation

**Active**
```css
text-white
px-4 py-2
rounded-lg
bg-white/20
```

**Inactive**
```css
text-white/80
hover:text-white
px-4 py-2
rounded-lg
hover:bg-white/10
```

### Filtres

**Active**
```css
bg-blue-600
text-white
px-4 py-2
rounded-xl
border border-white/20
```

**Inactive**
```css
bg-white/10
text-white/80
hover:bg-white/20
px-4 py-2
rounded-xl
border border-white/20
```

### Sélection

**Selected**
```css
border-2
border-blue-500
bg-blue-600/20
rounded-xl
p-4
```

**Unselected**
```css
border-2
border-white/20
bg-white/5
hover:bg-white/10
rounded-xl
p-4
```

---

## Animations

```css
transition-all
transition-colors
transition-transform

duration-300
duration-500

hover:-translate-y-1
hover:scale-105

animate-spin
animate-pulse
```

---

## Patterns

### Glass Card
```html
<div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
  <!-- Content -->
</div>
```

### Modal
```html
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div class="bg-slate-800 rounded-2xl p-6 max-w-md mx-4 border border-white/20">
    <!-- Content -->
  </div>
</div>
```

### Status Badge
```html
<span class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
  Actif
</span>
```

---

