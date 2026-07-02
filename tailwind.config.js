/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  // 'class' strategy: dark: variants activate when <html> has class="dark"
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Semantic tokens — map to CSS variables in tokens.css
        // Usage: bg-cm-surface, text-cm-text-primary, border-cm-border …
        'cm-surface':         'var(--cm-surface)',
        'cm-surface-muted':   'var(--cm-surface-muted)',
        'cm-surface-raised':  'var(--cm-surface-raised)',
        'cm-surface-hover':   'var(--cm-surface-hover)',
        'cm-border':          'var(--cm-border)',
        'cm-border-strong':   'var(--cm-border-strong)',
        'cm-text-primary':    'var(--cm-text-primary)',
        'cm-text-secondary':  'var(--cm-text-secondary)',
        'cm-text-muted':      'var(--cm-text-muted)',
        'cm-brand':           'var(--cm-brand)',
        'cm-brand-dim':       'var(--cm-brand-dim)',
        'cm-brand-text':      'var(--cm-brand-text)',
        'cm-brand-ring':      'var(--cm-brand-ring)',
        // Status tokens — change colors in tokens.css, not here
        'cm-success':         'var(--cm-success)',
        'cm-success-dim':     'var(--cm-success-dim)',
        'cm-success-text':    'var(--cm-success-text)',
        'cm-warning':         'var(--cm-warning)',
        'cm-warning-dim':     'var(--cm-warning-dim)',
        'cm-warning-text':    'var(--cm-warning-text)',
        'cm-danger':          'var(--cm-danger)',
        'cm-danger-dim':      'var(--cm-danger-dim)',
        'cm-danger-text':     'var(--cm-danger-text)',
        'cm-info':            'var(--cm-info)',
        'cm-info-dim':        'var(--cm-info-dim)',
        'cm-info-text':       'var(--cm-info-text)',
      },
    },
  },
  plugins: [],
}
