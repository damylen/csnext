import { Dashboard } from './dashboard';
import { IDataSource } from './datastore';
import { IServiceConfig } from "./serviceconfig";

export class Project {

    public id?: string;
    public title?: string;
    public navigation?: NavigationOptions = {};
    public footer?: FooterOptions = {};
    public dataSources? : { [id : string] : IDataSource} = {};
    public dashboards?: Dashboard[] =[];
    public services? : { [id: string] : IServiceConfig} = {};
    public left? : SidebarOptions = { };
    
    public constructor() {                    
    }

}

export class SidebarOptions {
    public open?: boolean;
    public title?: string;
    public component?: any;
}

export class NavigationOptions {
    public style?: string;
}

export class FooterOptions {
    public enabled?: boolean;
    public text?: string;
}



