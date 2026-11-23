import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() activeSection = 'Home';
  @Output() navActiveMenu = new EventEmitter<string>();

  readonly themeService = inject(ThemeService);

  navLink = ['Home', 'Skills', 'Projects', 'Contact'];
  menuOpen = false;
  progress = 0;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    this.progress = scrollable > 0 ? Math.min(100, (doc.scrollTop / scrollable) * 100) : 0;
  }

  navLinkClicked(menu: string): void {
    this.activeSection = menu;
    this.closeMenu();
    this.navActiveMenu.emit(menu);
  }

  goHome(event: Event): void {
    if (this.activeSection === 'Home') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
