import { IDatasource, guidGenerator, MessageBusService } from '@csnext/cs-core';
import { LayerSource } from './layer-source';
import { MapLayers } from '.';
import { FeatureCollection } from 'geojson';

export class MapLayer {
    public id?: string;
    public type?: 'symbol' | 'raster' | 'line' | 'fill';
    public title?: string;
    public source?: string | LayerSource;
    public visible?: boolean;
    public layout?: mapboxgl.SymbolLayout | mapboxgl.FillLayout | mapboxgl.LineLayout | mapboxgl.CircleLayout;
    public paint?: mapboxgl.SymbolPaint | mapboxgl.LinePaint | mapboxgl.FillPaint | mapboxgl.CirclePaint;
    public _manager?: MapLayers;    
    public events?: MessageBusService;
    public popupContent: any; 

    constructor() {
        this.events = new MessageBusService();
    }

    public get Visible(): boolean | undefined {
        return this.visible;
    }

    public set Visible(value: boolean | undefined) {
        this.visible = value;
        if (!this._manager) { return; }
        if (value === true) {
            this._manager.enableLayer(this);
        } else {
            this._manager.disableLayer(this);
        }
    }

    public _source?: LayerSource;
    public _initialized? = false;
}