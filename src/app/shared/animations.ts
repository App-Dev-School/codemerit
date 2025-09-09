import { trigger, transition, style, animate } from '@angular/animations';

export const slideInOutAnimation = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('300ms ease-in', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ transform: 'translateX(-100%)' }))
  ])
]);

export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('500ms ease-out', style({ opacity: 0 }))
  ])
]);

export const topToBottomAnimation = trigger('topToBottom', [
  transition(':enter', [
    style({ transform: 'translateY(-20px)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('400ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
  ])
]);

// 🔹 Zoom In/Out
export const zoomInOutAnimation = trigger('zoomInOut', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 }))
  ])
]);

// 🔹 Flip (Y-axis rotation)
export const flipAnimation = trigger('flip', [
  transition(':enter', [
    style({ transform: 'rotateY(90deg)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'rotateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('400ms ease-in', style({ transform: 'rotateY(90deg)', opacity: 0 }))
  ])
]);

// 🔹 Bounce In
export const bounceInAnimation = trigger('bounceIn', [
  transition(':enter', [
    style({ transform: 'scale(0.5)', opacity: 0 }),
    animate(
      '500ms cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      style({ transform: 'scale(1)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'scale(0.5)', opacity: 0 }))
  ])
]);

// 🔹 Fade + Slide from Bottom
export const bottomToTopAnimation = trigger('bottomToTop', [
  transition(':enter', [
    style({ transform: 'translateY(30px)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('400ms ease-in', style({ transform: 'translateY(30px)', opacity: 0 }))
  ])
]);
