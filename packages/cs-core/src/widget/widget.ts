import { WidgetOptions, IMessageBusService, IDashboard, IDashboardManager, IProject } from '..';

export enum WidgetType {
  component,
  html
}
export interface IWidget {
  id?: string;
  title?: string;
  type?: WidgetType;
  reference?: string;
  component?: any;
  content?: any;
  datasource?: string;
  data?: any;
  options?: WidgetOptions;
  editorWidget?: IWidget;
  events?: IMessageBusService;
  _dashboard?: IDashboard;
  _manager?: IDashboardManager;
  _initalized?: boolean;
  _style?: any;
  _project?: IProject;
  _size?: IWidgetSize;
  _component?: any;
}

export interface IWidgetSize {
  width: number;
  height: number;
}