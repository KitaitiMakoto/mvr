import {LitElement, html, css} from 'lit';
import {repeat} from 'lit/directives/repeat.js';
import {property, customElement} from 'lit/decorators.js';

import '@spectrum-web-components/action-group/sp-action-group.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-table-row-remove-center.js';

import './mv-panel.js';
import type {Board} from './mvr-board.js';

@customElement('mvr-rows')
export class MvrRows extends LitElement {
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
      gap: 0.2rem;
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

  @property()
  board!: Board;

  @property()
  selectedPanelIndex?: [number, number];
  
  render() {
    return html`
      ${this.board.items.map((items, i) => html`
        <div class="row">
          <div class="header">
            <h2><input .value="${items.name}" placeholder="入力してください"></h2>
            <sp-action-group>
              <sp-action-button aria-label="行を削除" @click=${() => this.removeRow(i)}>
                <sp-icon-table-row-remove-center slot="icon"></sp-icon-table-row-remove-center>
              </sp-action-button>
            </sp-action-group>
          </div>
          <div class="items">
            ${repeat(items.items, ({src}, j) => src ?? j, ({src, alt, content}, j) => html`
              <div class="item">
                <mv-panel folio=${j} .selected=${i + 1 === this.selectedPanelIndex?.[0] && j + 1 === this.selectedPanelIndex?.[1]} @focusin="${this.#handleFocusIn}">
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

  addText() {
    if (! this.selectedPanelIndex) {
      return;
    }
    const index = this.selectedPanelIndex;
    const row = index[0] - 1;
    const column = index[1] - 1;
    const {board} = this;
    this.board = {
      ...board,
      items: [
        ...board.items.slice(0, row),
        {
          ...board.items[row],
          items: [
            ...board.items[row].items.slice(0, column + 1),
            {},
            ...board.items[row].items.slice(column + 1)
          ]
        },
        ...board.items.slice(row + 1)
      ]
    };
    this.selectedPanelIndex = [index[0], index[1] + 1];
  }

  addRow() {
    const {board} = this;
    if (this.selectedPanelIndex) {
      const rowIndex = this.selectedPanelIndex[0] - 1;
      this.board = {
        ...board,
        items: [
          ...board.items.slice(0, rowIndex + 1),
          {name: '', items: []},
          ...board.items.slice(rowIndex + 1)
        ]
      };
    } else {
      this.board = {
        ...board,
        items: [...board.items, {name: '', items: []}]
      };
    }
  }

  removeRow(index: number) {
    if (! window.confirm('この行を削除していいですか？')) {
      return;
    }
    const {board} = this;
    this.board = {
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

  moveForward() {
    if (! this.selectedPanelIndex) {
      return;
    }
    const rowIndex = this.selectedPanelIndex[0] - 1;
    const colIndex = this.selectedPanelIndex[1] - 1;
    const {board} = this;
    const row = board.items[rowIndex];
    if (colIndex >= row.items.length - 1) {
      return;
    }
    this.board = {
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
    if (! this.selectedPanelIndex) {
      return;
    }
    const rowIndex = this.selectedPanelIndex[0] - 1;
    const colIndex = this.selectedPanelIndex[1] - 1;
    if (colIndex === 0) {
      return;
    }
    const {board} = this;
    const row = board.items[rowIndex];
    this.board = {
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
    if (! this.selectedPanelIndex) {
      return;
    }
    const rowIndex = this.selectedPanelIndex[0] - 1;
    const colIndex = this.selectedPanelIndex[1] - 1;
    const {board} = this;
    if (rowIndex === board.items.length - 1) {
      this.addRow();
    }
    const row = board.items[rowIndex];
    if (colIndex >= row.items.length - 1) {
      return;
    }
    this.board = {
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
    if (! this.selectedPanelIndex) {
      return;
    }
    const rowIndex = this.selectedPanelIndex[0] - 1;
    const colIndex = this.selectedPanelIndex[1] - 1;
    const {board} = this;
    if (colIndex === 0) {
      return;
    }
    const row = board.items[rowIndex];
    const prepended = rowIndex === 0 ? [{name: '', items: row.items.slice(0, colIndex)}] : [];
    this.board = {
      ...board,
      items: [
        ...prepended,
        ...board.items.slice(0, rowIndex - 1),
        {
          ...board.items[rowIndex - 1],
          items: [
            ...(board.items[rowIndex - 1]?.items ?? []),
            ...row.items.slice(0, colIndex)
          ]
        },
        {
          ...row,
          items: row.items.slice(colIndex)
        },
        ...board.items.slice(rowIndex + 1)
      ]
    };
    this.selectedPanelIndex = [prepended.length === 0 ? rowIndex + 1 : rowIndex + 2, 1];
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
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-rows': MvrRows;
  }
}
