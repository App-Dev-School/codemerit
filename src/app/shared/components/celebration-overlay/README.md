Celebration Overlay Component
=============================

Overview
--------
`app-celebration-overlay` is a reusable, canvas-based celebration/particle overlay component designed to sit on top of any card or score UI. It supports multiple themes, a tuning panel (presets + sliders), programmatic burst triggers, and emits settings changes.

Files
-----
- celebration-overlay.component.ts — component implementation
- celebration-overlay.component.html — component template (canvas + controls)
- celebration-overlay.component.scss — component styles

Selector
--------
Use the component in templates with:

<app-celebration-overlay
  [enabled]="showCelebration"
  theme="golden_star"
  [maxParticles]="200"
  [speed]="2.5"
  [wind]="0.8"
  [glow]="15"
  [scale]="0.95"
  [controlsEnabled]="celebrationControlsEnabled"
  (controlsEnabledChange)="celebrationControlsEnabled = $event"
  (settingsChange)="onCelebrationSettings($event)">
</app-celebration-overlay>

Inputs
------
- `enabled: boolean` — whether rendering is active.
- `theme: 'classic_confetti' | 'cyber_matrix' | 'golden_star' | 'cyber_sparks'` — visual preset.
- `maxParticles: number` — max particle density.
- `speed: number` — velocity multiplier.
- `wind: number` — horizontal drift.
- `glow: number` — canvas shadowBlur value.
- `scale: number` — global particle scale multiplier.
- `controlsEnabled: boolean` — show and enable the in-component tuning UI (can be bound two-way via `controlsEnabledChange`).

Outputs
-------
- `controlsEnabledChange: EventEmitter<boolean>` — emits when the lock toggle is used inside the child.
- `settingsChange: EventEmitter<any>` — emits live settings whenever sliders or presets change. Payload: `{ theme, maxParticles, speed, wind, glow, scale }`.

Public API
----------
- `triggerBurst(clientX?: number, clientY?: number)` — spawn an explosive burst at the given client coordinates (or center if omitted).
- `applyPreset(name: string)` — programmatically apply preset (`golden_star`, `cyber_matrix`, `cyber_sparks`, `classic_confetti`).

Parent Integration Examples
---------------------------
1) Simple usage in `quiz-result.component.html`:

<app-celebration-overlay *ngIf="showCelebration" [enabled]="showCelebration"></app-celebration-overlay>

2) Full control + tuning panel bind:

<app-celebration-overlay
  *ngIf="showCelebration"
  [enabled]="showCelebration"
  [controlsEnabled]="celebrationControlsEnabled"
  (controlsEnabledChange)="celebrationControlsEnabled = $event"
  (settingsChange)="onCelebrationSettings($event)"
  #celebs>
</app-celebration-overlay>

Then in the parent TS:

@ViewChild('celebs') celebs?: CelebrationOverlayComponent;
celebrationControlsEnabled = true;

// trigger a burst from parent
this.celebs?.triggerBurst();

// apply preset from parent
this.celebs?.applyPreset('golden_star');

// handle settings updates
onCelebrationSettings(settings: any) {
  console.log('celebration settings:', settings);
}

Controlling display duration
---------------------------
The overlay can auto-hide itself. The child component exposes:

- `@Input() autoDisableMs` — number of milliseconds after `enabled` becomes true when the overlay will automatically emit `autoDisabled`. Set to `0` to disable auto-hide.
- `@Output() autoDisabled` — emitted by the child when auto-hide occurs; parents should listen and hide the overlay (e.g., `showCelebration = false`).

Example — parent template wiring:

<app-celebration-overlay
  *ngIf="showCelebration"
  (autoDisabled)="showCelebration = false"
  [autoDisableMs]="15000">
</app-celebration-overlay>

This keeps the auto-hide logic inside the reusable component while letting the parent decide how to react when auto-hide happens.

Programmatic control & default location
-------------------------------------
- To change the default auto-hide value in source, edit the default on `autoDisableMs` in:
  `src/app/shared/components/celebration-overlay/celebration-overlay.component.ts` (default is `10000` ms).
- To change duration at runtime from the parent, use `ViewChild` and set the property directly:

```ts
@ViewChild('celebs') celebs?: CelebrationOverlayComponent;
// update duration to 30s
this.celebs!.autoDisableMs = 30000;
```

- Or set it in the template per-instance with the input:

```html
<app-celebration-overlay [autoDisableMs]="15000" (autoDisabled)="showCelebration=false"></app-celebration-overlay>
```

Tips to tune visual density and "thickness"
-------------------------------------------
- Reduce `scale` (0.5–0.9) to make particles smaller.
- Reduce `glow` to reduce halo blur.
- Increase `maxParticles` but lower `scale` to keep a dense but fine-grained look.
- Lower `speed` to slow falling motion and increase visibility time.

Persisting tuned settings
-------------------------
If you want to preserve tuned values between reloads, save the `settingsChange` payload to `localStorage` in your parent component and apply them back to the overlay inputs on init.

Performance
-----------
The component runs the render loop outside Angular's zone to avoid change-detection overhead. For very high particle counts (>500) on low-end devices, consider lowering `maxParticles`.

License & Notes
---------------
This README documents the in-repo component; feel free to copy the embed snippet or extract a smaller standalone widget for external use.
