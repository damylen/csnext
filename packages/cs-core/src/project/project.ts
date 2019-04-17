import {
  AppTheme,
  IHeaderOptions,
  IFooterOptions,
  IDatasource,
  IDashboard,
  ISidebarOptions,
  NavigationOptions,
  AppStateBase,
  ILanguageOptions,
  ServerConnection,
  IMenu,
  INotificationOptions,
  IUserOptions
} from './..';

/** project definition */
export interface IProject {
  id?: string;
  title?: string;
  logo?: string;
  navigation?: NavigationOptions;
  user?: IUserOptions;
  footer?: IFooterOptions;
  datasources?: { [id: string]: IDatasource | any };
  dashboards?: IDashboard[];
  leftSidebar?: ISidebarOptions;
  rightSidebar?: ISidebarOptions;
  theme?: AppTheme;
  header?: IHeaderOptions;
  notifications?: INotificationOptions;
  menus?: IMenu[];
  languages?: ILanguageOptions;
  data?: any;
  server?: ServerConnection;
  _appState?: AppStateBase;
  init?();
}