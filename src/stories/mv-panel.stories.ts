import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '../../out-tsc/src/mv-panel.js';
import type {MvPanel} from '../mv-panel';

const meta: Meta<MvPanel> = {
  title: 'Mv/Panel',
  component: 'mv-panel'
};

export default meta;
type Story = StoryObj<MvPanel>;

export const Default: Story = {
  args: {
    selected: false,
    heading: "",
    folio: ""
  },
  render
};

export const ImagePanel: Story = {
  args: {
    selected: false,
    heading: "Image panel",
    folio: "6"
  },
  render: ({selected, heading, folio}) => html`
    <div style="width: 12rem; aspect-ratio: 3 / 4; background-color: #eee;">
      <mv-panel heading="${heading}" folio="${folio}" .selected=${selected}>
        <img src="/static/media/src/stories/assets/plugin.svg" alt="" style="border: dashed 1px gray;">
      </mv-panel>
    </div>
  `
}

export const TextPanel: Story = {
  args: {
    selected: false,
    heading: "Text panel",
    folio: "6"
  },
  render: ({selected, heading, folio}) => html`
    <div style="width: 12rem; aspect-ratio: 3 / 4; background-color: #eee;">
      <mv-panel heading="${heading}" folio="${folio}" .selected=${selected}>
        <textarea></textarea>
      </mv-panel>
    </div>
  `
};

export const Selected: Story = {
  args: {
    selected: true,
  },
  render
};

export const Folio: Story = {
  args: {
    folio: '6'
  },
  render
}

function render({selected, heading, folio}: MvPanel) {
  return html`
    <div style="width: 12rem; aspect-ratio: 3 / 4; background-color: #eee;">
      <mv-panel heading="${heading}" folio="${folio}" .selected=${selected}></mv-panel>
    </div>
  `;
}
