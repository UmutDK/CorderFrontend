import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

import { Icon, IconName } from '../../../shared/ui/icon/icon';

type Command = 'h2' | 'h3' | 'bold' | 'italic' | 'bulletList' | 'orderedList' | 'blockquote' | 'link';

interface ToolbarButton {
  command: Command;
  label: string;
  icon?: IconName;
  text?: string;
}

/** Boutons limités aux balises acceptées par le backend (voir HtmlSanitizer.php) */
const TOOLBAR: ToolbarButton[][] = [
  [
    { command: 'h2', label: 'Titre de section', text: 'H2' },
    { command: 'h3', label: 'Sous-titre', text: 'H3' },
  ],
  [
    { command: 'bold', label: 'Gras', icon: 'bold' },
    { command: 'italic', label: 'Italique', icon: 'italic' },
    { command: 'link', label: 'Lien', icon: 'link' },
  ],
  [
    { command: 'bulletList', label: 'Liste à puces', icon: 'list' },
    { command: 'orderedList', label: 'Liste numérotée', icon: 'list-ordered' },
    { command: 'blockquote', label: 'Citation', icon: 'quote' },
  ],
];

/** Retire les paragraphes vides laissés en fin de texte par la touche Entrée */
function cleanHtml(html: string): string {
  return html.replace(/(<p><\/p>)+$/, '');
}

/**
 * Éditeur de texte riche (TipTap) utilisable comme champ de formulaire : formControlName="body".
 * La valeur est le HTML de l'article ; une valeur vide vaut ''.
 */
@Component({
  selector: 'app-rich-text-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './rich-text-editor.html',
  styleUrl: './rich-text-editor.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichTextEditor), multi: true }],
  host: { '[class.is-focused]': 'focused()', '[class.is-invalid]': 'invalid()' },
})
export class RichTextEditor implements ControlValueAccessor {
  /** id du libellé (<label id="…">) qui nomme la zone de saisie */
  readonly labelledBy = input.required<string>();
  readonly invalid = input(false);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('content');
  private editor: Editor | null = null;
  private pendingValue = '';
  private onChange: (html: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly toolbar = TOOLBAR;
  protected readonly active = signal<ReadonlySet<Command>>(new Set());
  protected readonly focused = signal(false);
  protected readonly canUndo = signal(false);
  protected readonly canRedo = signal(false);
  protected readonly disabled = signal(false);

  constructor() {
    afterNextRender(() => {
      this.editor = new Editor({
        element: this.host().nativeElement,
        extensions: [
          StarterKit.configure({
            heading: { levels: [2, 3] },
            code: false,
            codeBlock: false,
            horizontalRule: false,
            strike: false,
            underline: false,
            link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
          }),
        ],
        content: this.pendingValue,
        editable: !this.disabled(),
        editorProps: {
          attributes: {
            class: 'prose rte__area',
            role: 'textbox',
            'aria-multiline': 'true',
            'aria-labelledby': this.labelledBy(),
          },
        },
        onUpdate: ({ editor }) => this.onChange(editor.isEmpty ? '' : cleanHtml(editor.getHTML())),
        onTransaction: () => this.refreshState(),
        onFocus: () => this.focused.set(true),
        onBlur: () => {
          this.focused.set(false);
          this.onTouched();
        },
      });
      this.refreshState();
    });

    inject(DestroyRef).onDestroy(() => this.editor?.destroy());
  }

  protected run(command: Command): void {
    const chain = this.editor?.chain().focus();
    if (!chain) return;
    switch (command) {
      case 'h2':
        chain.toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        chain.toggleHeading({ level: 3 }).run();
        break;
      case 'bold':
        chain.toggleBold().run();
        break;
      case 'italic':
        chain.toggleItalic().run();
        break;
      case 'bulletList':
        chain.toggleBulletList().run();
        break;
      case 'orderedList':
        chain.toggleOrderedList().run();
        break;
      case 'blockquote':
        chain.toggleBlockquote().run();
        break;
      case 'link':
        this.editLink();
        break;
    }
  }

  protected undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  protected redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  /** Ajoute, modifie ou retire (adresse vide) le lien du texte sélectionné */
  private editLink(): void {
    const editor = this.editor!;
    const current = (editor.getAttributes('link')['href'] as string | undefined) ?? '';
    const url = window.prompt('Adresse du lien (laisser vide pour retirer le lien) :', current);
    if (url === null) return;
    const chain = editor.chain().focus().extendMarkRange('link');
    if (url.trim() === '') {
      chain.unsetLink().run();
    } else {
      chain.setLink({ href: url.trim() }).run();
    }
  }

  private refreshState(): void {
    const e = this.editor;
    if (!e) return;
    const active = new Set<Command>();
    if (e.isActive('heading', { level: 2 })) active.add('h2');
    if (e.isActive('heading', { level: 3 })) active.add('h3');
    for (const name of ['bold', 'italic', 'bulletList', 'orderedList', 'blockquote', 'link'] as const) {
      if (e.isActive(name)) active.add(name);
    }
    this.active.set(active);
    this.canUndo.set(e.can().undo());
    this.canRedo.set(e.can().redo());
  }

  // ---------- ControlValueAccessor ----------

  writeValue(html: string | null): void {
    this.pendingValue = html ?? '';
    this.editor?.commands.setContent(this.pendingValue, { emitUpdate: false });
  }

  registerOnChange(fn: (html: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
    this.editor?.setEditable(!disabled);
  }
}
