import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-copy.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-delete.js';

@customElement('mv-panel')
export class MvPanel extends LitElement {
  static styles = css`
    :host {
      --padding: 0.2rem;

      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      gap: 0.2rem;
      inline-size: 100%;
      block-size: 100%;
      position: relative;
      padding: var(--padding);
      contain: content;
    }

    :host([selected]) {
      --border-width: 2px;

      border: solid var(--border-width) black;
      padding: calc(var(--padding) - var(--border-width));
    }

    * {
      box-sizing: border-box;
    }

    sp-action-button {
      display: none;

      position: absolute;
      inset-block-start: 0;
    }

    sp-action-button:first-of-type {
      inset-inline-start: 0;
    }

    sp-action-button:last-of-type {
      inset-inline-end: 0;
    }

    :host(:is(:hover, :active)) sp-action-button {
      display: flex;
    }

    .heading,
    .content,
    .folio {
      inline-size: 100%;
    }

    .heading {
      margin: 0;
      line-height: 1;
      text-align: center;
    }

    input {
      inline-size: 100%;
      block-size: 100%;
      border: none;
      background-color: transparent;
      text-align: inherit;
    }

    .content {
      display: flex;
      justify-content: center;
      aspect-ratio: 1;
      inline-size: 100%;
      overflow: hidden;
      text-align: start;
    }

    .folio {
      align-self: flex-end;
      font-size: small;
      line-height: 1;
      text-align: center;
      color: gray;
    }

    ::slotted(*) {
      inline-size: 100%;
      object-fit: scale-down;
    }
  `;

  @property({ type: Boolean, reflect: true })
  selected: boolean = false;

  @property({ reflect: true })
  heading: string = '';

  @property({ reflect: true })
  folio?: string;

  @query('input[name="heading"]')
  private _$headingInput!: HTMLInputElement;

  tabIndex = -1;

  render() {
    return html`
      <sp-action-button
        class="duplicate"
        label="複製"
        quiet
        @click=${this.#handleClickDuplicate}
      >
        <sp-icon-copy slot="icon"></sp-icon-copy>
      </sp-action-button>
      <sp-action-button
        class="remove"
        label="削除"
        quiet
        @click=${this.#handleClickRemove}
      >
        <sp-icon-delete slot="icon"></sp-icon-delete>
      </sp-action-button>
      <h2 class="heading">
        <input
          name="heading"
          .value=${this.heading}
          placeholder="入力してください"
          @change=${this.#handleHeadingChange}
        />
      </h2>
      <div class="content">
        <slot></slot>
      </div>
      <div class="folio">${this.folio}</div>
    `;
  }

  #handleHeadingChange() {
    this.dispatchEvent(
      new CustomEvent('headingchange', {
        detail: { value: this._$headingInput.value },
      })
    );
  }

  #handleClickDuplicate() {
    this.dispatchEvent(new MouseEvent('clickduplicate'));
  }

  #handleClickRemove() {
    this.dispatchEvent(new MouseEvent('clickremove'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mv-panel': MvPanel;
  }
}
