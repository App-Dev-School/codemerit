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