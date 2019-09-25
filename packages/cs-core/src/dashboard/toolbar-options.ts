export class ToolbarOptions {
    public hide?: boolean;
    public flat?: boolean;
    public dense?: boolean;
    public hideIcon?: boolean;
    public hideTitle?: boolean;
    public elevation?: number;
}

export class DashboardToolbarOptions extends ToolbarOptions {
    public navigation = 'stepper' || 'stepper-inline' || 'tabs';
}
