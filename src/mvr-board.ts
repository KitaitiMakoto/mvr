import {LitElement, PropertyValueMap, css, html} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';

import '@spectrum-web-components/action-group/sp-action-group.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-table-row-remove-center.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-home.js';

import './mv-panel.js';

export interface Board {
  items: {
    name: string;
    items: {
      key: `${string}-${string}-${string}-${string}-${string}`,
      name?: string;
      src?: string;
      alt?: string;
      content?: string;
    }[]
  }[]
}

@customElement('mvr-board')
export class MvrBoard extends LitElement {
  static styles = css`
    :host {
      --row-direction: row-reverse;

      display: block;
    }

    * {
      box-sizing: border-box;
    }

    .row {
      display: flex;
      flex-direction: var(--row-direction);
      gap: 1rem;
      padding-block: 1rem;
    }

    .header {
      flex-shrink: 0;
      inline-size: 10rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      block-size: calc(var(--panel-width, 10vw) * 4 / 3);
    }

    .row h2 {
      margin: 0;
      line-height: 1;
    }

    .row h2 input {
      inline-size: 100%;
      block-size: 100%;
      border: none;
      padding: 0.2rem 0.5rem;
      text-align: center;
    }

    .row .items {
      display: flex;
      flex-direction: var(--row-direction);
      align-items: center;
      gap: 1rem;
      overflow-x: scroll;
      scroll-behavior: smooth;
    }

    .row .item {
      inline-size: var(--panel-width, 10vw);
      aspect-ratio: 3 / 4;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
    }

    .row .item > * {
      max-inline-size: 100%;
      max-block-size: 100%;
    }

    .divider {
      align-self: stretch;
      margin-block: 1rem;
      border: none;
      border-inline-end: solid 1px gray;
    }

    mv-panel {
      background-color: #fafafa;
    }
  `;

  @property({reflect: true})
  src?: string;

  @property()
  selectedPanelIndex?: [number, number];

  @state()
  _board?: Board;

  @state()
  private _error?: string;

  render() {
    if (this._error) {
      return html`<p>${this._error}</p>`;
    }

    if (! this._board) {
      return html`<p>Loading...</p>`;
    }

    return html`
      ${this._board.items.map((items, i) => html`
        <div class="row">
          <div class="header">
            <h2><input .value="${items.name}" placeholder="入力してください"></h2>
            <sp-action-group>
              <sp-action-button aria-label="行を先頭に戻す" @click=${() => this.goHome(i)}>
                <sp-icon-home slot="icon"></sp-icon-home>
              </sp-action-button>
              <sp-action-button aria-label="行を削除" @click=${() => this.removeRow(i)}>
                <sp-icon-table-row-remove-center slot="icon"></sp-icon-table-row-remove-center>
              </sp-action-button>
            </sp-action-group>
          </div>
          <div class="items">
            ${repeat(items.items, ({key}) => key, ({name, src, alt, content}, j) => html`
              <div class="item">
                <mv-panel heading=${name} folio=${j} .selected=${i + 1 === this.selectedPanelIndex?.[0] && j + 1 === this.selectedPanelIndex?.[1]} @focusin="${this.#handleFocusIn}" @headingchange=${(e: CustomEvent) => this.#handleHeadingChange(i, j, e)}>
                  ${src ? html`<img src=${src} alt=${alt} loading="lazy">` : html`<textarea value=${content}></textarea>`}
                </mv-panel>
              </div>
              ${(j % 2 === 1 && j !== items.items.length - 1) ? html`<hr class="divider">` : undefined}
            `)}
          </div>
        </div>
      `)}
    `;
  }

  attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback?.(name, old, value);
    switch (name) {
      case 'src':
        this.#load();
        break;
      default:
    }
  }

  protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (changedProperties.has('_board')) {
      console.debug(this._board);
    }      
  }

  goHome(i: number) {
    this.renderRoot.querySelector(`.row:nth-child(${i + 1}) .item:first-child`)?.scrollIntoView({block: 'center', inline: 'start'});
  }

  addText() {
    if (! this._board) {
      return;
    }
    const index = this.selectedPanelIndex;
    if (! index) {
      return;
    }
    const row = index[0] - 1;
    const column = index[1] - 1;
    const {_board: board} = this;
    this._board = {
      ...board,
      items: [
        ...board.items.slice(0, row),
        {
          ...board.items[row],
          items: [
            ...board.items[row].items.slice(0, column + 1),
            {key: crypto.randomUUID()},
            ...board.items[row].items.slice(column + 1)
          ]
        },
        ...board.items.slice(row + 1)
      ]
    };
    this.selectedPanelIndex = [index[0], index[1] + 1];
  }

  addRow() {
    if (! this._board) {
      return;
    }
    const index = this.selectedPanelIndex;
    const {_board: board} = this;
    if (index) {
      const rowIndex = index[0] - 1;
      this._board = {
        ...board,
        items: [
          ...board.items.slice(0, rowIndex + 1),
          {name: '', items: []},
          ...board.items.slice(rowIndex + 1)
        ]
      };
    } else {
      this._board = {
        ...board,
        items: [...board.items, {name: '', items: []}]
      };
    }
  }

  removeRow(index: number) {
    const {_board: board} = this;
    if (! board) {
      return;
    }
    if (! window.confirm('この行を削除していいですか？')) {
      return;
    }
    this._board = {
      ...board,
      items: [
        ...board.items.slice(0, index),
        ...board.items.slice(index + 1)
      ]
    };
    if (! this.selectedPanelIndex) {
      return;
    }
    const rowIndex = this.selectedPanelIndex[0] - 1;
    if (index === rowIndex) {
      this.selectedPanelIndex = undefined;
    } else if (index < rowIndex) {
      this.selectedPanelIndex = [rowIndex, this.selectedPanelIndex[1]];
    }
  }

  duplicatePanel() {
    if (! this._board) {
      return;
    }
    const index = this.selectedPanelIndex;
    if (! index) {
      return;
    }
    const {_board: board} = this;
    const rowIndex = index[0] - 1;
    const colIndex = index[1] - 1;
    const row = board.items[rowIndex];
    this._board = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex + 1),
            {...row.items[colIndex], key: crypto.randomUUID()},
            ...row.items.slice(colIndex + 1)
          ]
        },
        ...board.items.slice(rowIndex + 1)
      ]
    };
    this.selectedPanelIndex = [rowIndex + 1, colIndex + 2];
  }

  removePanel() {
    if (! this._board) {
      return;
    }
    const index = this.selectedPanelIndex;
    if (! index) {
      return;
    }
    if (! window.confirm('選択したパネルを削除しますか？')) {
      return;
    }
    const {_board: board} = this;
    const rowIndex = index[0] - 1;
    const colIndex = index[1] - 1;
    const row = board.items[rowIndex];
    this._board = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex),
            ...row.items.slice(colIndex + 1)
          ]
        },
        ...board.items.slice(rowIndex + 1)
      ]
    };
    this.selectedPanelIndex = undefined;
  }

  moveForward() {
    const {_board: board} = this;
    if (! board) {
      return;
    }
    if (! this.selectedPanelIndex) {
      return;
    }
    const rowIndex = this.selectedPanelIndex[0] - 1;
    const colIndex = this.selectedPanelIndex[1] - 1;
    const row = board.items[rowIndex];
    if (colIndex >= row.items.length - 1) {
      return;
    }
    this._board = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex),
            row.items[colIndex + 1],
            row.items[colIndex],
            ...row.items.slice(colIndex + 2)
          ]
        },
        ...board.items.slice(rowIndex + 1)
      ]
    };
    this.selectedPanelIndex = [rowIndex + 1, colIndex + 2];
  }

  moveBack() {
    const {_board: board} = this;
    if (! board) {
      return;
    }
    if (! this.selectedPanelIndex) {
      return;
    }
    const rowIndex = this.selectedPanelIndex[0] - 1;
    const colIndex = this.selectedPanelIndex[1] - 1;
    if (colIndex === 0) {
      return;
    }
    const row = board.items[rowIndex];
    this._board = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex - 1),
            row.items[colIndex],
            row.items[colIndex - 1],
            ...row.items.slice(colIndex + 1)
          ]
        },
        ...board.items.slice(rowIndex + 1)
      ]
    };
    this.selectedPanelIndex = [rowIndex + 1, colIndex];
  }

  break() {
    const index = this.selectedPanelIndex;
    if (! index) {
      return;
    }
    const rowIndex = index[0] - 1;
    const colIndex = index[1] - 1;
    const {_board: board} = this;
    if (! board) {
      return;
    }
    if (rowIndex === board.items.length - 1) {
      this.addRow();
    }
    const row = board.items[rowIndex];
    if (colIndex >= row.items.length - 1) {
      return;
    }
    this._board = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex + 1)
          ]
        },
        {
          ...board.items[rowIndex + 1],
          items: [
            ...row.items.slice(colIndex + 1),
            ...board.items[rowIndex + 1].items
          ]
        },
        ...board.items.slice(rowIndex + 2)
      ]
    };
  }

  unbreak() {
    const {_board: board} = this;
    if (! board) {
      return;
    }
    if (! this.selectedPanelIndex) {
      return;
    }
    const rowIndex = this.selectedPanelIndex[0] - 1;
    const colIndex = this.selectedPanelIndex[1] - 1;
    const row = board.items[rowIndex];
    this._board = {
      ...board,
      items: [
        ...(rowIndex === 0 ? [] : board.items.slice(0, rowIndex - 1)),
        {
          ...board.items[rowIndex - 1],
          items: [
            ...(board.items[rowIndex - 1]?.items ?? []),
            ...row.items.slice(0, colIndex + 1)
          ]
        },
        {
          ...row,
          items: row.items.slice(colIndex + 1)
        },
        ...board.items.slice(rowIndex + 1)
      ]
    };
    this.selectedPanelIndex = rowIndex === 0 ? [rowIndex + 1, colIndex + 1] : [rowIndex, this._board.items[rowIndex - 1].items.length - 1 + colIndex];
  }

  async #load() {
    this._board = undefined;
    this._error = undefined;
    if (! this.src) {
      return;
    }
    const board: Omit<Board, 'key'> = await fetch(this.src).then(res => res.json())
                    .catch(err => {
                      this._error = err;
                      // eslint-disable-next-line no-console
                      console.error(err);
                    });
    this._board = {
      ...board,
      items: board.items.map(item => ({...item, key: crypto.randomUUID()}))
    };
  }

  #handleFocusIn(event: FocusEvent) {
    const panel = event.composedPath().find(elem => (elem as HTMLElement).tagName === 'MV-PANEL');
    if (! panel) {
      return;
    }
    const item = (panel as HTMLElement).closest('.item')!;
    const items = item.parentNode as HTMLElement;
    const column = Array.from(items.querySelectorAll('.item')).findIndex(elem => elem === item);
    const rowElem = items.parentNode!;
    const row = Array.from((rowElem.parentNode as HTMLElement).querySelectorAll('.row')).findIndex(elem => elem === rowElem);
    this.selectedPanelIndex = [row + 1, column + 1];
  }

  #handleHeadingChange(rowIndex: number, colIndex: number, event: CustomEvent) {
    const {_board: board} = this;
    if (! board) {
      return;
    }
    const row = board.items[rowIndex];
    this._board = {
      ...board,
      items: [
        ...board.items.slice(0, rowIndex),
        {
          ...row,
          items: [
            ...row.items.slice(0, colIndex),
            {...row.items[colIndex], name: event.detail.value},
            ...row.items.slice(colIndex + 1)
          ]
        },
        ...board.items.slice(rowIndex + 1)
      ]
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-board': MvrBoard;
  }
}
