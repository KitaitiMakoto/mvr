import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import '@spectrum-web-components/popover/sp-popover.js';

@customElement('mvr-panel-border')
export class MvrPanelBorder extends LitElement {
  #clickOutsideListener?: (event: MouseEvent) => void;

  static styles = css`
    :host {
      position: relative;
      background-color: transparent;
    }

    :host(:hover) {
      background-color: var(--spectrum-global-color-gray-300);
    }

    div {
      inline-size: 100%;
      block-size: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    button {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      border: none;
      background-color: inherit;
    }

    hr {
      --border-width: 1px;

      inline-size: 0;
      block-size: calc(100% - 2rem);
      border: none;
      border-inline-start: solid var(--border-width) currentColor;
      transform: translateX(calc(var(--border-width) / 2));
    }

    sp-popover {
      z-index: 6;
      padding: var(--spectrum-spacing-200);
    }
  `;

  render() {
    return html`
      <div>
        <button type="button" @click=${this.#handleClickOpen}>
          ${this.divider ? html`<hr />` : undefined}
        </button>
        <sp-popover .open=${this.popoverOpen && this.#slotted}>
          <slot name="popover"></slot>
        </sp-popover>
      </div>
    `;
  }

  @property({ type: Boolean, reflect: true })
  divider = false;

  @property({ type: Boolean, reflect: true })
  popoverOpen = false;

  @query('slot[name="popover"]')
  private _$popover?: HTMLSlotElement;

  get #slotted() {
    return (this._$popover?.assignedNodes().length ?? 0) > 0;
  }

  async #handleClickOpen() {
    this.popoverOpen = !this.popoverOpen;
    await this.updateComplete;
    this.#clickOutsideListener = this.#handleClickOutside.bind(this);
    this.ownerDocument.addEventListener('click', this.#clickOutsideListener, {
      passive: true,
    });
    this.ownerDocument.addEventListener(
      'scroll',
      this.#handleClickClose.bind(this),
      { passive: true, once: true }
    );
  }

  #handleClickClose() {
    this.popoverOpen = false;
  }

  #handleClickOutside(event: MouseEvent) {
    if (!event.composedPath().includes(this)) {
      this.popoverOpen = false;
      if (this.#clickOutsideListener) {
        this.ownerDocument.removeEventListener(
          'click',
          this.#clickOutsideListener
        );
      }
    }
  }
}
