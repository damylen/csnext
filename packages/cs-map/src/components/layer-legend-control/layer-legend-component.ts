import Component from 'vue-class-component';
import { IWidget, MessageBusHandle, guidGenerator } from '@csnext/cs-core';

import './layer-legend-component.css';
import { Vue, Watch, Prop } from 'vue-property-decorator';
import { MapLayers, IMapLayer, CsMap, FeatureType } from '../../.';
import { Feature } from 'geojson';
import { LayerLegend } from '../../classes/layer-legend';

@Component({
    name: 'layer-legend-component',
    props: { widget: null, manager: null },
    template: require('./layer-legend-component.html')
} as any)
export class LayerLegendComponent extends Vue {
    public widget!: IWidget;
    public manager!: MapLayers;
    public busHandle?: MessageBusHandle;
    public layer!: IMapLayer | undefined;
    public mapDraw: any;
    public activeType: any;
    public types?: { [key: string]: FeatureType } = {};
    public map?: mapboxgl.Map;
    public layers: IMapLayer[] = [];
    public activeLayer: IMapLayer | any = {};
    public activeLegend: LayerLegend | any = {};

    private updateLegendList() {
        if (this.manager && this.manager.layers) {
            this.layers = this.manager.layers.filter(
                l => l.Visible && l._legends && l._legends.length > 0
            );
            if (this.layers.length > 0) {
                if (this.activeLayer === undefined)
                    this.activeLayer = this.layers[0];
                if (this.activeLayer._legends) {
                    this.activeLegend = this.activeLayer._legends[0];
                }
                this.$forceUpdate();
                // Vue.set(this, 'activeLayer', this.layers[0]);
            }
            // this.layers.forEach(l => console.log(l._legends));
        }
    }

    public selectLayer(layer: IMapLayer) {
        this.activeLayer = layer;
    }

    public mounted() {
        this.map = this.manager.MapControl;
        this.mapDraw = this.manager.MapWidget!.mapDraw;

        this.manager.events.subscribe('layer', (a: string, l: IMapLayer) => {
            this.updateLegendList();
        });

        this.updateLegendList();
    }
}