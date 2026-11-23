import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

/**
 * Adds a staggered scroll reveal. Usage:
 *   <div class="reveal" [appReveal]="index"></div>
 * `delayStep` is multiplied by the input value (ms).
 */
@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input() appReveal: number | '' = 0;
  @Input() delayStep = 90;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    const host = this.el.nativeElement;
    this.renderer.addClass(host, 'reveal');

    const order = typeof this.appReveal === 'number' ? this.appReveal : 0;
    if (order > 0) {
      host.style.setProperty('--reveal-delay', `${Math.min(order, 8) * this.delayStep}ms`);
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.renderer.addClass(host, 'is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(host, 'is-visible');
            this.observer?.unobserve(host);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
