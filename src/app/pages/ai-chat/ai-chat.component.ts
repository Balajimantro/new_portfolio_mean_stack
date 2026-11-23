import { Component, DestroyRef, ElementRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { API_BASE_URL } from '../../services/api.config';
import { UiService } from '../../shared/ui.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMeta {
  filter?: string | null;
}

const SUGGESTIONS = [
  'What has Balaji built with Angular?',
  'How strong is his backend experience?',
  'Which project should I look at first?',
  'Is he available for a new role?'
];

const MAX_MESSAGE_LENGTH = 500;

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css'
})
export class AiChatComponent {
  @ViewChild('scrollHost') scrollHost?: ElementRef<HTMLDivElement>;
  @ViewChild('input') inputRef?: ElementRef<HTMLTextAreaElement>;

  readonly ui = inject(UiService);
  readonly suggestions = SUGGESTIONS;

  readonly messages = signal<ChatMessage[]>([]);
  readonly streaming = signal(false);
  readonly errorText = signal('');
  readonly lastMeta = signal<ChatMeta | null>(null);
  readonly inputValue = signal('');

  readonly canSend = computed(() => !this.streaming() && this.inputValue().trim().length > 0);

  private abortController?: AbortController;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      if (this.ui.copilotOpen()) {
        setTimeout(() => this.inputRef?.nativeElement.focus(), 80);
        this.scrollToBottom();
      }
    });

    this.destroyRef.onDestroy(() => this.abortController?.abort());
  }

  open(): void {
    this.ui.openCopilot();
    if (this.messages().length === 0) {
      this.pushAssistant(
        "Hey! I'm Balaji's portfolio copilot. Ask me about his projects, stack or experience — or how to get in touch."
      );
    }
  }

  close(): void {
    this.ui.closeCopilot();
  }

  onBackdrop(): void {
    this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.inputValue.set(value.slice(0, MAX_MESSAGE_LENGTH));
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  useSuggestion(text: string): void {
    this.inputValue.set(text);
    this.send();
  }

  viewProjects(): void {
    const filter = this.lastMeta()?.filter;
    if (filter) {
      this.ui.setProjectFilter(filter);
    } else {
      document.getElementById('Projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.close();
  }

  async send(): Promise<void> {
    const text = this.inputValue().trim();
    if (!text || this.streaming()) return;

    this.inputValue.set('');
    this.errorText.set('');
    this.lastMeta.set(null);
    this.messages.update((list) => [...list, { role: 'user', content: text }]);
    this.messages.update((list) => [...list, { role: 'assistant', content: '' }]);
    this.scrollToBottom();

    this.streaming.set(true);
    this.abortController?.abort();
    this.abortController = new AbortController();

    try {
      const history = this.messages()
        .slice(0, -1)
        .map((message) => ({ role: message.role, content: message.content }));

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: this.abortController.signal,
        body: JSON.stringify({ messages: history.slice(-10) })
      });

      if (!response.ok || !response.body) {
        throw new Error(`AI request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const line = event.split('\n').find((part) => part.startsWith('data:'));
          if (!line) continue;

          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload) as
              | { type: 'delta'; text: string }
              | { type: 'meta'; filter?: string | null };

            if (parsed.type === 'delta' && parsed.text) {
              this.appendToLast(parsed.text);
            } else if (parsed.type === 'meta') {
              this.lastMeta.set({ filter: parsed.filter ?? null });
            }
          } catch {
            /* ignore malformed chunk */
          }
        }
        this.scrollToBottom();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        this.errorText.set(
          'The copilot is offline right now. You can still reach Balaji through the contact form below.'
        );
        this.messages.update((list) => {
          const last = list[list.length - 1];
          if (last?.role === 'assistant' && !last.content) {
            return list.slice(0, -1);
          }
          return list;
        });
      }
    } finally {
      this.streaming.set(false);
      this.scrollToBottom();
    }
  }

  private appendToLast(text: string): void {
    this.messages.update((list) => {
      const copy = [...list];
      const last = copy[copy.length - 1];
      if (last?.role === 'assistant') {
        copy[copy.length - 1] = { ...last, content: last.content + text };
      }
      return copy;
    });
  }

  private pushAssistant(content: string): void {
    this.messages.update((list) => [...list, { role: 'assistant', content }]);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const host = this.scrollHost?.nativeElement;
      if (host) host.scrollTop = host.scrollHeight;
    }, 40);
  }
}
