import { Watch, Prop } from 'vue-property-decorator';
import Vue from 'vue';
import { IWidget, guidGenerator } from '@csnext/cs-core';
import Component from 'vue-class-component';
import './cs-map.css';
import mapboxgl, { VectorSource, GeoJSONSource } from 'mapbox-gl';
import { Feature } from 'geojson';
import {
    MapLayers,
    MapOptions,
    LayerSource,
    IMapLayer,
    IMapLayerType,
    IStartStopService
} from '../../.';
import { plainToClass } from 'class-transformer';

export interface FeatureEventDetails {
    context: any;
    features: Feature[];
}

@Component({
    template: require('./cs-map.html')
})
export class CsMap extends Vue {
    /** access the original widget from configuration */

    public static FEATURE_SELECT = 'select';
    public static FEATURE_MOUSE_ENTER = 'enter';
    public static FEATURE_MOUSE_LEAVE = 'enter';

    @Prop()
    public widget!: IWidget;
    public map!: mapboxgl.Map;

    public static layerTypes: IMapLayerType[] = [];
    public static serviceTypes: IStartStopService[] = [];

    /** register new layertype  */
    public static AddLayerType(type: IMapLayerType) {
        if (
            CsMap.layerTypes.findIndex(lt => lt.typeId === type.typeId) === -1
        ) {
            CsMap.layerTypes.push(type);
        }
    }

    public static AddLayerServiceType(type: IStartStopService) {
        if (CsMap.serviceTypes.findIndex(lt => lt.type === type.type) === -1) {
            CsMap.serviceTypes.push(type);
        }
    }

    // Create a popup, but don't add it to the map yet.
    private popup = new mapboxgl.Popup({
        closeButton: false
    });

    public get Manager(): MapLayers | undefined {
        if (this.widget) {
            if (this.widget.content) {
                return this.widget.content as MapLayers;
            } else if (this.widget.data) {
                return this.widget.data as MapLayers;
            }
        }
        return undefined;
    }

    public get options(): MapOptions {
        if (this.widget && this.widget.options) {
            return this.widget.options as MapOptions;
        }
        return new MapOptions();
    }

    @Watch('widget.content')
    dataLoaded() {
        this.initMapLayers();
    }

    public beforeMount() {
        if (!this.widget) {
            return;
        }
    }

    public zoomLayer(mapLayer: IMapLayer) {
        let bounds = mapLayer.getBounds();
        if (bounds) {
            this.map.fitBounds(bounds, { padding: 20 });
        }
    }

    public addImage(id: string, url: string) {
        if (!this.map.hasImage(id)) {
            this.map.loadImage(url, (error, image) => {
                if (!this.map.hasImage(id)) {
                    if (error) throw error;
                    this.map.addImage(id, image);
                }
            });
        }
    }

    public async startServices() {
        if (this.Manager && this.Manager.services) {
            for (const service of this.Manager.services) {
                if (service.Start) {
                    await service.Start(this.Manager);
                }
            }
        }
    }

    public initMapLayers() {
        if (
            this.Manager &&
            this.map &&
            this.map.loaded &&
            this.Manager.events
        ) {
            if (this.Manager.MapWidget === undefined) {
                this.Manager.MapWidget = this;
            }
            if (this.Manager._sources && this.Manager._sources.images) {
                for (var id in this.Manager._sources.images) {
                    this.addImage(id, this.Manager._sources.images[id]);
                }
            }

            this.Manager.MapWidget = this;

            if (this.Manager.layers) {
                this.Manager.layers.forEach(l => {
                    if (this.Manager && l.Visible) {
                        this.showLayer(l);
                    }
                });
            }

            this.Manager.events.subscribe(
                'layer',
                (action: string, layer: IMapLayer) => {
                    switch (action) {
                        case 'enabled':
                            // this.showLayer(layer);

                            break;
                        case 'disabled': {
                            this.removeLayer(layer);
                            break;
                        }
                        case 'remove': {
                            this.removeLayer(layer);
                            break;
                        }
                    }
                }
            );
        }
    }

    public async showLayer(layer: IMapLayer): Promise<IMapLayer> {
        return new Promise<IMapLayer>((resolve, reject) => {
            if (layer.id && layer._source && layer._source.id) {
                layer._source.LoadSource().then(geojson => {
                    if (layer.id && layer._source && layer._source.id) {
                        this.addSource(layer._source);
                        if (typeof layer.addLayer === 'function') {
                            layer.addLayer(this);
                        }
                        resolve(layer);
                    }
                });
            }
        });
    }

    public removeLayer(layer: IMapLayer) {
        if (layer.id) {
            if (typeof layer.removeLayer === 'function') {
                layer.removeLayer(this);
            }
        }
    }

    mounted() {
        this.initMapLayers();

        Vue.nextTick(() => {
            if (this.options.token) {
                mapboxgl.accessToken = this.options.token;
            }

            // if (!this.options.mbOptions) this.options.mbOptions = {};
            this.options.mbOptions = {
                ...{
                    container: 'mapbox-' + this.widget.id,
                    style: 'mapbox://styles/mapbox/basic-v9',
                    center: [5.753699, 53.450862],
                    zoom: 10
                },
                ...this.options.mbOptions
            };

            // init map
            this.map = new mapboxgl.Map(this.options.mbOptions);

            // ad navigation control
            var nav = new mapboxgl.NavigationControl({
                showCompass: (this.widget.options as MapOptions).showCompass,
                showZoom: (this.widget.options as MapOptions).showZoom
            });
            this.map.addControl(nav, 'top-left');

            // subscribe to widget events
            if (this.widget.events) {
                // check if widget has been resized
                this.widget.events.subscribe('resize', () => {
                    Vue.nextTick(() => {
                        this.map.resize();
                    });
                });
            }

            // check if map has loaded
            this.map.on('load', e => {
                this.startServices();
                this.mapLoaded(e);

                // this.map.addLayer({
                //     id: 'wms-test-layer',
                //     type: 'raster',
                //     source: {
                //         type: 'raster',
                //         tiles: [
                //             'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&VERSION=1.3.0&bbox={bbox-epsg-3857}&REQUEST=GetMap&format=image/png&width=265&height=256&LAYERS=RADNL_OPER_R___25PCPRR_L3_COLOR&CRS=EPSG%3A3857&transparent=true'
                //             // 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?SERVICE=WMS&VERSION=1.1.1&bbox={bbox-epsg-3857}'
                //             // 'https://geodata.state.nj.us/imagerywms/Natural2015?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=Natural2015'
                //         ],
                //         tileSize: 256
                //     },
                //     paint: {}
                // });
            });
        });
    }

    private mapLoaded(e: any) {
        if (this.Manager && !this.Manager.MapWidget) {
            this.Manager.MapWidget = this;
        }
        if (this.options.activeLayers) {
            this.options.activeLayers.forEach(id => {
                if (this.Manager && this.Manager.layers) {
                    let layer = this.Manager.layers.find(l => l.id === id);
                    if (layer) {
                        this.Manager.addLayer(layer);
                    }
                }
            });
        }
        if (this.widget.events) this.widget.events.publish('map', 'loaded', e);
        // this.map.addSource('mask',);

        //     {
        //     "id": "zmask",
        //     "source": "mask",
        //     "type": "fill",
        //     "paint": {
        //       "fill-color": "#4192DD",
        //       'fill-opacity': 0.999
        //     }
        //   });
    }

    private addSource(source: LayerSource) {
        if (source.id) {
            let original = this.map.getSource(source.id);
            if (original !== undefined) {
                if (original.type === 'geojson' && source._geojson) {
                    original.setData(source._geojson);
                }
            } else {
                switch (source.type) {
                    case 'raster':
                        if (source.url) {
                            this.map.addSource(source.id, {
                                type: source.type,
                                tiles: [source.url],
                                tileSize: source.tileSize
                            });
                        }
                        break;
                    default:
                        source.type = 'geojson';
                        this.map.addSource(source.id, {
                            type: source.type,
                            data: source._geojson
                        });
                        break;
                }
                // let vs = this.map.getSource(source.id) as GeoJSONSource;
            }
        }
    }

    private addLayerSourceToMap(layer: LayerSource) {
        if (layer.id) {
            this.map.addLayer({
                id: layer.id,
                type: 'fill',
                source: layer.id
            });
        }
    }

    initLayerSource(source: LayerSource): any {
        // load datasource
        if (source.id && source._geojson) {
            if (!this.map.isSourceLoaded(source.id)) {
                this.addSource(source);
            }
            this.addLayerSourceToMap(source);
        } else {
            if (source.url) {
            }

            // load source
        }
    }
}