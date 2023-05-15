import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';

import './mvr-board.js';
import type {MvrBoard} from './mvr-board.js';

@customElement('mvr-app')
export class MvrApp extends LitElement {
  static styles = css`
    .controls {
      position: sticky;
      inset-block-start: 0;
      z-index: 12;
      display: flex;
      justify-content: space-between;
      background-color: #ededed;
    }

    .control-group {
      display: flex;
      gap: 1rem;
    }

    .control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `;

  @query('#panel-width')
  _$panelWidth!: HTMLInputElement;

  @query('mvr-board')
  _board?: MvrBoard;

  render() {
    const params = new URL(window.location.href).searchParams;
    const src = params.get('board');
    if (! src) {
      return html`<p>ボードが設定されていません。</p>`;
    }

    return html`
      <div class="controls">
        <div class="control-group">
          <div class="control">
            <button type="button" @click="${this.#handleAddText}">＋テキスト</button>
          </div>
          <div class="control">
            <button type="button" @click="${this.#handleAddRow}">＋行</button>
          </div>
        </div>
        <div class="control-group">
          <div class="control">
            <button type="button" @click="${this.#handleToggleTable}">一時置き場</button>
          </div>
        </div>
        <div class="control-group">
          <div class="control">
            <label for="panel-width">パネル幅</label><input type="range" value="10" min="5" id="panel-width" @input="${this.#handlePanelWidthChange}">
          </div>
        </div>
      </div>
      <mvr-board src="${src}"></mvr-board>
    `;
  }

  #handlePanelWidthChange() {
    this._board?.style.setProperty('--panel-width', `${this._$panelWidth.value}vw`);
  }

  #handleAddText() {
    this._board?.addText();
  }

  #handleAddRow() {
    this._board?.addRow();
  }

  #handleToggleTable() {
    this._board?.toggleTable();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-app': MvrApp;
  }
}
