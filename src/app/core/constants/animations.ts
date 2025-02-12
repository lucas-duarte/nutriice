import { trigger, transition, style, animate, state } from '@angular/animations';

export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0}),
    animate('200ms ease-in', style({ opacity: 1 })),
  ]),
]);

export const fadeOutAnimation = trigger('fadeOut', [
  transition(':leave', [
    animate('200ms ease-out', style({ opacity: 0 })),
  ]),
]);

export const expandAnimation  = trigger('expand', [
  transition(':enter', [
    style({ opacity: 0, height: '0px' }),
    animate('200ms ease-in', style({ height: '*' })),
    animate('200ms ease-in', style({ opacity: 1 })),
  ]),
]);

export const collapseAnimation  = trigger('collapse', [
  transition(':leave', [
    style({ opacity: 1, height: '*' }),
    animate('200ms ease-in', style({ opacity: 0 })),
    animate('200ms ease-in', style({ height: '0px' }))
  ]),
]);

export const expandHorizontalAnimation = trigger('expandHorizontal', [
  transition(':enter', [
    style({ width: '50px', opacity: 0 }), // Inicia com largura 0 e opacidade 0
    animate('200ms ease-in', style({ width: '*', opacity: 1 })), // Expande para a largura total e ajusta a opacidade para 1
  ]),
]);


export const collapseHorizontalAnimation = trigger('collapseHorizontal', [
  transition(':leave', [
    style({ width: '*', opacity: 1 }), // Começa com a largura total e opacidade 1
    animate('200ms ease-out', style({ width: '0px', opacity: 0 })), // Fecha até largura 0 e opacidade 0
  ]),
]);


export const expandVerticalAnimation = trigger('expandVertical', [
  transition(':enter', [
    style({ height: '50px', opacity: 0 }), // Inicia com largura 0 e opacidade 0
    animate('200ms ease-in', style({ height: '*', opacity: 1 })), // Expande para a largura total e ajusta a opacidade para 1
  ]),
]);

export const  collapseVerticalAnimation = trigger('collapseVertical', [
  transition(':leave', [
    style({ height: '*', opacity: 1 }), // Inicia com largura 0 e opacidade 0
    animate('200ms ease-out', style({ height: '0px', opacity: 0 })), // Expande para a largura total e ajusta a opacidade para 1
  ]),
]);