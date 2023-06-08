import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface Image {
  contentUrl: string;
  name?: string;
}

interface Images {
  name?: string;
  items: Image[];
}

interface ImagesList {
  items: Images[];
}

type Assets =
  | Images
  | {
      items: Images[];
    };

function isImagesList(assets: Assets): assets is ImagesList {
  return 'items' in assets;
}

@customElement('mv-assets')
export class MvAssets extends LitElement {
  static styles = [
    css`
      :host {
        display: none;
        position: relative;
      }

      :host([open]) {
        display: block;
      }

      h2 {
        position: sticky;
        inset-block-start: 0;
        background-color: white;
        z-index: 12;
      }

      ul {
        padding: 0;
        list-style: none;
      }

      .images {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 1rem;
        direction: var(--direction, 'rtl');
        text-align: center;
      }

      .images li {
        position: relative;
      }

      input[type='checkbox'] {
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        margin: 0;
        inline-size: 1rem;
        aspect-ratio: 1;
        line-height: 1;
      }

      figure {
        margin: 0;
      }

      img {
        max-width: 100%;
      }

      button {
        display: contents;
        border: none;
        background-color: transparent;
      }
    `,
  ];

  render() {
    if (!this.open) {
      return undefined;
    }

    if (this._error) {
      return html`<p>${this._error}</p>`;
    }

    if (!this.src) {
      return html`<p>ソースが設定されていません</p>`;
    }

    if (!this.srcObject) {
      return html`<p>Loading...</p>`;
    }

    if (isImagesList(this.srcObject)) {
      return html`
        <ul class="images-list">
          ${this.srcObject.items.map(
            item => html` <li>${this.#renderImages(item)}</li> `
          )}
        </ul>
      `;
    }

    return this.#renderImages(this.srcObject);
  }

  #renderImages({ name, items: images }: Images) {
    return html`
      ${name === undefined ? undefined : html`<h2>${name}</h2>`}
      <ul class="images">
        ${images.map(
          image => html`
            <li>
              <button type="button" @click=${() => this.#handleClick(image)}>
                <figure>
                  <img src="${image.contentUrl}" alt="${image.name}" />
                  <figcaption>
                    ${image.name ??
                    new URL(image.contentUrl, window.location.href).pathname
                      .split('/')
                      .at(-1)}
                  </figcaption>
                </figure>
              </button>
            </li>
          `
        )}
      </ul>
    `;
  }

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ reflect: true })
  src = '';

  @property()
  srcObject: Assets | null = null;

  @property({ reflect: true })
  direction: 'ltr' | 'rtl' = 'rtl';

  @state()
  private _error?: string;

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null
  ): void {
    super.attributeChangedCallback?.(name, old, value);
    switch (name) {
      case 'src':
        if (value) {
          this.#load();
        } else {
          this.srcObject = null;
        }
        break;
      case 'direction':
        switch (value) {
          case 'ltr':
            this.style.setProperty('--direction', 'ltr');
            break;
          case 'rtl':
            this.style.setProperty('--direction', 'rtl');
            break;
          default:
        }
        break;
      default:
    }
  }

  async #load() {
    this._error = undefined;
    this.srcObject = null;
    this.srcObject = await fetch(this.src)
      .then(res => res.json())
      .catch(err => {
        this._error = err;
        this.dispatchEvent(new ErrorEvent(err));
      });
    this.dispatchEvent(new Event('load'));
  }

  #handleClick(image: Image) {
    this.dispatchEvent(new CustomEvent('clickasset', { detail: { image } }));
  }
}
