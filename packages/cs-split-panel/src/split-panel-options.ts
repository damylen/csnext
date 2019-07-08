import { BaseDashboardOptions } from '@csnext/cs-core';
import { SplitElement } from './split-element';
// tslint:disable-next-line:max-classes-per-file
export class SplitPanelOptions extends BaseDashboardOptions {
  public title?: string;
  public direction: 'horizontal' | 'vertical' = 'horizontal';
  public elements: SplitElement[] = [];
  public disableVerticalScroll = false;

}
