import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import '../../out-tsc/src/mv-panel.js';
import type { MvPanel } from '../mv-panel';

const meta: Meta<MvPanel> = {
  title: 'Mv/Panel',
  component: 'mv-panel',
};

export default meta;
type Story = StoryObj<MvPanel>;

function render({ heading, folio }: MvPanel) {
  return html`
    <div style="width: 12rem; aspect-ratio: 3 / 4; background-color: #eee;">
      <mv-panel heading="${heading}" folio="${folio}"></mv-panel>
    </div>
  `;
}

export const Default: Story = {
  args: {
    heading: '',
    folio: '',
  },
  render,
};

export const ImagePanel: Story = {
  args: {
    heading: 'Image panel',
    folio: '6',
  },
  render: ({ heading, folio }) => html`
    <div style="width: 12rem; aspect-ratio: 3 / 4; background-color: #eee;">
      <mv-panel heading="${heading}" folio="${folio}">
        <img
          src="/static/media/src/stories/assets/plugin.svg"
          alt=""
          style="border: dashed 1px gray;"
        />
      </mv-panel>
    </div>
  `,
};

export const TextPanel: Story = {
  args: {
    heading: 'Text panel',
    folio: '6',
  },
  render: ({ heading, folio }) => html`
    <div style="width: 12rem; aspect-ratio: 3 / 4; background-color: #eee;">
      <mv-panel heading="${heading}" folio="${folio}">
        <textarea></textarea>
      </mv-panel>
    </div>
  `,
};

export const Folio: Story = {
  args: {
    folio: '6',
  },
  render,
};
