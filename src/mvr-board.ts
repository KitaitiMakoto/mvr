import {LitElement, css, html} from 'lit';
import {property, customElement, state, query} from 'lit/decorators.js';

import './mvr-rows.js';
import type {MvrRows} from './mvr-rows.js';

export interface Board {
  items: {
    name: string;
    items: {
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
    .table {
      position: fixed;
      bottom: 0;
      inline-size: 100%;
      block-size: 6rem;
      background-color: #ededed;
      box-shadow: gray 0px 0px 4px;
    }
  `;

  @property({reflect: true})
  src?: string;

  @state()
  private _board?: Board;

  @state()
  private _error?: string;

  @query('mvr-rows')
  private _$rows!: MvrRows;

  @query('.table')
  private _$table!: HTMLDivElement;

  render() {
    if (this._error) {
      return html`<p>${this._error}</p>`;
    }

    if (! this._board) {
      return html`<p>Loading...</p>`;
    }

    return html`
      <mvr-rows .board=${this._board}></mvr-rows>
      <div class="table" hidden></div>
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

  addText() {
    this._$rows?.addText();
  }

  addRow() {
    this._$rows?.addRow();
  }

  toggleTable() {
    this._$table.hidden = !this._$table.hidden;
  }

  async #load() {
    this._board = undefined;
    this._error = undefined;
    if (! this.src) {
      return;
    }
    this._board = await fetch(this.src).then(res => res.json())
                    .catch(err => {
                      this._error = err;
                      // eslint-disable-next-line no-console
                      console.error(err);
                    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-board': MvrBoard;
  }
}
