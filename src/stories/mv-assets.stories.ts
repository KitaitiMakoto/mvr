import type { Meta, StoryObj } from '@storybook/web-components';

import '../../out-tsc/src/mv-assets.js';
import type { MvAssets } from '../mv-assets';

const meta: Meta<MvAssets> = {
  title: 'Mv/Assets',
  component: 'mv-assets',
  argTypes: {
    direction: {
      control: 'select',
      options: ['ltr', 'rtl'],
    },
  },
};

export default meta;

type Story = StoryObj<MvAssets>;

export const Default: Story = {
  args: {
    open: true,
    src: '/assets/assets.json',
    direction: 'rtl',
  },
};
