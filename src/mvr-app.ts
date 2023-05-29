import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';
import '@spectrum-web-components/action-group/sp-action-group.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/slider/sp-slider.js';
import '@spectrum-web-components/popover/sp-popover.js';
import '@spectrum-web-components/quick-actions/sp-quick-actions.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-text-add.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-settings.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-feed-add.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-folder.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-share.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-compass.js';

import './mvr-board.js';
import type { Board, MvrBoard } from './mvr-board.js';
import './mv-panel.js';
import { loadBoard, saveBoard } from './storage/supabase.js';

@customElement('mvr-app')
export class MvrApp extends LitElement {
  static styles = css`
    .controls {
      position: sticky;
      inset-block-start: 0;
      z-index: 12;
      padding: 0.5rem 1rem;
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      background-color: var(--spectrum-global-color-gray-100);
    }

    #share-dialog {
      inline-size: 80vw;
      block-size: 80vh;
      z-index: 12;
    }

    #share-dialog textarea {
      inline-size: 100%;
      block-size: 100%;
    }

    sp-action-group {
      align-items: center;
    }

    mvr-board {
      background-color: var(--spectrum-global-color-gray-200);
    }

    .selected-panel {
      position: fixed;
      inline-size: 5rem;
      z-index: 12;
      inset-inline-end: 1rem;
      inset-block-end: 1rem;
      padding: 0.5rem;
    }

    /* FIXME */
    dialog {
      position: fixed;
      inset-block-start: 50%;
      transform: translateY(-50%);
      height: 80vh;
    }
  `;

  @property({ type: Boolean, reflect: true })
  controls: boolean = false;

  @property({ reflect: true })
  src = '';

  @property({ type: Object })
  srcObject?: Board;

  @state()
  private _error?: string;

  @state()
  private _rowHeaderExpanded: Boolean = true;

  @query('#panel-width')
  _$panelWidth!: HTMLInputElement;

  @query('mvr-board')
  _$board?: MvrBoard;

  @query('#share-dialog')
  _$shareDialog!: HTMLDialogElement;

  render() {
    if (this._error) {
      return html`<p>${this._error}</p>`;
    }

    if (!this.src && !this.srcObject) {
      return html`<p>ボードが設定されていません</p>`;
    }

    if (!this.srcObject) {
      return html`<p>Loading...</p>`;
    }

    return html`
      <sp-theme scale="medium" color="light">
        ${this.controls
          ? html`
              <div class="controls">
                <sp-action-group>
                  <sp-field-label>パネル幅</sp-field-label>
                  <sp-slider
                    id="panel-width"
                    min="5"
                    .value=${Number.parseInt(
                      this.srcObject.preferences?.panelWidth ?? '10',
                      10
                    )}
                    @input=${this.#handlePanelWidthChange}
                    label-visibility="none"
                    style="min-inline-size: 12rem;"
                  ></sp-slider>
                </sp-action-group>
                <sp-action-group>
                  <sp-action-button @click=${this.#handleShare}>
                    <sp-icon-share slot="icon"></sp-icon-share>共有
                  </sp-action-button>
                </sp-action-group>
                <sp-action-group>
                  <sp-action-button @click=${this.#handleToggleRowHeader}>
                    ${this._rowHeaderExpanded ? '縮小' : '拡大'}
                  </sp-action-button>
                </sp-action-group>
              </div>
              <dialog id="share-dialog">
                <textarea
                  .value=${JSON.stringify(
                    this.srcObject ?? '',
                    undefined,
                    '  '
                  )}
                ></textarea>
              </dialog>
            `
          : undefined}
        <mvr-board
          .srcObject=${this.srcObject}
          .rowHeaderExpanded=${this._rowHeaderExpanded}
          @removerow=${this.#handleRemoveRow}
          @headingchange=${this.#handleHeadingChange}
          @rowheadingchange=${this.#handleRowHeadingChange}
          @contentchange=${this.#handleContentChange}
          @duplicate=${this.#handleDuplicate}
          @remove=${this.#handleRemove}
          @forward=${this.#handleForward}
          @back=${this.#handleBack}
          @addtext=${this.#handleAddText}
          @addrow=${this.#handleAddRow}
          @break=${this.#handleBreak}
          @unbreak=${this.#handleUnbreak}
        ></mvr-board>
      </sp-theme>
    `;
  }

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null
  ): void {
    super.attributeChangedCallback?.(name, old, value);
    switch (name) {
      case 'src':
        this.#load();
        break;
      default:
    }
  }

  protected updated(
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (changedProperties.has('srcObject') && this.srcObject) {
      saveBoard(this.srcObject);
    }
  }

  async #load() {
    this._error = undefined;
    if (!this.src) {
      return;
    }
    try {
      let board: Board | undefined;
      board = await loadBoard(this.src as Board['id']);
      if (!board) {
        board = await fetch(this.src).then(res => res.json());
      }
      if (!board) {
        return;
      }
      this.srcObject = {
        ...board,
        id: board.id ?? crypto.randomUUID(),
        preferences: board.preferences ?? {
          panelWidth: '10vw',
        },
        items: board.items.map(items => ({
          ...items,
          id: items.id ?? crypto.randomUUID(),
          items: items.items.map(({ id, ...i }) => ({
            ...i,
            id: id ?? crypto.randomUUID(),
          })),
        })),
      };
      const url = new URL(window.location.href);
      url.searchParams.set('board', this.srcObject.id);
      window.history.replaceState(null, '', url);
    } catch (err) {
      this._error = `${err}`;
      throw err;
    }
  }

  #handlePanelWidthChange() {
    const panelWidth = `${this._$panelWidth.value}vw`;
    const board = this.srcObject;
    if (!board) {
      return;
    }
    this.srcObject = {
      ...board,
      preferences: {
        ...board.preferences,
        panelWidth,
      },
    };
  }

  #handleAddText(event: CustomEvent) {
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const [rowIndex, colIndex] = event.detail.index as [number, number];
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...board.items[rowIndex],
          items: [
            ...board.items[rowIndex].items.slice(0, colIndex),
            { id: crypto.randomUUID() },
            ...board.items[rowIndex].items.slice(colIndex),
          ],
        },
        ...board.items.slice(rowIndex + 1),
      ],
    };
  }

  #handleAddRow(event: CustomEvent) {
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const rowIndex = event.detail.index as number;
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        { id: crypto.randomUUID(), name: '', items: [] },
        ...board.items.slice(rowIndex),
      ],
    };
  }

  #handleRemoveRow(event: CustomEvent) {
    const { index } = event.detail;
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const rowName = this.srcObject?.items[index].name || 'この行';
    if (!window.confirm(`${rowName}を削除していいですか？`)) {
      return;
    }
    this.srcObject = {
      ...board,
      items: [...board.items.slice(0, index), ...board.items.slice(index + 1)],
    };
  }

  #handleShare() {
    this._$shareDialog.open = !this._$shareDialog.open;
    this.requestUpdate();
  }

  #handleDuplicate(event: CustomEvent) {
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const [rowIndex, colIndex] = event.detail.index as [number, number];
    const row = board.items[rowIndex];
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex + 1),
            { ...row.items[colIndex], id: crypto.randomUUID() },
            ...row.items.slice(colIndex + 1),
          ],
        },
        ...board.items.slice(rowIndex + 1),
      ],
    };
  }

  #handleRemove(event: CustomEvent) {
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    if (!window.confirm('選択したパネルを削除しますか？')) {
      return;
    }
    const [rowIndex, colIndex] = event.detail.index as [number, number];
    const row = board.items[rowIndex];
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex),
            ...row.items.slice(colIndex + 1),
          ],
        },
        ...board.items.slice(rowIndex + 1),
      ],
    };
  }

  #handleForward(event: CustomEvent) {
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const [rowIndex, colIndex] = event.detail.index as [number, number];
    const row = board.items[rowIndex];
    if (colIndex >= row.items.length - 1) {
      return;
    }
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex),
            row.items[colIndex + 1],
            row.items[colIndex],
            ...row.items.slice(colIndex + 2),
          ],
        },
        ...board.items.slice(rowIndex + 1),
      ],
    };
  }

  #handleBack(event: CustomEvent) {
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const [rowIndex, colIndex] = event.detail.index as [number, number];

    if (colIndex === 0) {
      return;
    }
    const row = board.items[rowIndex];
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex - 1),
            row.items[colIndex],
            row.items[colIndex - 1],
            ...row.items.slice(colIndex + 1),
          ],
        },
        ...board.items.slice(rowIndex + 1),
      ],
    };
  }

  #handleBreak(event: CustomEvent) {
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const [rowIndex, colIndex] = event.detail.index as [number, number];
    const row = board.items[rowIndex];
    const nextRow =
      rowIndex === board.items.length - 1
        ? { id: crypto.randomUUID(), name: '', items: [] }
        : board.items[rowIndex + 1];
    if (colIndex >= row.items.length) {
      return;
    }
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [...row.items.slice(0, colIndex)],
        },
        {
          ...nextRow,
          items: [...row.items.slice(colIndex), ...nextRow.items],
        },
        ...board.items.slice(rowIndex + 2),
      ],
    };
  }

  #handleUnbreak(event: CustomEvent) {
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const [rowIndex, colIndex] = event.detail.index as [number, number];
    const row = board.items[rowIndex];
    this.srcObject = {
      ...board,
      items: [
        ...(rowIndex === 0 ? [] : board.items.slice(0, rowIndex - 1)),
        {
          ...board.items[rowIndex - 1],
          items: [
            ...(board.items[rowIndex - 1]?.items ?? []),
            ...row.items.slice(0, colIndex),
          ],
        },
        {
          ...row,
          items: row.items.slice(colIndex),
        },
        ...board.items.slice(rowIndex + 1),
      ],
    };
  }

  #handleHeadingChange(event: CustomEvent) {
    const {
      value,
      index: [rowIndex, colIndex],
    } = event.detail;
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const row = board.items[rowIndex];
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex),
            { ...row.items[colIndex], name: value },
            ...row.items.slice(colIndex + 1),
          ],
        },
        ...board.items.slice(rowIndex + 1),
      ],
    };
  }

  #handleRowHeadingChange(event: CustomEvent) {
    const { value, index } = event.detail;
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, index),
        {
          ...board.items[index],
          name: value,
        },
        ...board.items.slice(index + 1),
      ],
    };
  }

  #handleContentChange(event: CustomEvent) {
    const {
      content,
      index: [rowIndex, colIndex],
    } = event.detail;
    const { srcObject: board } = this;
    if (!board) {
      return;
    }
    const row = board.items[rowIndex];
    this.srcObject = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex),
            {
              ...row.items[colIndex],
              content,
            },
            ...row.items.slice(colIndex + 1),
          ],
        },
        ...board.items.slice(rowIndex + 1),
      ],
    };
  }

  #handleToggleRowHeader() {
    this._rowHeaderExpanded = !this._rowHeaderExpanded;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-app': MvrApp;
  }
}
