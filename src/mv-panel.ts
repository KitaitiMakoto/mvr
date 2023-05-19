import {LitElement, css, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

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

    .heading, .content, .folio {
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

  @property({type: Boolean, reflect: true})
  selected: boolean = false;

  @property({reflect: true})
  heading: string = '';

  @property({reflect: true})
  folio?: string;

  @query('input[name="heading"]')
  private _$headingInput!: HTMLInputElement;

  tabIndex = -1;

  render() {
    return html`
      <h2 class="heading"><input name="heading" value="${this.heading}" placeholder="入力してください" @change=${this.#handleHeadingChange}></h2>
      <div class="content">
        <slot></slot>
      </div>
      <div class="folio">${this.folio}</div>
    `;
  }

  #handleHeadingChange() {
    this.dispatchEvent(new CustomEvent('headingchange', {detail: {value: this._$headingInput.value}}));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mv-panel': MvPanel;
  }
}
