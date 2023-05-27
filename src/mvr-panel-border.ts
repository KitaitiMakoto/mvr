import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('mvr-panel-border')
export class MvrPanelBorder extends LitElement {
  static styles = css`
    :host {
      background-color: transparent;
    }

    div {
      inline-size: 100%;
      block-size: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    :host([divider]) div::before {
      --border-width: 1px;

      content: '';
      block-size: calc(100% - 2rem);
      border-inline-start: solid var(--border-width) currentColor;
      transform: translateX(calc(var(--border-width) / 2));
    }
  `;

  render() {
    return html` <div></div> `;
  }

  @property({ type: Boolean, reflect: true })
  divider = false;
}
