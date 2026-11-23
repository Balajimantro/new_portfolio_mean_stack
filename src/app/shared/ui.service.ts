import { Injectable, signal } from '@angular/core';

/** Lightweight cross-component UI state (project filter driven by the AI copilot). */
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly _projectFilter = signal<string | null>(null);
  readonly projectFilter = this._projectFilter.asReadonly();

  private readonly _copilotOpen = signal(false);
  readonly copilotOpen = this._copilotOpen.asReadonly();

  setProjectFilter(tech: string | null): void {
    this._projectFilter.set(tech);
  }

  openCopilot(): void {
    this._copilotOpen.set(true);
  }

  closeCopilot(): void {
    this._copilotOpen.set(false);
  }
}
