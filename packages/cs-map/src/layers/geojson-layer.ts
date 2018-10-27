import { MessageBusService, guidGenerator } from '@csnext/cs-core';
import { LayerSource, MapLayers, FeatureEventDetails, IMapLayer, IMapLayerType } from './../.';
import extent from '@mapbox/geojson-extent';
import { LngLatBounds } from 'mapbox-gl';
import { CsMap } from './..';
import mapboxgl from 'mapbox-gl';
import { plainToClass } from 'class-transformer';
import { ILayerAction } from '../classes/ilayer-action';


export class GeojsonLayer implements IMapLayer, IMapLayerType {
    types = ['symbol' , 'raster' , 'line' , 'fill' , 'circle'];

    public getInstance(init?: Partial<IMapLayer>) {
        let result = new GeojsonLayer(init);        
        return result;
    }
    public typeId?:string = 'geojson';
    public id?: string;
    public type?: 'symbol' | 'raster' | 'line' | 'fill' | 'circle';
    public title?: string;
    // public opacity?: number;
    public description?: string;
    public source?: string | LayerSource;
    public visible?: boolean;
    public tags?: string[];
    public color?: string;
    public parentId?: string;
    public _parent?: GeojsonLayer;
    public layout?:
        | mapboxgl.SymbolLayout
        | mapboxgl.FillLayout
        | mapboxgl.LineLayout
        | mapboxgl.CircleLayout;
    public paint?:
        | mapboxgl.SymbolPaint
        | mapboxgl.LinePaint
        | mapboxgl.FillPaint
        | mapboxgl.CirclePaint;
    public _manager?: MapLayers;
    public events?: MessageBusService;
    public popupContent?: string | Function | undefined;

    constructor(init?:Partial<IMapLayer>) {
        Object.assign(this, init);
        // this.events = new MessageBusService();
    }

    public get Visible(): boolean | undefined {
        return this.visible;
    }

    public set Visible(value: boolean | undefined) {
        if (this.visible === value) {
            return;
        }
        this.visible = value;
    }

    public set opacity(value: number | undefined) {

    }

    public get opacity() : number | undefined {
        return 1;

    }

    setOpacity(value: number) {
        this.opacity = value;
        if (this.id && this._manager && this._manager.MapControl) {
            this._manager.MapControl.setLayoutProperty(this.id, 'opacity', value);
        }
    }

    public getLayerActions() : ILayerAction[]
    {
        let res: ILayerAction[] = [];
        if (this.Visible) {
            res.push({ title: 'Zoom to', action: () => {
                if (this._manager) {
                    this._manager.zoomLayer(this);
                }
            } });
            res.push({ title: 'Hide', action: () => {if (this._manager) {
                this._manager.hideLayer(this);
            } }});         
        } else {
            res.push({ title: 'Show', action: () => {if (this._manager) {                
                this._manager.showLayer(this);
            } }});
        }
        return res;
    }

    public getBounds(): LngLatBounds | undefined {
        if (this._source) {
            // create a clone of geojson source, otherwise all features will be reset, bug mapbox?
            let geo = { ...this._source._geojson };
            try {
                let bounds = extent(geo);
                return bounds;
            } catch {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    private isFunction(functionToCheck) {
        return (
            functionToCheck &&
            {}.toString.call(functionToCheck) === '[object Function]'
        );
    }

    // Create a popup, but don't add it to the map yet.
    private popup = new mapboxgl.Popup({
        closeButton: false
    });

    public initLayer(manager: MapLayers) {
        // check if we need to create an instance first of maplayer (needed if imported from json)
        let l =
            typeof this.getBounds === 'function'
                ? this
                : plainToClass(GeojsonLayer, this);

        // add reference to this maplayers manager
        this._manager = manager;

        if (l.id === undefined) {
            l.id = guidGenerator();
        }
        if (typeof l.source === 'string') {
            if (
                manager._sources &&
                manager._sources.layers.hasOwnProperty(l.source)
            ) {
                l._source = manager._sources.layers[l.source];
            }
        } else {
            l._source = l.source = plainToClass(LayerSource, l.source);
        }
        // if no title has been set
        if (l.title === undefined) {
            // check if source has a title
            if (l._source && l._source.title) {
                l.title = l._source.title;
            } else {
                // otherwise use id
                l.title = l.id;
            }
        }

        if (!l.opacity) {
            l.opacity = 100;
        }

        // check for event bus existence
        if (!l.events) { 
            l.events = new MessageBusService();
        }

        // if no color is set, set default color
        if (!l.color) { l.color = 'red'; }

        l._initialized = true;
        return l;
    }

    public addLayer(map: CsMap) {
        if (!this.id || !this._source) {
            return;
        }
        // remove layer if it already exists
        if (map.map.getLayer(this.id) !== undefined) {
            map.map.removeLayer(this.id);
        }
        let mblayer = {
            id: this.id,
            type: this.type,
            source: this._source.id,
            interactive: true
        } as mapboxgl.Layer;
        if (this.layout) {
            mblayer.layout = this.layout;
        }
        if (this.paint) {
            mblayer.paint = this.paint;
        }
        map.map.addLayer(mblayer);
        this.Visible = true;
        // map.zoomLayer(this);
        map.map.on('click', this.id, e => {
            this.click(this, e);
        });
        map.map.on('mousemove', this.id, e => {
            this.mouseMove(map, this, e);
        });
        map.map.on('mouseenter', this.id, e => {
            this.mouseEnter(map, this, e);
        });
        map.map.on('mouseleave', this.id, e => {
            this.mouseLeave(map, this, e);
        });
    }

    public removeLayer(map: CsMap) {
        if (this.id) {
            map.map.removeLayer(this.id);
        }
        this.Visible = false;
    }

    private click(layer: GeojsonLayer, e: any) {
        if (layer.events) {
            layer.events.publish('feature', CsMap.FEATURE_SELECT, {
                features: e.features,
                context: e
            } as FeatureEventDetails);
        }
    }

    private mouseLeave(map: CsMap, layer: GeojsonLayer, e: any) {
        if (layer.popupContent) this.popup.remove();
        if (layer.events) {
            layer.events.publish('feature', CsMap.FEATURE_MOUSE_LEAVE, {
                features: e.features,
                context: e
            });
        }
    }

    private mouseMove(map: CsMap, layer: GeojsonLayer, e: any) {
        if (layer.popupContent && e && e.features) {
            this.createPopup(map, layer, e);
        }
    }

    private mouseEnter(map: CsMap, layer: GeojsonLayer, e: any) {
        this.createPopup(map, layer, e);
        if (layer.events) {
            layer.events.publish('feature', CsMap.FEATURE_MOUSE_ENTER, {
                features: e.features,
                context: e
            });
        }
    }

    private createPopup(map: CsMap, layer: GeojsonLayer, e: any) {
        let popup: string | undefined = undefined;
        if (layer.popupContent) {
            if (typeof layer.popupContent === 'string') {
                popup = layer.popupContent;
            } else if (this.isFunction(layer.popupContent)) {
                popup = layer.popupContent(e);
            }
            if (popup) {
                this.popup
                    .setLngLat(e.lngLat)
                    .setHTML(popup)
                    .addTo(map.map);
            }
        }
    }

    public _source?: LayerSource;
    public _initialized? = false;
}
