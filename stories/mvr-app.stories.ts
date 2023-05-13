import { html, TemplateResult } from 'lit';
import '../src/mvr-app.js';

export default {
  title: 'MvrApp',
  component: 'mvr-app',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  header?: string;
  backgroundColor?: string;
}

const Template: Story<ArgTypes> = ({ header, backgroundColor = 'white' }: ArgTypes) => html`
  <mvr-app style="--mvr-app-background-color: ${backgroundColor}" .header=${header}></mvr-app>
`;

export const App = Template.bind({});
App.args = {
  header: 'My app',
};
