import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { animate } from '@lit-labs/motion';

import '@spectrum-web-components/action-group/sp-action-group.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-table-row-remove-center.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-home.js';

import './mv-panel.js';

export interface Board {
  preferences?: {
    panelWidth: string;
  };
  items: {
    name: string;
    items: {
      id: `${string}-${string}-${string}-${string}-${string}`;
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
      display: flex;
      flex-direction: var(--row-direction);
      gap: 1rem;
      padding-block: 1rem;
    }

    .header {
      flex-shrink: 0;
      inline-size: 10rem;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 0.5rem;
      block-size: calc(var(--panel-width, 10vw) * 4 / 3);
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

    .panel-count {
      inline-size: 100%;
      text-align: end;
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
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
      margin-inline: 0.5rem;
      margin-block: 1rem;
      border: none;
      border-inline-end: solid 1px gray;
    }

    mv-panel {
      background-color: #fafafa;
    }
  `;

  @state()
  selectedPanelIndex?: [number, number];

  @state()
  srcObject?: Board;

  render() {
    if (!this.srcObject) {
      return html`<p>Loading...</p>`;
    }

    return html`
      ${this.srcObject.items.map(
        (items, i) => html`
          <div class="row">
            <div class="header">
              <h2>
                <input
                  .value="${items.name}"
                  placeholder="入力してください"
                  @change=${(e: Event) =>
                    this.#handleRowHeadingChange(i, e.currentTarget)}
                />
              </h2>
              <sp-action-group>
                <sp-action-button
                  aria-label="行を先頭に戻す"
                  @click=${() => this.goHome(i)}
                >
                  <sp-icon-home slot="icon"></sp-icon-home>
                </sp-action-button>
                <sp-action-button
                  aria-label="行を削除"
                  @click=${() => this.removeRow(i)}
                >
                  <sp-icon-table-row-remove-center
                    slot="icon"
                  ></sp-icon-table-row-remove-center>
                </sp-action-button>
              </sp-action-group>
              <div class="panel-count">${items.items.length}枚</div>
            </div>
            <div class="items">
              ${repeat(
                items.items,
                ({ id }) => id,
                ({ name, src, alt, content }, j) => html`
                  <div class="item" ${animate()}>
                    <mv-panel
                      heading=${name}
                      folio=${j}
                      .selected=${i === this.selectedPanelIndex?.[0] &&
                      j === this.selectedPanelIndex?.[1]}
                      @focusin="${this.#handleFocusIn}"
                      @headingchange=${(e: CustomEvent) =>
                        this.#handleHeadingChange(i, j, e)}
                    >
                      ${src
                        ? html`<img src=${src} alt=${alt} loading="lazy" />`
                        : html`<textarea
                            .value=${content ?? ''}
                            @change=${(e: Event) =>
                              this.#handleContentChange(
                                i,
                                j,
                                (e.currentTarget as HTMLTextAreaElement)?.value
                              )}
                          ></textarea>`}
                    </mv-panel>
                  </div>
                  ${j % 2 === 1 && j !== items.items.length - 1
                    ? html`<hr class="divider" />`
                    : undefined}
                `
              )}
            </div>
          </div>
        `
      )}
    `;
  }

  protected updated(
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (changedProperties.has('srcObject') && this.srcObject) {
      this.style.setProperty(
        '--panel-width',
        this.srcObject.preferences?.panelWidth ?? '10vw'
      );
    }
  }

  goHome(i: number) {
    this.renderRoot
      .querySelector(`.row:nth-child(${i + 1}) .item:first-child`)
      ?.scrollIntoView({ block: 'center', inline: 'start' });
  }

  removeRow(index: number) {
    this.dispatchEvent(new CustomEvent('rowremoved', { detail: { index } }));
  }

  removePanel() {
    this.dispatchEvent(new Event('panelremoved'));
  }

  #handleFocusIn(event: FocusEvent) {
    const panel = event.currentTarget;
    if (!panel) {
      return;
    }
    const item = (panel as HTMLElement).closest('.item')!;
    const items = item.parentNode as HTMLElement;
    const column = Array.from(items.querySelectorAll('.item')).findIndex(
      elem => elem === item
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
}

declare global {
  interface HTMLElementTagNameMap {
    'mvr-board': MvrBoard;
  }
}
