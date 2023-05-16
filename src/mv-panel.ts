import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('mv-panel')
export class MvPanel extends LitElement {
  static styles = css`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      inline-size: 100%;
      block-size: 100%;
      padding: 8%;
    }

    :host([selected]) {
      --border-width: 2px;

      border: solid var(--border-width) black;
      padding: calc(8% - var(--border-width));
    }

    * {
      box-sizing: border-box;
    }

    .heading {
      margin: 0;
      text-align: center;
    }

    input {
      inline-size: 100%;
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
      font-size: small;
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

  tabIndex = -1;

  render() {
    return html`
      <h2 class="heading"><input .value=${this.heading} placeholder="入力してください"></h2>
      <div class="content">
        <slot></slot>
      </div>
      <div class="folio">${this.folio}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mv-panel': MvPanel;
  }
}
