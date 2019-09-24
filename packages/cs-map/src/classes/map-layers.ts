import { IDatasource, MessageBusService, MessageBusHandle } from '@csnext/cs-core';
import { LayerSource } from './layer-source';
import {
    LayerSources,
    CsMap,
    IMapLayer,
    GeojsonLayer,
    PropertyDetails
} from '../.';
import { guidGenerator } from '@csnext/cs-core';
import { plainToClass } from 'class-transformer';
import {
    FeatureCollection,
    Feature,
    Point,
    LineString,
    Polygon
} from 'geojson';
import { ILayerService, IStartStopService } from './layer-service';
import { GeoJSONSource, RasterSource, LngLat } from 'mapbox-gl';
import { AppState } from '@csnext/cs-client';

export class MapLayers implements IDatasource {
    public _sources?: LayerSources;
    public id = 'maplayers';    
    private pointPickerHandler?: MessageBusHandle;
    public events = new MessageBusService();
    public activeDrawLayer?: IMapLayer;
    private map?: CsMap;
    public get MapWidget(): CsMap | undefined {
        return this.map;
    }

    public set MapWidget(map: CsMap | undefined) {
        this.map = map;
    }

    public get MapControl(): mapboxgl.Map | undefined {
        if (this.MapWidget && this.MapWidget.map) {
            return this.MapWidget.map;
        } else {
            return undefined;
        }
    }

    constructor(
        public layers?: IMapLayer[],
        public sources?: string | LayerSources,
        public services?: IStartStopService[]
    ) {
        this.layers = layers;
    }

    public clearLayers() {
        if (this.layers) {
            this.layers.map(l => {
                this.hideLayer(l);
            });
        }
        this.events.publish('layer', 'cleared');
    }

    public fromGeoJSON(
        geojson: FeatureCollection,
        title?: string
    ): GeojsonLayer {
        let result = new GeojsonLayer();
        result.title = title ? title : 'new layer';
        result.source = new LayerSource();
        result.source.id = guidGenerator();
        result.source.type = 'geojson';
        result.source._geojson = geojson;
        result.source._loaded = true;
        result.initLayer(this);
        return result;
    }

    public removeLegend(layer: IMapLayer, pd: PropertyDetails) { }

    public startPointPicker(title?: string): Promise<LngLat | undefined> {
        return new Promise((resolve, reject) => {
            if (!this.map) { return; }
            if (this.map.pointPickerActivated) {
                reject();
                return;
            }
            AppState.Instance.TriggerNotification({
                title: title ? title : 'SELECT_POINT', timeout: 0, clickCallback: () => {
                    reject();
                    this.map!.pointPickerActivated = false;
                    if (this.pointPickerHandler) {
                        this.events.unsubscribe(this.pointPickerHandler);
                    }
                    return {};
                }
            });

            this.map.pointPickerActivated = true;
            this.pointPickerHandler = this.events.subscribe('map', (a: string, e: any) => {
                if (a === CsMap.MAP_CLICK) {          
                    this.map!.pointPickerActivated = false;
                    if (this.pointPickerHandler) {
                        this.events.unsubscribe(this.pointPickerHandler);
                    }
                    if (e.lngLat) {
                        resolve(e.lngLat);
                    }
                    AppState.Instance.ClearNotifications();
                    return;
                }
            });
        });
    }

    public refreshLayerSource(ml: IMapLayer): Promise<IMapLayer> {
        return new Promise((resolve, reject) => {
            if (ml._source) {
                ml._source._loaded = false;
                ml._source
                    .LoadSource()
                    .then(() => {
                        this.updateLayerSource(ml, undefined, false);
                        resolve(ml);
                    })
                    .catch(e => {
                        reject(e);
                    });
            } else {
                reject();
            }
        });
    }

    public showLayer(ml: IMapLayer): Promise<IMapLayer> {
        return new Promise((resolve, reject) => {
            ml.Visible = true;
            if (this.map) {
                this.map
                    .showLayer(ml)
                    .then(maplayer => {
                        if (ml.isEditable) {
                            this.activeDrawLayer = ml;
                            this.events.publish(
                                CsMap.DRAWLAYER,
                                CsMap.DRAWLAYER_ACTIVATED,
                                ml
                            );
                        }
                        resolve(maplayer);
                    })
                    .catch(() => {
                        reject();
                    });

                this.events.publish('layer', 'enabled', ml);
                // check if not already subscribed to features events
                if (ml._events && !ml._featureEventHandle) {
                    // if not subscribe

                    ml._featureEventHandle = ml._events.subscribe(
                        'feature',
                        (a: string, f: Feature) => {
                            // also publish this event to manager
                            this.events.publish('feature', a, f);
                        }
                    );
                }
            }
        });
    }

    public loadLayer(ml: IMapLayer): Promise<IMapLayer> {
        return new Promise(async (resolve, reject) => {
            if (this.layers) {
                if (this.layers.findIndex(l => l.id === ml.id) === -1) {
                    this.layers.push(ml);
                }

                if (ml.source) {
                    ml._source = plainToClass(LayerSource, ml.source);
                    ml._source
                        .LoadSource()
                        .then(() => {
                            resolve(ml);
                        })
                        .catch(() => {
                            reject();
                        });
                }
            }
        });
    }

    public refreshLayers() {
        if (this.layers) {
            for (const layer of this.layers) {
                this.refreshLayer(layer);
            }
        }
    }

    public refreshLayer(layer: IMapLayer) {
        if (layer.Visible) {
            this.hideLayer(layer);
            this.showLayer(layer);
        }
    }

    public zoomLayer(layer: IMapLayer, padding?: number) {
        if (this.map) {
            this.map.zoomLayer(layer, padding);
        }
    }

    public moveLayer(layer: IMapLayer, beforeId?: string) {
        layer.moveLayer(beforeId);
    }

    public zoomFeature(feature: Feature, zoomLevel?: number) {
        if (!this.map) {
            return;
        }
        var coords: [number, number] | undefined = undefined;
        if (feature.geometry.type === 'Point') {
            coords = (feature.geometry as Point).coordinates as [
                number,
                number
            ];
        } else if (feature.geometry.type === 'LineString') {
            coords = (feature.geometry as LineString).coordinates[0] as [
                number,
                number
            ];
        } else if (feature.geometry.type === 'Polygon') {
            coords = (feature.geometry as Polygon).coordinates[0][0] as [
                number,
                number
            ];
        }
        if (coords)
            this.map.map.flyTo({
                center: LngLat.convert(coords),
                zoom: zoomLevel ? zoomLevel : this.map.map.getZoom()
            });
    }

    public zoomFeatureId(layer: IMapLayer, featureId: string) {
        if (!layer._source || !layer._source._geojson || !this.map) return;
        const feature = layer._source._geojson.features.find(
            f => f.id === featureId || f.properties!['_fId'] === featureId
        );
        if (!feature) return;
        var coords: [number, number] | undefined = undefined;
        if (feature.geometry.type === 'Point') {
            coords = (feature.geometry as Point).coordinates as [
                number,
                number
            ];
        } else if (feature.geometry.type === 'LineString') {
            coords = (feature.geometry as LineString).coordinates[0] as [
                number,
                number
            ];
        } else if (feature.geometry.type === 'Polygon') {
            coords = (feature.geometry as Polygon).coordinates[0][0] as [
                number,
                number
            ];
        }
        if (coords) this.map.map.easeTo({ center: LngLat.convert(coords) });
    }

    public hideLayer(ml: string | IMapLayer) {
        if (!this.layers) return;
        if (typeof ml === 'string') {
            let layer = this.layers.find(l => l.id === ml);
            if (layer) this.hideLayer(layer);
        } else {

            // unsubscribe from feature events
            if (ml._events && ml._featureEventHandle !== undefined) {
                ml._events.unsubscribe(ml._featureEventHandle);
                ml._featureEventHandle = undefined;
            }
            if (this.map) {
                if (this.activeDrawLayer === ml) {
                    this.activeDrawLayer = undefined;
                    this.events.publish(
                        CsMap.DRAWLAYER,
                        CsMap.DRAWLAYER_DEACTIVATED,
                        ml
                    );
                }
                this.map.removeLayer(ml);
                this.events.publish('layer', 'disabled', ml);
            }
            this.events.publish('layer', 'removed', ml);
        }
    }

    public removeLayer(layerId: string) {
        if (!this.layers) { return; }
        this.hideLayer(layerId);
        this.layers = this.layers.filter(l => l.id !== layerId);
    }

    /** delete feature from a feature  */
    public deleteLayerFeature(
        ml: IMapLayer | string,
        id: string,
        updateSource = true
    ) {
        let layer: IMapLayer | undefined = undefined;
        if (typeof ml === 'string') {
            if (this.layers) {
                layer = this.layers.find(l => l.id === ml);
            }
        } else {
            layer = ml;
        }
        if (layer && layer._source && layer._source._geojson) {
            let index = layer._source._geojson.features.findIndex(
                f => f.id === id
            );

            if (index >= 0) {
                layer._source._geojson.features.splice(index, 1);
                if (updateSource) {
                    this.updateLayerSource(layer, layer._source._geojson);
                }
            }
        }
    }

    /** Replace/update a feature for a given layer */
    public updateLayerFeature(
        ml: IMapLayer | string,
        feature: Feature,
        updateSource = true
    ) {
        let layer: IMapLayer | undefined = undefined;
        if (typeof ml === 'string') {
            if (this.layers) {
                layer = this.layers.find(l => l.id === ml);
            }
        } else {
            layer = ml;
        }
        if (
            layer &&
            layer._source &&
            layer._source._geojson &&
            feature.id !== undefined
        ) {
            // find existing feature
            let index = layer._source._geojson.features.findIndex(
                f => f.id === feature.id
            );
            // if found, replace it
            if (index >= 0) {
                layer._source._geojson.features[index] = feature;
                if (updateSource) {
                    this.updateLayerSource(layer);
                }
            }
            else {
                // add new feature
                layer._source._geojson.features.push(feature);
                if (updateSource) {
                    this.updateLayerSource(layer);
                }
            }
        }
    }

    /** Replace/update a collection of features for a given layer */
    public updateLayerFeatures(
        ml: IMapLayer | string,
        features: { [key: string]: Feature },
        updateSource = true
    ) {
        let layer: IMapLayer | undefined = undefined;
        if (typeof ml === 'string') {
            if (this.layers) {
                layer = this.layers.find(l => l.id === ml);
            }
        } else {
            layer = ml;
        }
        if (
            layer &&
            layer._source &&
            layer._source._geojson
        ) {
            for (const key in features) {
                if (features.hasOwnProperty(key)) {
                    const feature = features[key];
                    // find existing feature
                    let index = layer._source._geojson.features.findIndex(
                        f => f.id === key
                    );

                    // if found, replace it
                    if (index >= 0) {
                        layer._source._geojson.features[index] = feature;
                    }
                    else {
                        // add new feature
                        layer._source._geojson.features.push(feature);
                    }
                }
            }

            if (updateSource) {
                this.updateLayerSource(layer);
            }
        }
    }

    public updateFeatureProperty(
        source: string,
        featureId: number,
        props: any
    ) {
        if (this.MapControl) {
            this.MapControl.setFeatureState(
                { source: source, id: featureId as any },
                props
            );
        }
    }

    public updateSource(source: LayerSource) {
        if (source && source.id && source._geojson && this.MapControl) {
            let mapsource = this.MapControl.getSource(
                source.id
            ) as GeoJSONSource;
            if (mapsource) {
                mapsource.setData(source._geojson);
            } else if (this.map) {
                this.map.addSource(source);
                // this.map.initLayerSource(source);
            }
        }
    }

    //    public updateLayerSource(ml: IMapLayer, geojson?: FeatureCollection | string) {
    //        if (!geojson && ml._source && ml._source._geojson) {
    //            geojson = ml._source._geojson;
    //        }
    //        let g = typeof geojson === 'string' ? (JSON.parse(geojson) as FeatureCollection) : geojson;
    //        if (g && ml._source && ml._source.id && this.MapControl) {
    //            let sourceId = ml._source.id;
    //            (this.MapControl.getSource(sourceId) as GeoJSONSource).setData(g);
    //        }
    //        if (ml._source && ml._source.id && ml._source.url && ml._source.type === 'raster' && this.MapControl) {
    //            const wasVisible = ml.Visible;
    //            if (wasVisible && ml._manager!.map!.map!.getLayer(ml.id!)) ml._manager!.map!.map!.removeLayer(ml.id!);
    //            const newSource = {
    //                type: ml._source.type,
    //                tiles: [ml._source.url],
    //                tileSize: ml._source.tileSize
    //            }
    //            if (this.MapControl.getSource(ml._source.id)) this.MapControl.removeSource(ml._source.id);
    //            this.MapControl.addSource(ml._source.id, newSource as RasterSource);
    //            if (wasVisible) ml._manager!.map!.map!.addLayer({id: ml.id!,type: 'raster', source: ml._source.id!});
    //        }
    //        console.log(ml);
    //        // if (ml._source) {
    //        //     this.MapControl.getSource(ml.source)
    //        // }
    //    }

    public updateLayerSource(
        ml: IMapLayer,
        geojson?: FeatureCollection | string,
        triggerEvent = true
    ) {
        if (!geojson && ml._source && ml._source._geojson) {
            geojson = ml._source._geojson;
        }
        let g =
            typeof geojson === 'string'
                ? (JSON.parse(geojson) as FeatureCollection)
                : geojson;
        if (!ml._source && ml.source) {
            ml._source = ml.source as LayerSource;
        }

        if (g && ml._source && ml._source.id && this.MapControl) {
            ml._source._geojson = g;
            let sourceId = ml._source.id;
            let source = this.MapControl.getSource(sourceId) as GeoJSONSource;
            if (source && ml._events) {
                source.setData(g);
                if (triggerEvent) {
                    ml._events.publish('source', 'updated', source);
                }
                ml._events.publish('layer', CsMap.LAYER_UPDATED, ml);
            }
        }
        if (
            ml._source &&
            ml._source.id &&
            ml._source.url &&
            ml._source.type === 'raster' &&
            this.MapControl
        ) {
            const wasVisible = ml.Visible;
            if (wasVisible && ml.id && ml._manager!.map!.map!.getLayer(ml.id))
                ml._manager!.map!.map!.removeLayer(ml.id!);
            const newSource = {
                type: ml._source.type,
                tiles: [ml._source.url],
                tileSize: ml._source.tileSize
            };
            if (this.MapControl.getSource(ml._source.id))
                this.MapControl.removeSource(ml._source.id);
            this.MapControl.addSource(ml._source.id, newSource as RasterSource);
            if (wasVisible)
                ml._manager!.map!.map!.addLayer({
                    id: ml.id!,
                    type: 'raster',
                    source: ml._source.id!
                });
        }
        // if (ml._source) {
        //     this.MapControl.getSource(ml.source)
        // }
    }

    private getServiceInstance(
        type: string,
        init?: ILayerService
    ): IStartStopService | undefined {
        const serviceType = CsMap.serviceTypes.find(st => st.type === type);
        if (serviceType && serviceType.getInstance) {
            const res = serviceType.getInstance(init);
            return res;
        }
        return;
    }

    /** Create a IMapLayer instance based on layer type, optionally provide maplayer config */
    private getLayerInstance(
        type: string,
        init?: IMapLayer
    ): IMapLayer | undefined {
        const layerType = CsMap.layerTypes.find(
            lt => lt.types !== undefined && lt.types.includes(type)
        );
        if (!layerType || !layerType.getInstance) {
            return;
        }
        const res = layerType.getInstance(init);
        res._manager = this;
        return res;
    }

    public addLayer(ml: IMapLayer): Promise<IMapLayer> {
        return new Promise((resolve, reject) => {
            if (!ml.type || !this.layers) {
                reject();
                return;
            }
            let layer = this.getLayerInstance(ml.type, ml);
            if (layer) {
                if (!layer._events) {
                    layer._events = new MessageBusService();
                }
                layer.initLayer(this);
                this.layers.push(layer);
                if (layer.style) {
                    // if specified, set default legend
                    if (layer.style.defaultLegendProperty) {
                        layer.setLegend(layer.style.defaultLegendProperty, false);
                    }
                }
                this.showLayer(layer)
                    .then(m => resolve(m))
                    .catch(e => reject(e));
            }
            this.events.publish('layer', 'added', layer);
        });
    }

    public execute(datasources: { [id: string]: IDatasource }): Promise<any> {
        return new Promise(resolve => {
            // if datasource is a string, find actual datasource;
            if (typeof this.sources === 'string') {
                if (datasources.hasOwnProperty(this.sources)) {
                    this._sources = datasources[this.sources] as LayerSources;
                }
            } else {
                this._sources = this.sources;
            }

            // initialize services and layers
            this.initServices();
            this.initLayers();
            resolve(this);
        });
    }

    /** create an instance and initialize all layers */
    private initLayers() {
        let layers: IMapLayer[] = [];
        if (this.layers) {
            for (const l of this.layers) {
                if (l.type) {
                    // create layer instance based on type
                    let li = this.getLayerInstance(l.type, l);
                    if (li) {
                        li.initLayer(this);
                        layers.push(li);
                    }
                }
            }
        } else {
        }
        this.layers = layers;
    }

    /** create an instance and initialize all services */
    private initServices() {
        let services: IStartStopService[] = [];
        if (this.services) {
            for (const service of this.services) {
                let si = this.getServiceInstance(service.type, service);
                if (si) {
                    services.push(si);
                }
            }
        }
        this.services = services;
    }
}
