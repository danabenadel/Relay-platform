# Charte Graphique - AREA Platform (Relay)

## Table des matières

1. [Introduction](#introduction)
2. [Identité Visuelle](#identité-visuelle)
3. [Palette de Couleurs](#palette-de-couleurs)
4. [Typographie](#typographie)
5. [Composants UI](#composants-ui)
6. [Iconographie](#iconographie)
7. [Espacements & Grilles](#espacements--grilles)
8. [Effets Visuels](#effets-visuels)
9. [Responsive Design](#responsive-design)
10. [Accessibilité](#accessibilité)
11. [Guide d'Utilisation](#guide-dutilisation)

---

## Introduction

### Philosophie du Design

La plateforme AREA (Relay) adopte un **design moderne et épuré** inspiré du glass-morphism et du dark mode. L'interface privilégie :

- **Clarté** : Hiérarchie visuelle forte et lisibilité optimale
- **Modernité** : Effets de transparence et de blur
- **Cohérence** : Composants réutilisables et prévisibles
- **Accessibilité** : Contraste élevé et support des déficiences visuelles

### Principes de Design

1. **Dark First** : Fond sombre avec éléments glassmorphiques
2. **Gradient Accent** : Utilisation de dégradés pour les CTA et éléments importants
3. **Micro-interactions** : Animations subtiles sur hover et focus
4. **Whitespace** : Espacement généreux pour la lisibilité
5. **Feedback Visuel** : États clairs (loading, success, error)

---

## Identité Visuelle

### Logo

Le logo "Relay" utilise une typographie moderne avec un dégradé bleu-violet :

```css
.relay-logo {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Variations** :
- Logo complet : "Relay" avec icône
- Logo réduit : Icône seule (pour mobile)
- Logo monochrome : Blanc sur fond sombre

### Icône

L'icône représente des flux de données connectés (inspiration : automation, workflows).

---

## Palette de Couleurs

### Couleurs Primaires

#### Blue (Principal)

Utilisé pour les CTA, liens, et éléments interactifs.

| Nom | Hex | CSS Variable | Usage |
|-----|-----|--------------|-------|
| Blue 400 | `#60a5fa` | `--relay-primary-400` | Hover states |
| Blue 500 | `#3b82f6` | `--relay-primary-500` | **Primary color** |
| Blue 600 | `#2563eb` | `--relay-primary-600` | Active states |
| Blue 700 | `#1d4ed8` | `--relay-primary-700` | Pressed states |

```css
/* Définition dans main.css */
:root {
  --relay-primary-400: #60a5fa;
  --relay-primary-500: #3b82f6;
  --relay-primary-600: #2563eb;
  --relay-primary-700: #1d4ed8;
}
```

**Exemples d'utilisation** :
- Boutons principaux
- Liens
- Badges actifs
- Icônes interactives

#### Indigo (Secondaire)

Utilisé pour les accents et les éléments de différenciation.

| Nom | Hex | CSS Variable | Usage |
|-----|-----|--------------|-------|
| Indigo 500 | `#6366f1` | `--relay-secondary-500` | Accents |
| Indigo 600 | `#4f46e5` | `--relay-secondary-600` | **Secondary color** |
| Indigo 700 | `#4338ca` | `--relay-secondary-700` | Dark accents |

**Exemples d'utilisation** :
- Boutons secondaires
- Badges de statut
- Éléments de navigation actifs

### Couleurs d'Accent

#### Purple (Accent Créatif)

| Nom | Hex | CSS Variable |
|-----|-----|--------------|
| Purple 500 | `#a855f7` | `--relay-accent-purple-500` |
| Purple 600 | `#7c3aed` | `--relay-accent-purple-600` |

**Usage** : Éléments créatifs, workflow "process", AI features

#### Cyan (Accent Technique)

| Nom | Hex | CSS Variable |
|-----|-----|--------------|
| Cyan 500 | `#06b6d4` | `--relay-accent-cyan-500` |
| Cyan 600 | `#0891b2` | `--relay-accent-cyan-600` |

**Usage** : Éléments techniques, data visualization

#### Green (Success)

| Nom | Hex | CSS Variable |
|-----|-----|--------------|
| Green 400 | `#4ade80` | `--relay-accent-green-400` |
| Green 500 | `#22c55e` | `--relay-accent-green-500` |
| Green 600 | `#16a34a` | `--relay-accent-green-600` |

**Usage** : Messages de succès, badges actifs, confirmations

### Couleurs de Statut

#### Error (Rouge)

| Nom | Hex | Tailwind | Usage |
|-----|-----|----------|-------|
| Red 400 | `#f87171` | `red-400` | Error hover |
| Red 500 | `#ef4444` | `red-500` | **Error** |
| Red 600 | `#dc2626` | `red-600` | Error active |

**Usage** : Messages d'erreur, badges d'erreur, boutons de suppression

#### Warning (Jaune)

| Nom | Hex | Tailwind | Usage |
|-----|-----|----------|-------|
| Yellow 400 | `#facc15` | `yellow-400` | Warning hover |
| Yellow 500 | `#eab308` | `yellow-500` | **Warning** |
| Yellow 600 | `#ca8a04` | `yellow-600` | Warning active |

**Usage** : Messages d'avertissement, badges "en attente"

#### Info (Bleu clair)

| Nom | Hex | Tailwind |
|-----|-----|----------|
| Sky 400 | `#38bdf8` | `sky-400` |
| Sky 500 | `#0ea5e9` | `sky-500` |

**Usage** : Messages informatifs, tooltips

#### Inactive (Gris)

| Nom | Hex | Tailwind | Usage |
|-----|-----|----------|-------|
| Gray 400 | `#9ca3af` | `gray-400` | Inactive text |
| Gray 500 | `#6b7280` | `gray-500` | **Inactive** |
| Gray 600 | `#4b5563` | `gray-600` | Disabled |

**Usage** : Badges inactifs, éléments désactivés

### Couleurs de Background

#### Dark Backgrounds

| Nom | Hex | Tailwind | Usage |
|-----|-----|----------|-------|
| Slate 900 | `#0f172a` | `slate-900` | **Primary background** |
| Slate 800 | `#1e293b` | `slate-800` | Card backgrounds |
| Slate 700 | `#334155` | `slate-700` | Hover states |

#### Glass Surfaces

| Nom | RGBA | CSS Variable | Usage |
|-----|------|--------------|-------|
| Glass White 10% | `rgba(255, 255, 255, 0.1)` | `--relay-surface-glass` | **Cards, modals** |
| Glass White 15% | `rgba(255, 255, 255, 0.15)` | `--relay-surface-glass-hover` | Hover states |
| Glass White 5% | `rgba(255, 255, 255, 0.05)` | `--relay-surface-glass-subtle` | Backgrounds |

**Bordures** :
| Nom | RGBA | CSS Variable |
|-----|------|--------------|
| Border White 20% | `rgba(255, 255, 255, 0.2)` | `--relay-surface-glass-border` |
| Border White 10% | `rgba(255, 255, 255, 0.1)` | `--relay-border-subtle` |

### Couleurs de Texte

| Usage | Color | Tailwind | Opacité |
|-------|-------|----------|---------|
| Titre principal | Blanc | `text-white` | 100% |
| Texte principal | Blanc | `text-white/90` | 90% |
| Texte secondaire | Blanc | `text-white/70` | 70% |
| Texte tertiaire | Blanc | `text-white/50` | 50% |
| Placeholder | Blanc | `text-white/30` | 30% |

### Gradients

#### Gradient Primary (Bleu → Violet)

```css
--relay-gradient-primary: linear-gradient(135deg, #2563eb, #7c3aed);
```

**Usage** :
- Boutons CTA principaux
- Headers de sections importantes
- Badges premium

```html
<button class="bg-gradient-to-r from-blue-600 to-purple-600">
  Créer une AREA
</button>
```

#### Gradient Auth (Bleu → Indigo)

```css
--relay-gradient-auth: linear-gradient(135deg, #2563eb, #4f46e5);
```

**Usage** :
- Pages d'authentification
- Boutons de connexion OAuth

#### Gradient Success (Vert → Bleu)

```css
--relay-gradient-success: linear-gradient(135deg, #22c55e, #3b82f6);
```

**Usage** :
- Messages de succès
- Indicateurs de progression complète

#### Gradient Background (Slate → Blue → Indigo)

```css
--relay-gradient-background: linear-gradient(135deg, #0f172a, #1e3a8a, #312e81);
```

**Usage** :
- Background de l'application
- Landing pages

```html
<body class="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
```

### Couleurs de Workflow

Pour différencier visuellement les étapes d'un workflow :

| Étape | Couleur | Tailwind | Usage |
|-------|---------|----------|-------|
| Trigger | Bleu | `bg-blue-500/20` | Actions/Triggers |
| Process | Violet | `bg-purple-500/20` | Traitement |
| Action | Indigo | `bg-indigo-500/20` | Réactions |

**Exemple** :

```html
<div class="flex gap-4">
  <div class="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
    <h3>Trigger</h3>
  </div>
  <div class="p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl">
    <h3>Process</h3>
  </div>
  <div class="p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-xl">
    <h3>Action</h3>
  </div>
</div>
```

---

## Typographie

### Font Family

**Police principale** : **Inter** (Google Fonts)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**Alternatives** :
- `system-ui` : Police système
- `-apple-system` : Police iOS/macOS
- `Segoe UI` : Police Windows

### Échelle Typographique

#### Headers

| Niveau | Taille | Line Height | Weight | Tailwind |
|--------|--------|-------------|--------|----------|
| H1 | 48px | 1.2 | 700 | `text-5xl font-bold` |
| H2 | 36px | 1.3 | 700 | `text-4xl font-bold` |
| H3 | 30px | 1.3 | 600 | `text-3xl font-semibold` |
| H4 | 24px | 1.4 | 600 | `text-2xl font-semibold` |
| H5 | 20px | 1.4 | 600 | `text-xl font-semibold` |
| H6 | 18px | 1.5 | 600 | `text-lg font-semibold` |

**Exemple** :

```html
<h1 class="text-5xl font-bold text-white">
  Créez votre première AREA
</h1>

<h2 class="text-4xl font-bold text-white/90">
  Connectez vos services
</h2>
```

#### Body Text

| Type | Taille | Line Height | Weight | Tailwind |
|------|--------|-------------|--------|----------|
| Large | 18px | 1.6 | 400 | `text-lg` |
| Base | 16px | 1.6 | 400 | `text-base` |
| Small | 14px | 1.5 | 400 | `text-sm` |
| Tiny | 12px | 1.4 | 400 | `text-xs` |

**Exemple** :

```html
<p class="text-base text-white/70">
  Une AREA connecte un trigger à une action pour automatiser vos tâches.
</p>

<p class="text-sm text-white/50">
  Créée le 15 janvier 2025
</p>
```

#### Labels & Buttons

| Type | Taille | Weight | Transform | Tailwind |
|------|--------|--------|-----------|----------|
| Button Large | 16px | 600 | None | `text-base font-semibold` |
| Button Medium | 14px | 600 | None | `text-sm font-semibold` |
| Button Small | 12px | 600 | None | `text-xs font-semibold` |
| Label | 14px | 500 | None | `text-sm font-medium` |
| Caption | 12px | 500 | Uppercase | `text-xs font-medium uppercase` |

**Exemple** :

```html
<button class="text-base font-semibold">
  Créer une AREA
</button>

<label class="text-sm font-medium text-white">
  Nom de l'AREA
</label>

<span class="text-xs font-medium uppercase text-white/50 tracking-wider">
  Services
</span>
```

### Font Weights

| Nom | Weight | Tailwind | Usage |
|-----|--------|----------|-------|
| Light | 300 | `font-light` | Texte décoratif |
| Regular | 400 | `font-normal` | **Body text** |
| Medium | 500 | `font-medium` | Labels, captions |
| Semibold | 600 | `font-semibold` | **Headers, buttons** |
| Bold | 700 | `font-bold` | Titres principaux |
| Extrabold | 800 | `font-extrabold` | Emphase forte |

### Line Heights

| Nom | Value | Tailwind | Usage |
|-----|-------|----------|-------|
| Tight | 1.2 | `leading-tight` | Grands titres |
| Snug | 1.3 | `leading-snug` | Headers |
| Normal | 1.5 | `leading-normal` | **Body text** |
| Relaxed | 1.6 | `leading-relaxed` | Paragraphes longs |

### Letter Spacing

| Nom | Value | Tailwind | Usage |
|-----|-------|----------|-------|
| Tighter | -0.05em | `tracking-tighter` | Grands titres |
| Tight | -0.025em | `tracking-tight` | Headers |
| Normal | 0em | `tracking-normal` | **Default** |
| Wide | 0.025em | `tracking-wide` | Labels |
| Wider | 0.05em | `tracking-wider` | Captions uppercase |

---

## Composants UI

### Boutons

#### Bouton Primary

**Design** :
- Background : Gradient bleu → violet
- Text : Blanc, semibold
- Padding : `px-6 py-3`
- Border radius : `rounded-xl`
- Transition : Smooth hover

```html
<button class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
  Créer une AREA
</button>
```

**Variantes** :

```html
<!-- Large -->
<button class="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl">
  Commencer
</button>

<!-- Small -->
<button class="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg">
  Sauvegarder
</button>
```

#### Bouton Secondary

**Design** :
- Background : Glass (white/10)
- Border : white/20
- Text : Blanc
- Hover : Background white/15

```html
<button class="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all duration-200">
  Annuler
</button>
```

#### Bouton Outline

```html
<button class="px-6 py-3 border-2 border-blue-500 text-blue-400 font-semibold rounded-xl hover:bg-blue-500/10 transition-all duration-200">
  En savoir plus
</button>
```

#### Bouton Danger

```html
<button class="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200">
  Supprimer
</button>
```

#### Bouton Success

```html
<button class="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200">
  Activer
</button>
```

#### Bouton Icon

```html
<button class="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-all">
  <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-white" />
</button>
```

#### États

```html
<!-- Disabled -->
<button class="... opacity-50 cursor-not-allowed" disabled>
  Créer
</button>

<!-- Loading -->
<button class="... relative" disabled>
  <span class="opacity-0">Créer</span>
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
</button>
```

### Cards

#### Glass Card (Standard)

**Design** :
- Background : Glass (white/10)
- Backdrop blur : 12px
- Border : white/20
- Border radius : `rounded-2xl`
- Padding : `p-6`
- Hover : Scale 1.02

```html
<div class="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 hover:scale-102 transition-all duration-300">
  <h3 class="text-xl font-semibold text-white mb-2">
    Titre de la carte
  </h3>
  <p class="text-white/70">
    Description de la carte
  </p>
</div>
```

**Classe utilitaire** :

```css
.relay-card {
  @apply p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl;
  @apply hover:bg-white/15 transition-all duration-300;
}

.relay-card-hover {
  @apply hover:scale-102 hover:shadow-2xl;
}
```

#### Area Card

```html
<div class="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
  <!-- Header -->
  <div class="flex items-start justify-between mb-4">
    <div>
      <h3 class="text-lg font-semibold text-white">
        Spotify → Discord
      </h3>
      <p class="text-sm text-white/60">
        Nouvelle chanson ajoutée
      </p>
    </div>
    <span class="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">
      Active
    </span>
  </div>

  <!-- Content -->
  <div class="space-y-2 mb-4">
    <div class="flex items-center gap-2 text-sm text-white/70">
      <Icon name="heroicons:bolt" class="w-4 h-4 text-blue-400" />
      <span>Trigger: New track in playlist</span>
    </div>
    <div class="flex items-center gap-2 text-sm text-white/70">
      <Icon name="heroicons:arrow-right" class="w-4 h-4 text-purple-400" />
      <span>Action: Send Discord message</span>
    </div>
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    <button class="px-4 py-2 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-lg hover:bg-blue-500/30 transition-all">
      Exécuter
    </button>
    <button class="px-4 py-2 bg-white/10 text-white/70 text-sm font-medium rounded-lg hover:bg-white/15 transition-all">
      Modifier
    </button>
  </div>
</div>
```

#### Service Card

```html
<div class="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 hover:scale-105 transition-all duration-300 cursor-pointer">
  <div class="flex items-center gap-4 mb-4">
    <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
      <Icon name="simple-icons:spotify" class="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 class="text-lg font-semibold text-white">Spotify</h3>
      <p class="text-sm text-white/60">Connecté</p>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4 text-sm">
    <div>
      <p class="text-white/50">AREAs</p>
      <p class="text-xl font-semibold text-white">5</p>
    </div>
    <div>
      <p class="text-white/50">Exécutions</p>
      <p class="text-xl font-semibold text-white">127</p>
    </div>
  </div>
</div>
```

### Inputs

#### Text Input

```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-white">
    Nom de l'AREA
  </label>
  <input
    type="text"
    placeholder="Ex: Nouvelle chanson Spotify → Discord"
    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
  />
  <p class="text-xs text-white/50">
    Un nom descriptif pour identifier votre AREA
  </p>
</div>
```

#### Textarea

```html
<textarea
  rows="4"
  placeholder="Description de votre AREA..."
  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
></textarea>
```

#### Select

```html
<select class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
  <option value="">Sélectionner un service</option>
  <option value="spotify">Spotify</option>
  <option value="discord">Discord</option>
  <option value="github">GitHub</option>
</select>
```

#### Checkbox

```html
<label class="flex items-start gap-3 cursor-pointer">
  <input
    type="checkbox"
    class="mt-1 w-5 h-5 bg-white/10 border border-white/20 rounded text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
  />
  <div>
    <span class="text-sm text-white">Activer automatiquement</span>
    <p class="text-xs text-white/50">L'AREA sera active dès sa création</p>
  </div>
</label>
```

#### Radio

```html
<div class="space-y-3">
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="radio"
      name="type"
      value="action"
      class="w-5 h-5 bg-white/10 border border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
    />
    <span class="text-sm text-white">Action</span>
  </label>
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="radio"
      name="type"
      value="reaction"
      class="w-5 h-5 bg-white/10 border border-white/20 text-blue-500 focus:ring-2 focus:ring-blue-500"
    />
    <span class="text-sm text-white">Réaction</span>
  </label>
</div>
```

#### Toggle Switch

```html
<label class="flex items-center gap-3 cursor-pointer">
  <div class="relative">
    <input type="checkbox" class="sr-only peer" />
    <div class="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
    <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-all"></div>
  </div>
  <span class="text-sm text-white">Active</span>
</label>
```

### Badges

#### Status Badge

```html
<!-- Active -->
<span class="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">
  Active
</span>

<!-- Inactive -->
<span class="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full">
  Inactive
</span>

<!-- En cours -->
<span class="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-medium rounded-full">
  En cours
</span>

<!-- Erreur -->
<span class="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded-full">
  Erreur
</span>
```

#### Count Badge

```html
<div class="relative inline-block">
  <Icon name="heroicons:bell" class="w-6 h-6 text-white" />
  <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
    3
  </span>
</div>
```

### Alerts

#### Success

```html
<div class="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
  <div class="flex items-start gap-3">
    <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-400 mt-0.5" />
    <div>
      <h4 class="text-sm font-semibold text-green-300">
        AREA créée avec succès
      </h4>
      <p class="text-sm text-green-400/70 mt-1">
        Votre AREA "Spotify → Discord" est maintenant active
      </p>
    </div>
  </div>
</div>
```

#### Error

```html
<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
  <div class="flex items-start gap-3">
    <Icon name="heroicons:x-circle" class="w-5 h-5 text-red-400 mt-0.5" />
    <div>
      <h4 class="text-sm font-semibold text-red-300">
        Erreur de connexion
      </h4>
      <p class="text-sm text-red-400/70 mt-1">
        Impossible de se connecter au service Spotify
      </p>
    </div>
  </div>
</div>
```

#### Warning

```html
<div class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
  <div class="flex items-start gap-3">
    <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-400 mt-0.5" />
    <div>
      <h4 class="text-sm font-semibold text-yellow-300">
        Configuration incomplète
      </h4>
      <p class="text-sm text-yellow-400/70 mt-1">
        Veuillez renseigner tous les champs requis
      </p>
    </div>
  </div>
</div>
```

#### Info

```html
<div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
  <div class="flex items-start gap-3">
    <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-400 mt-0.5" />
    <div>
      <h4 class="text-sm font-semibold text-blue-300">
        Information
      </h4>
      <p class="text-sm text-blue-400/70 mt-1">
        Cette action se déclenche automatiquement toutes les 5 minutes
      </p>
    </div>
  </div>
</div>
```

### Modals

```html
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
  <div class="w-full max-w-lg p-6 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-2xl font-bold text-white">
        Supprimer l'AREA ?
      </h3>
      <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
        <Icon name="heroicons:x-mark" class="w-5 h-5 text-white/70" />
      </button>
    </div>

    <!-- Content -->
    <p class="text-white/70 mb-6">
      Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette AREA ?
    </p>

    <!-- Actions -->
    <div class="flex gap-3">
      <button class="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all">
        Annuler
      </button>
      <button class="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all">
        Supprimer
      </button>
    </div>
  </div>
</div>
```

### Toasts

```html
<div class="fixed top-4 right-4 z-50 w-96 p-4 bg-slate-900 border border-white/20 rounded-xl shadow-2xl backdrop-blur-xl">
  <div class="flex items-start gap-3">
    <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon name="heroicons:check" class="w-5 h-5 text-green-400" />
    </div>
    <div class="flex-1">
      <h4 class="text-sm font-semibold text-white">
        AREA créée
      </h4>
      <p class="text-sm text-white/70 mt-1">
        Votre AREA a été créée avec succès
      </p>
    </div>
    <button class="text-white/50 hover:text-white transition-colors">
      <Icon name="heroicons:x-mark" class="w-5 h-5" />
    </button>
  </div>
</div>
```

### Loading States

#### Spinner

```html
<div class="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
```

#### Skeleton

```html
<div class="space-y-4 animate-pulse">
  <div class="h-4 bg-white/10 rounded w-3/4"></div>
  <div class="h-4 bg-white/10 rounded w-1/2"></div>
  <div class="h-4 bg-white/10 rounded w-5/6"></div>
</div>
```

#### Progress Bar

```html
<div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
  <div class="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300" style="width: 60%"></div>
</div>
```

---

## Iconographie

### Bibliothèque d'Icônes

**Web** : Heroicons via `@iconify/vue`

```vue
<Icon name="heroicons:bolt" class="w-5 h-5" />
```

**Mobile** : Material Design Icons

```dart
Icon(Icons.bolt, size: 20)
```

### Tailles d'Icônes

| Taille | Pixels | Tailwind | Usage |
|--------|--------|----------|-------|
| XS | 12px | `w-3 h-3` | Dans le texte |
| SM | 16px | `w-4 h-4` | Badges, petits boutons |
| Base | 20px | `w-5 h-5` | **Standard** (boutons, inputs) |
| LG | 24px | `w-6 h-6` | Headers, navigation |
| XL | 32px | `w-8 h-8` | Cards importantes |
| 2XL | 48px | `w-12 h-12` | Service icons |

### Icônes par Contexte

#### Services

| Service | Icône | Code |
|---------|-------|------|
| Spotify |  | `simple-icons:spotify` |
| Discord |  | `simple-icons:discord` |
| GitHub |  | `simple-icons:github` |
| Google |  | `simple-icons:google` |
| Reddit |  | `simple-icons:reddit` |
| YouTube |  | `simple-icons:youtube` |

#### Actions

| Action | Icône | Code |
|--------|-------|------|
| Trigger |  | `heroicons:bolt` |
| Reaction |  | `heroicons:arrow-right` |
| Execute |  | `heroicons:play` |
| Edit |  | `heroicons:pencil` |
| Delete |  | `heroicons:trash` |
| Settings |  | `heroicons:cog-6-tooth` |

#### États

| État | Icône | Code |
|------|-------|------|
| Success |  | `heroicons:check-circle` |
| Error |  | `heroicons:x-circle` |
| Warning |  | `heroicons:exclamation-triangle` |
| Info |  | `heroicons:information-circle` |

---

## Espacements & Grilles

### Échelle d'Espacement

Basée sur Tailwind CSS (1 unit = 4px) :

| Nom | Pixels | Tailwind | Usage |
|-----|--------|----------|-------|
| 0 | 0px | `0` | Reset |
| 0.5 | 2px | `0.5` | Micro spacing |
| 1 | 4px | `1` | Très petit |
| 2 | 8px | `2` | Petit |
| 3 | 12px | `3` | Standard |
| 4 | 16px | `4` | **Base** |
| 6 | 24px | `6` | Moyen |
| 8 | 32px | `8` | Large |
| 12 | 48px | `12` | Très large |
| 16 | 64px | `16` | Section |
| 24 | 96px | `24` | Grande section |

### Padding Standards

| Composant | Padding | Tailwind |
|-----------|---------|----------|
| Button Small | 12px 16px | `px-4 py-3` |
| Button Medium | 12px 24px | `px-6 py-3` |
| Button Large | 16px 32px | `px-8 py-4` |
| Card | 24px | `p-6` |
| Modal | 24px | `p-6` |
| Input | 12px 16px | `px-4 py-3` |
| Section | 48px | `py-12` |

### Gaps & Spacing

```html
<!-- Stack vertical (space-y) -->
<div class="space-y-2">  <!-- 8px entre chaque élément -->
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid horizontal (gap) -->
<div class="flex gap-4">  <!-- 16px entre chaque élément -->
  <div>Col 1</div>
  <div>Col 2</div>
</div>
```

### Layout Grid

```html
<!-- 2 colonnes -->
<div class="grid grid-cols-2 gap-6">
  <div>Col 1</div>
  <div>Col 2</div>
</div>

<!-- 3 colonnes -->
<div class="grid grid-cols-3 gap-6">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>

<!-- Responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- ... -->
</div>
```

### Container

```html
<div class="container mx-auto px-4 max-w-7xl">
  <!-- Contenu centré avec max-width -->
</div>
```

---

## Effets Visuels

### Border Radius

| Nom | Pixels | Tailwind | Usage |
|-----|--------|----------|-------|
| None | 0px | `rounded-none` | Reset |
| SM | 4px | `rounded` | Petits éléments |
| MD | 8px | `rounded-lg` | Badges |
| LG | 12px | `rounded-xl` | **Inputs, buttons** |
| XL | 16px | `rounded-2xl` | **Cards** |
| 2XL | 24px | `rounded-3xl` | Grandes cards |
| Full | 9999px | `rounded-full` | Badges ronds, avatars |

### Shadows

```css
/* Légère */
.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Standard */
.shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Large */
.shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Extra large */
.shadow-2xl {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

/* Glow effect */
.shadow-glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
```

### Backdrop Blur

```html
<!-- Blur léger -->
<div class="backdrop-blur-sm">  <!-- 4px -->

<!-- Blur standard -->
<div class="backdrop-blur">     <!-- 8px -->

<!-- Blur fort -->
<div class="backdrop-blur-xl">  <!-- 24px -->
```

### Transitions

```css
/* Standard */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Rapide */
.transition-fast {
  transition: all 0.15s ease-in-out;
}

/* Lente */
.transition-slow {
  transition: all 0.3s ease-in-out;
}
```

### Hover Effects

#### Scale

```html
<div class="hover:scale-105 transition-transform duration-200">
  Hover me
</div>
```

#### Brightness

```html
<div class="hover:brightness-110 transition-all">
  Hover me
</div>
```

#### Glow

```html
<button class="bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
  Glow on hover
</button>
```

### Animations

```css
/* Spin (loading) */
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Pulse */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Bounce */
.animate-bounce {
  animation: bounce 1s infinite;
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Pixels | Tailwind | Device |
|------------|--------|----------|--------|
| SM | 640px | `sm:` | Mobile landscape |
| MD | 768px | `md:` | Tablet |
| LG | 1024px | `lg:` | Desktop |
| XL | 1280px | `xl:` | Large desktop |
| 2XL | 1536px | `2xl:` | Very large |

### Exemples

```html
<!-- Texte responsive -->
<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold">
  Responsive title
</h1>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- ... -->
</div>

<!-- Padding responsive -->
<div class="px-4 md:px-8 lg:px-12">
  <!-- ... -->
</div>

<!-- Hidden sur mobile -->
<div class="hidden md:block">
  Visible seulement sur desktop
</div>

<!-- Visible uniquement sur mobile -->
<div class="block md:hidden">
  Visible seulement sur mobile
</div>
```

### Layout Mobile-First

```html
<div class="
  flex flex-col        <!-- Mobile: stack vertical -->
  md:flex-row          <!-- Tablet+: horizontal -->
  gap-4 md:gap-6       <!-- Gap responsive -->
">
  <div class="w-full md:w-1/2">Col 1</div>
  <div class="w-full md:w-1/2">Col 2</div>
</div>
```

---

## Accessibilité

### Contraste

Tous les textes doivent respecter **WCAG 2.1 AA** :
- Texte normal : Ratio 4.5:1 minimum
- Texte large (18px+) : Ratio 3:1 minimum

**Bonnes pratiques** :
- Texte principal : `text-white` sur `bg-slate-900` 
- Texte secondaire : `text-white/70` sur `bg-slate-900` 
- Éviter : `text-white/30` sur `bg-white/10` 

### Focus States

Toujours indiquer le focus pour la navigation au clavier :

```html
<button class="
  ...
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
  focus:ring-offset-slate-900
">
  Button
</button>
```

### Labels

Toujours labelliser les inputs :

```html
<!-- Bon -->
<label for="email" class="block text-sm font-medium text-white mb-2">
  Email
</label>
<input id="email" type="email" ... />

<!-- Mauvais -->
<input type="email" placeholder="Email" />
```

### ARIA

```html
<!-- Button avec icône seule -->
<button aria-label="Supprimer l'AREA">
  <Icon name="heroicons:trash" />
</button>

<!-- État loading -->
<button aria-busy="true" disabled>
  <span class="sr-only">Chargement...</span>
  <div class="animate-spin ..."></div>
</button>

<!-- Modal -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Titre du modal</h2>
</div>
```

### Mobile (Accessibilité Daltoniens)

La plateforme mobile supporte 6 modes d'accessibilité :

```dart
enum AccessibilityMode {
  normal,
  protanopia,      // Rouge-vert (déficience rouge)
  deuteranopia,    // Rouge-vert (le plus commun)
  tritanopia,      // Bleu-jaune
  achromatopsia,   // Vision en niveaux de gris
  highContrast,    // Contraste élevé
}
```

**Implémentation** :
- Bouton dans l'AppBar pour changer de mode
- Filtre ColorFilter appliqué sur toute l'app
- Préférences sauvegardées dans SharedPreferences

---

## Guide d'Utilisation

### Comment Utiliser Cette Charte

#### 1. Créer un Nouveau Composant

**Étapes** :

1. Identifier le type de composant (bouton, card, input, etc.)
2. Copier le code d'exemple de ce guide
3. Adapter les classes Tailwind selon vos besoins
4. Vérifier le contraste et l'accessibilité
5. Tester sur mobile et desktop

**Exemple** :

```vue
<!--  Bon : Utilise les patterns du design system -->
<button class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
  Créer
</button>

<!--  Mauvais : Classes incohérentes -->
<button class="p-2 bg-blue-500 text-sm rounded hover:bg-blue-600">
  Créer
</button>
```

#### 2. Choisir les Bonnes Couleurs

**Pour un CTA** : Gradient primary
```html
<button class="bg-gradient-to-r from-blue-600 to-purple-600 ...">
```

**Pour un statut actif** : Green
```html
<span class="bg-green-500/20 text-green-300 ...">Active</span>
```

**Pour un danger** : Red
```html
<button class="bg-red-600 hover:bg-red-700 ...">Supprimer</button>
```

#### 3. Respecter les Espacements

```html
<!--  Bon : Espacements cohérents -->
<div class="space-y-6">      <!-- 24px entre sections -->
  <div class="space-y-4">    <!-- 16px entre éléments -->
    <h3 class="...">Titre</h3>
    <p class="...">Texte</p>
  </div>
</div>

<!--  Mauvais : Espacements aléatoires -->
<div class="space-y-3">
  <div class="space-y-7">
    ...
  </div>
</div>
```

#### 4. Utiliser les Composants Glassmorphiques

```html
<!-- Pattern standard pour toutes les cards -->
<div class="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
  <!-- Contenu -->
</div>
```

#### 5. Feedback Utilisateur

Toujours fournir du feedback sur les actions :

```vue
<script setup>
const { $api } = useNuxtApp();
const toast = useToast();

const deleteArea = async (id: string) => {
  try {
    await $api(`/api/areas/${id}`, { method: 'DELETE' });

    //  Feedback de succès
    toast.add({
      title: 'AREA supprimée',
      description: 'L\'AREA a été supprimée avec succès',
      color: 'green',
    });
  } catch (error) {
    //  Feedback d'erreur
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer l\'AREA',
      color: 'red',
    });
  }
};
</script>
```

### Classes Utilitaires Personnalisées

```css
/* assets/css/main.css */

/* Glass card standard */
.relay-card {
  @apply p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl;
  @apply hover:bg-white/15 transition-all duration-300;
}

/* Button primary */
.btn-primary {
  @apply px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white font-semibold rounded-xl;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply transition-all duration-200 shadow-lg hover:shadow-xl;
}

/* Button secondary */
.btn-secondary {
  @apply px-6 py-3 bg-white/10 border border-white/20;
  @apply text-white font-semibold rounded-xl;
  @apply hover:bg-white/15 transition-all duration-200;
}

/* Input standard */
.input-base {
  @apply w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl;
  @apply text-white placeholder-white/50;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  @apply transition-all;
}
```

**Utilisation** :

```html
<div class="relay-card">
  <h3>Titre</h3>
  <button class="btn-primary">Action</button>
</div>
```

### Checklist Avant Merge

Avant de merge votre code, vérifiez :

- [ ] Les couleurs respectent la palette définie
- [ ] Les espacements utilisent l'échelle standard (4, 6, 8, 12, etc.)
- [ ] Les border-radius sont cohérents (lg, xl, 2xl)
- [ ] Les transitions sont fluides (200-300ms)
- [ ] Le contraste texte/background est suffisant
- [ ] Les états hover/focus sont implémentés
- [ ] Le responsive fonctionne (mobile, tablet, desktop)
- [ ] L'accessibilité est respectée (labels, ARIA, focus)
- [ ] Le code suit les patterns du design system
- [ ] Les animations ne sont pas trop agressives

---

## Conclusion

Cette charte graphique garantit une **cohérence visuelle** et une **expérience utilisateur optimale** sur toute la plateforme AREA.

### Ressources

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Contribuer

Pour proposer des améliorations à cette charte :
1. Ouvrir une issue sur GitHub
2. Discuter avec l'équipe design
3. Créer une PR avec les modifications

**Maintenu par l'équipe Relay Design - Dernière mise à jour : Janvier 2025**
