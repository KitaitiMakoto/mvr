import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
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
import '@spectrum-web-components/icons-workflow/icons/sp-icon-share.js';

import './mvr-board.js';
import type {MvrBoard} from './mvr-board.js';

@customElement('mvr-app')
export class MvrApp extends LitElement {
  static styles = css`
    .controls-wrapper {
      position: sticky;
      inset-block-start: 0;
      z-index: 12;
      padding: 0.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background-color: #ededed;
    }

    .controls {
      display: flex;
      justify-content: space-between;
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
  `;

  @property({type: Boolean, reflect: true})
  controls: boolean = false;

  @query('#panel-width')
  _$panelWidth!: HTMLInputElement;

  @query('mvr-board')
  _$board?: MvrBoard;

  @query('#share-dialog')
  _$shareDialog!: HTMLDialogElement;

  render() {
    const b = localStorage.getItem('board');
    let board;
    if (b) {
      board = JSON.parse(b);
    }
    let src;
    if (! board) {
      const params = new URL(window.location.href).searchParams;
      src = params.get('board');
      if (! src) {
        return html`<p>ボードが設定されていません。</p>`;
      }
    }

    return html`
      <sp-theme scale="medium" color="light">
        ${this.controls ? html`
          <div class="controls-wrapper">
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
                <sp-action-button @click=${this.#handleShare}>
                  <sp-icon-share slot="icon"></sp-icon-share>共有
                </sp-action-button>
              </sp-action-group>
              <sp-action-group>
                <sp-field-label>パネル幅</sp-field-label>
                <sp-slider id="panel-width" min="5" value="10" @input=${this.#handlePanelWidthChange} label-visibility="none"></sp-slider>
              </sp-action-group>
            </div>
            <div class="controls">
              <sp-action-group>
                <sp-action-button @click=${this.#handleDuplicate}>
                  複製
                </sp-action-button>
                <sp-action-button @click=${this.#handleRemove}>
                  削除
                </sp-action-button>
              </sp-action-group>
              <sp-action-group>
                <sp-action-button @click=${this.#handleForward}>
                  先へ
                </sp-action-button>
                <sp-action-button @click=${this.#handleBack}>
                  後ろへ
                </sp-action-button>
              </sp-action-group>
              <sp-action-group>
                <sp-action-button @click=${this.#handleBreak}>
                  折り返す
                </sp-action-button>
                <sp-action-button @click=${this.#handleUnbreak}>
                  ここまで前の行へ
                </sp-action-button>
              </sp-action-group>
            </div>
          </div>
          <dialog id="share-dialog">
            <textarea .value=${JSON.stringify(this._$board?.srcObject ?? '', undefined, '  ')}></textarea>
          </dialog>
        ` : undefined}
        <mvr-board src="${src}" .srcObject=${board} @selectpanel></mvr-board>
      </sp-theme>
    `;
  }

  #handlePanelWidthChange() {
    this._$board?.style.setProperty('--panel-width', `${this._$panelWidth.value}vw`);
  }

  #handleAddText() {
    this._$board?.addText();
  }

  #handleAddRow() {
    this._$board?.addRow();
  }

  #handleShare() {
    this._$shareDialog.open = !this._$shareDialog.open;
    this.requestUpdate();
  }

  #handleDuplicate() {
    this._$board?.duplicatePanel();
  }

  #handleRemove() {
    this._$board?.removePanel();
  }

  #handleForward() {
    this._$board?.moveForward();
  }

  #handleBack() {
    this._$board?.moveBack();
  }

  #handleBreak() {
    this._$board?.break();
  }

  #handleUnbreak() {
    this._$board?.unbreak();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-app': MvrApp;
  }
}
