import { LitElement, css, html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { customElement, property, query } from 'lit/decorators.js';

import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-copy.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-delete.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-left.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-right.js';

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

    * {
      box-sizing: border-box;
    }

    sp-action-button.duplicate,
    sp-action-button.remove {
      display: none;

      position: absolute;
      inset-block-start: 0;
    }

    sp-action-button.duplicate {
      inset-inline-start: 0;
    }

    sp-action-button.remove {
      inset-inline-end: 0;
    }

    :host(:is(:hover, :active)) sp-action-button {
      display: flex;
    }

    .heading,
    .content {
      inline-size: 100%;
    }

    .heading {
      margin: 0;
      line-height: 1;
      text-align: center;
      font-weight: bolder;
    }

    input {
      inline-size: 100%;
      block-size: 100%;
      border: none;
      background-color: transparent;
      text-align: inherit;
      font-weight: inherit;
    }

    .heading input::placeholder {
      font-weight: normal;
    }

    .content {
      display: flex;
      justify-content: center;
      aspect-ratio: 1;
      inline-size: 100%;
      overflow: hidden;
      text-align: start;
    }

    footer {
      --spectrum-actionbutton-content-color-default: var(--spectrum-gray-500);

      align-self: flex-end;
      inline-size: 100%;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      font-size: small;
      line-height: 1;
      text-align: center;
      color: var(--spectrum-actionbutton-content-color-default);
    }

    footer sp-action-button {
      color: inherit;
    }

    ::slotted(*) {
      inline-size: 100%;
      object-fit: scale-down;
    }
  `;

  @property({ reflect: true })
  heading: string = '';

  @property({ reflect: true })
  folio?: string;

  @query('input[name="heading"]')
  private _$headingInput!: HTMLInputElement;

  tabIndex = -1;

  render() {
    const direction =
      getComputedStyle(this).getPropertyValue('--row-direction');
    const footerStyles = {
      flexDirection: direction === 'row-reverse' ? 'row' : 'row-reverse',
    };

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
      <footer style=${styleMap(footerStyles)}>
        <sp-action-button
          label="先へ"
          size="s"
          quiet
          @click=${this.#handleClickForward}
        >
          ${direction === 'row-reverse'
            ? html`<sp-icon-chevron-left slot="icon"></sp-icon-chevron-left>`
            : html`<sp-icon-chevron-right slot="icon"></sp-icon-chevron-right>`}
        </sp-action-button>
        <div class="folio">${this.folio}</div>
        <sp-action-button
          label="後ろへ"
          size="s"
          quiet
          @click=${this.#handleClickBack}
        >
          ${direction === 'row-reverse'
            ? html`<sp-icon-chevron-right slot="icon"></sp-icon-chevron-right>`
            : html`<sp-icon-chevron-left slot="icon"></sp-icon-chevron-left>`}
        </sp-action-button>
      </footer>
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

  #handleClickForward() {
    this.dispatchEvent(new MouseEvent('clickforward'));
  }

  #handleClickBack() {
    this.dispatchEvent(new MouseEvent('clickback'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mv-panel': MvPanel;
  }
}
