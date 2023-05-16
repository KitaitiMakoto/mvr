import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';
import '@spectrum-web-components/action-group/sp-action-group.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/slider/sp-slider.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-text-add.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-settings.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-feed-add.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-folder.js';
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
      padding: 0.5rem 1rem;
      background-color: #ededed;
    }

    sp-action-group {
      align-items: center;
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
      <sp-theme scale="medium" color="light">
        <div class="controls">
          <sp-action-group>
            <sp-action-button @click=${this.#handleAddText}>
              <sp-icon-text-add slot="icon"></sp-icon-text-add>
              テキスト
            </sp-action-button>
            <sp-action-button @click=${this.#handleAddRow}>
              <sp-icon-feed-add slot="icon"></sp-icon-feed-add>
              行
            </sp-action-button>
          </sp-action-group>
          <sp-action-group>
            <sp-action-button @click=${this.#handleToggleTable}>
              <sp-icon-folder slot="icon"></sp-icon-folder>一時置き場
            </sp-action-button>
          </sp-action-group>
          <sp-action-group>
            <sp-field-label>パネル幅</sp-field-label>
            <sp-slider id="panel-width" min="5" value="10" @input=${this.#handlePanelWidthChange} label-visibility="none"></sp-slider>
          </sp-action-group>
          <sp-action-group>
            <sp-action-button @click=${this.#handleForward}>
              先へ
            </sp-action-button>
            <sp-action-button @click=${this.#handleBack}>
              後ろへ
            </sp-action-button>
            <sp-action-button @click=${this.#handleBreak}>
              折り返す
            </sp-action-button>
            <sp-action-button @click=${this.#handleUnbreak}>
              直前までを前の行へ
            </sp-action-button>
          </sp-action-group>
        </div>
        <mvr-board src="${src}" @selectpanel></mvr-board>
      </sp-theme>
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

  #handleForward() {
    this._board?.moveForward();
  }

  #handleBack() {
    this._board?.moveBack();
  }

  #handleBreak() {
    this._board?.break();
  }

  #handleUnbreak() {
    this._board?.unbreak();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-app': MvrApp;
  }
}
