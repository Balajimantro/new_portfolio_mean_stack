import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

/**
 * Pointer driven 3D tilt + spotlight. Usage:
 *   <div class="tilt" appTilt [tiltMax]="8">
 */
@Directive({
  selector: '[appTilt]',
  standalone: true
})
export class TiltDirective implements OnInit, OnDestroy {
  @Input() tiltMax = 7;
  @Input() tiltScale = 1.015;

  private frame = 0;
  private reduced = false;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia?.('(pointer: coarse)').matches;

    this.renderer.addClass(this.el.nativeElement, 'tilt');
  }

  @HostListener('pointermove', ['$event'])
  onMove(event: PointerEvent): void {
    if (this.reduced) return;
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();

    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * this.tiltMax * 2;
      const rx = (0.5 - py) * this.tiltMax * 2;

      host.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      host.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      host.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      host.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      host.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${this.tiltScale})`;
    });
  }

  @HostListener('pointerleave')
  onLeave(): void {
    cancelAnimationFrame(this.frame);
    const host = this.el.nativeElement;
    host.style.setProperty('--rx', '0deg');
    host.style.setProperty('--ry', '0deg');
    host.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
  }
}
