import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { animate } from '@lit-labs/motion';

import '@spectrum-web-components/action-group/sp-action-group.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-table-row-remove-center.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-home.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-layers-backward.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-layers-forward.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-text-add.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-table-row-add-bottom.js';

import './mv-panel.js';
import type { MvPanel } from './mv-panel.js';
import './mvr-panel-border.js';
import type { MvrPanelBorder } from './mvr-panel-border.js';

type ID = `${string}-${string}-${string}-${string}-${string}`;

export interface Board {
  id: ID;
  preferences?: {
    panelWidth: string;
  };
  items: {
    id: ID;
    name: string;
    items: {
      id: ID;
      name?: string;
      src?: string;
      alt?: string;
      content?: string;
    }[];
  }[];
}

@customElement('mvr-board')
export class MvrBoard extends LitElement {
  static styles = css`
    :host {
      --row-direction: row-reverse;

      display: block;
      padding: 0.5rem 1rem;
    }

    * {
      box-sizing: border-box;
    }

    .row {
      --padding: 1rem;

      display: flex;
      flex-direction: var(--row-direction);
      padding-block: var(--padding);
    }

    .header {
      flex-shrink: 0;
      inline-size: 128px; /* icon 32px * 3 + padding 0.5rem * 2 + gap 0.5rem * 2 */
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 0.5rem;
      border-inline-start: 1px solid rgb(200, 200, 200);
      padding: 0.5rem;
      transition: inline-size var(--spectrum-global-animation-duration-100);
      background-color: var(--spectrum-global-color-gray-100);
    }

    .header[aria-expanded='false'] {
      inline-size: 32px; /* FIXME */
      padding-inline: 0;
      overflow-block: scroll;
    }

    sp-action-group {
      flex-wrap: nowrap;
    }

    .header[aria-expanded='false'] sp-action-group {
      flex-wrap: wrap;
    }

    .row h2 {
      margin: 0;
      line-height: 1;
      inline-size: 100%;
    }

    .row h2 input {
      inline-size: 100%;
      block-size: 100%;
      border: none;
      padding: 0.2rem 0.5rem;
      text-align: center;
    }

    sp-action-group {
      inline-size: 100%;
    }

    .info {
      display: flex;
      justify-content: space-between;
      inline-size: 100%;
    }

    [aria-expanded='false'] .info {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .row .items {
      display: flex;
      flex-direction: var(--row-direction);
      align-items: center;
      overflow-x: scroll;
      scroll-behavior: smooth;
    }

    mv-panel {
      flex-shrink: 0;
      aspect-ratio: 3 / 4;
      background-color: var(--spectrum-global-color-gray-50);
    }

    .panel-content {
      --source-height: 1rem;

      inline-size: 100%;
      block-size: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }

    .panel-content > * {
      max-inline-size: 100%;
      max-block-size: 100%;
    }

    .panel-content img {
      block-size: calc(100% - var(--source-height));
      object-fit: scale-down;
    }

    .panel-content .source {
      flex-shrink: 0;
      margin: 0;
      block-size: var(--source-height);
    }

    .panel-content textarea {
      block-size: 100%;
    }

    mvr-panel-border {
      flex-shrink: 0;
      inline-size: var(--spectrum-spacing-200);
      block-size: 100%;
      color: var(--spectrum-global-color-gray-500);
    }

    mvr-panel-border[divider] {
      inline-size: var(--spectrum-spacing-500);
    }

    [slot='popover'] {
      display: flex;
      flex-direction: column;
      gap: var(--spectrum-spacing-200);
    }

    [slot='popover'] .breaks {
      flex-wrap: nowrap;
      flex-direction: var(--row-direction);
      inline-size: max-content;
    }
  `;

  @state()
  srcObject?: Board;

  @state()
  rowHeaderExpanded: Boolean = true;

  render() {
    if (!this.srcObject) {
      return html`<p>Loading...</p>`;
    }

    const rows = this.srcObject.items.length;
    const headerStyle = styleMap({
      blockSize: `calc(${this.srcObject?.preferences?.panelWidth} * 4 / 3)`,
    });
    const panelStyle = styleMap({
      width: this.srcObject.preferences?.panelWidth,
    });

    return html`
      ${repeat(
        this.srcObject.items,
        ({ id }) => id,
        (items, i) => html`
          <div class="row" ${animate()}>
            ${this.#renderRowHeader(i, items, rows, headerStyle)}
            <div class="items">
              ${repeat(
                items.items,
                ({ id }) => id,
                ({ name, src, alt, content }, j) => html`
                  <mvr-panel-border
                    .divider=${j % 2 === 0 && j !== 0}
                    ${animate()}
                  >
                    ${this.#renderBorderPopover(i, j)}
                  </mvr-panel-border>
                  <mv-panel
                    heading=${name}
                    folio=${j}
                    @focusin="${this.#handleFocusIn}"
                    @headingchange=${(e: CustomEvent) =>
                      this.#handleHeadingChange(i, j, e)}
                    ${animate()}
                    @clickduplicate=${() => this.#handleDuplicate(i, j)}
                    @clickremove=${() => this.#handleRemove(i, j)}
                    @clickforward=${() => this.#handleForward(i, j)}
                    @clickback=${() => this.#handleBack(i, j)}
                    style=${panelStyle}
                  >
                    ${this.#renderPanelContent(i, j, src, alt, content)}
                  </mv-panel>
                `
              )}
              <mvr-panel-border ${animate()}>
                ${this.#renderBorderPopover(i, items.items.length)}
              </mvr-panel-border>
            </div>
          </div>
        `
      )}
    `;
  }

  #renderRowHeader(
    index: number,
    items: Board['items'][number],
    rows: number,
    style: ReturnType<typeof styleMap>
  ) {
    return html`
      <div
        class="header"
        aria-expanded="${this.rowHeaderExpanded ? 'true' : 'false'}"
        style=${style}
      >
        <h2>
          <input
            .value="${items.name ?? ''}"
            placeholder="入力してください"
            @change=${(e: Event) =>
              this.#handleRowHeadingChange(index, e.currentTarget)}
          />
        </h2>
        <sp-action-group>
          <sp-action-button
            aria-label="行を先頭に戻す"
            @click=${() => this.goHome(index)}
          >
            <sp-icon-home slot="icon"></sp-icon-home>
          </sp-action-button>
          <sp-action-button
            label="行を下に追加"
            @click=${() => this.addRow(index + 1)}
          >
            <sp-icon-table-row-add-bottom
              slot="icon"
            ></sp-icon-table-row-add-bottom>
          </sp-action-button>
          <sp-action-button
            aria-label="行を削除"
            @click=${() => this.removeRow(index)}
          >
            <sp-icon-table-row-remove-center
              slot="icon"
            ></sp-icon-table-row-remove-center>
          </sp-action-button>
        </sp-action-group>
        <div class="info">
          <div class="panel-count">${items.items.length}枚</div>
          <div class="row-number">${index + 1}/${rows}行目</div>
        </div>
      </div>
    `;
  }

  #renderPanelContent(
    rowIndex: number,
    colIndex: number,
    src?: string,
    alt?: string,
    content?: string
  ) {
    return html`
      <div class="panel-content">
        ${src
          ? html`<img src=${src} alt=${alt} loading="lazy" />`
          : html`<textarea
              .value=${content ?? ''}
              @change=${(e: Event) =>
                this.#handleContentChange(
                  rowIndex,
                  colIndex,
                  (e.currentTarget as HTMLTextAreaElement)?.value
                )}
            ></textarea>`}
        <p class="source">${(src ?? '').split('/').at(-1)}</p>
      </div>
    `;
  }

  #renderBorderPopover(rowIndex: number, colIndex: number) {
    return html`
      <div slot="popover">
        <sp-action-group class="addition">
          <sp-action-button
            @click=${() => this.#handleClickAddText(rowIndex, colIndex)}
          >
            <sp-icon-text-add slot="icon"></sp-icon-text-add>
            テキスト
          </sp-action-button>
        </sp-action-group>
        <sp-action-group class="breaks">
          <sp-action-button
            @click=${() => this.#handleClickUnbreak(rowIndex, colIndex)}
          >
            <sp-icon-layers-forward slot="icon"></sp-icon-layers-forward
            >ここまで前の行へ
          </sp-action-button>
          <sp-action-button
            @click=${() => this.#handleClickBreak(rowIndex, colIndex)}
          >
            <sp-icon-layers-backward slot="icon"></sp-icon-layers-backward
            >折り返す
          </sp-action-button>
        </sp-action-group>
      </div>
    `;
  }

  goHome(i: number) {
    this.renderRoot
      .querySelector(`.row:nth-child(${i + 1}) mv-panel:first-of-type`)
      ?.scrollIntoView({ block: 'center', inline: 'start' });
  }

  addRow(index: number) {
    this.dispatchEvent(new CustomEvent('addrow', { detail: { index } }));
  }

  removeRow(index: number) {
    this.dispatchEvent(new CustomEvent('removerow', { detail: { index } }));
  }

  toggleRowHeader(value?: Boolean) {
    if (value === undefined) {
      this.rowHeaderExpanded = !this.rowHeaderExpanded;
    } else {
      this.rowHeaderExpanded = value;
    }
  }

  #handleFocusIn(event: FocusEvent) {
    const panel = event.currentTarget;
    if (!panel) {
      return;
    }
    const items = (panel as MvPanel).parentNode as HTMLElement;
    const column = Array.from(items.querySelectorAll('mv-panel')).findIndex(
      elem => elem === panel
    );
    const rowElem = items.parentNode!;
    const row = Array.from(
      (rowElem.parentNode as HTMLElement).querySelectorAll('.row')
    ).findIndex(elem => elem === rowElem);
    this.dispatchEvent(
      new CustomEvent('panelchange', { detail: { index: [row, column] } })
    );
  }

  #handleHeadingChange(rowIndex: number, colIndex: number, event: CustomEvent) {
    this.dispatchEvent(
      new CustomEvent('headingchange', {
        detail: { value: event.detail.value, index: [rowIndex, colIndex] },
      })
    );
  }

  #handleRowHeadingChange(index: number, target: EventTarget | null) {
    this.dispatchEvent(
      new CustomEvent('rowheadingchange', {
        detail: { value: (target as HTMLInputElement)?.value, index },
      })
    );
  }

  #handleContentChange(rowIndex: number, colIndex: number, content?: string) {
    this.dispatchEvent(
      new CustomEvent('contentchange', {
        detail: { content, index: [rowIndex, colIndex] },
      })
    );
  }

  #handleDuplicate(rowIndex: number, colIndex: number) {
    this.dispatchEvent(
      new CustomEvent('duplicate', { detail: { index: [rowIndex, colIndex] } })
    );
  }

  #handleRemove(rowIndex: number, colIndex: number) {
    this.dispatchEvent(
      new CustomEvent('remove', { detail: { index: [rowIndex, colIndex] } })
    );
  }

  #handleForward(rowIndex: number, colIndex: number) {
    this.dispatchEvent(
      new CustomEvent('forward', { detail: { index: [rowIndex, colIndex] } })
    );
  }

  #handleBack(rowIndex: number, colIndex: number) {
    this.dispatchEvent(
      new CustomEvent('back', { detail: { index: [rowIndex, colIndex] } })
    );
  }

  #handleClickAddText(rowIndex: number, colIndex: number) {
    this.dispatchEvent(
      new CustomEvent('addtext', { detail: { index: [rowIndex, colIndex] } })
    );
    const border = this.renderRoot.querySelector<MvrPanelBorder>(
      `.row:nth-child(${rowIndex + 1}) mvr-panel-border:nth-of-type(${
        colIndex + 1
      })`
    );
    if (border) {
      border.popoverOpen = false;
    }
  }

  #handleClickBreak(rowIndex: number, colIndex: number) {
    this.dispatchEvent(
      new CustomEvent('break', { detail: { index: [rowIndex, colIndex] } })
    );
    const border = this.renderRoot.querySelector<MvrPanelBorder>(
      `.row:nth-child(${rowIndex + 1}) mvr-panel-border:nth-of-type(${
        colIndex + 1
      })`
    );
    if (border) {
      border.popoverOpen = false;
    }
  }

  #handleClickUnbreak(rowIndex: number, colIndex: number) {
    this.dispatchEvent(
      new CustomEvent('unbreak', { detail: { index: [rowIndex, colIndex] } })
    );
    const border = this.renderRoot.querySelector<MvrPanelBorder>(
      `.row:nth-child(${rowIndex + 1}) mvr-panel-border:nth-of-type(${
        colIndex + 1
      })`
    );
    if (border) {
      border.popoverOpen = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-board': MvrBoard;
  }
}
