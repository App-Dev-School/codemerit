import { trigger, transition, style, animate } from '@angular/animations';

export const slideInOutAnimation = trigger('slideInOut', [
  // Slide-in animation
  transition(':enter', [
    style({ transform: 'translateX(100%)' }), // start from the right side
    animate('300ms ease-in', style({ transform: 'translateX(0)' }))
  ]),
  
  // Slide-out animation
  transition(':leave', [
    style({ transform: 'translateX(0)' }),  // current position
    animate('300ms ease-out', style({ transform: 'translateX(-100%)' }))  // slide to the left
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
