import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() activeSection!: string;
  @Output() navActiveMenu = new EventEmitter<string>();

  navLink = [ 'Home', 'Skills', 'Projects', 'Contact' ];

  navLinkClicked(menu: string) {
    this.activeSection = menu
    this.navActiveMenu.emit(menu);
  };

}
