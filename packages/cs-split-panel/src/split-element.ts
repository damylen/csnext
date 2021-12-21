import { SplitPanelOptions } from './.';

export class SplitElement {
  public size?: number;
  public title?: string;
  public sizeUnit?: 'fr' | 'px' | '%' | 'repeat' = '%';
  public minSize?: number;
  public widgetId?: string;
  public dashboardId?: string;
  public splitpanel?: SplitPanelOptions;
  public hide?: boolean;
  public expandToMin?: boolean;
}
