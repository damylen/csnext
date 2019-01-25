import Component from 'vue-class-component';
import { IWidget } from '@csnext/cs-core';

import './feature-details.css';
import { Vue } from 'vue-property-decorator';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { Feature } from 'geojson';
import { BaseLayer } from '../../layers/base-layer';
import { FeatureType, PropertyType } from '../../classes/feature-type';
import { stringify } from 'querystring';
import { pathToFileURL } from 'url';
import { MapLayers } from '../../classes/map-layers';

export class section {
    public id?: string;
    public title?: string;
    public properties?: property[];
}

export class property {
    public key?: string;
    public value?: any;
    public type?: PropertyType;
}

@Component({
    name: 'feature-details',
    props: { widget: null },
    components: { VuePerfectScrollbar },
    template: require('./feature-details.html')
} as any)
export class FeatureDetails extends Vue {
    public widget!: IWidget;
    public sectionsPanels: boolean[] = [];
    public tabs = null;

    /** get active layer */
    public get layer(): BaseLayer | undefined {
        if (this.widget.data && this.widget.data.layer) {
            return this.widget.data.layer as BaseLayer;
        }
        return undefined;
    }

    /** get feature title */
    public get title(): string {
        const layer = this.layer;
        if (layer) {
            return layer.parseTitle(this.feature);
        } else {
            return '';
        }
    }

    /** get layer color */
    public get layerColor(): string {
        const layer = this.layer;
        if (layer && layer.color) {
            return layer.color;
        }
        return 'blue';
    }

    public get manager(): MapLayers | undefined {
        if (this.widget.data && this.widget.data.manager) {
            return this.widget.data.manager as MapLayers;
        }
    }

    /** get active feature */
    public get feature(): Feature | undefined {
        if (this.widget.data && this.widget.data.feature) {
            return this.widget.data.feature;
        }
        return undefined;
    }

    /** get list of available section, with their properties */
    public get sections(): section[] {
        let layer = this.layer;
        if (!layer || !this.feature) {
            return [];
        }

        // create default section
        let defaultSection = {
            id: 'default',
            title: 'default',
            properties: []
        } as section;
        let result: section[] = [defaultSection];
        this.sectionsPanels.push(true);

        /** find feature type */
        let ft: FeatureType | undefined = undefined;
        if (
            layer.featureTypes &&
            Object.keys(layer.featureTypes).length === 1
        ) {
            ft = layer.featureTypes[Object.keys(layer.featureTypes)[0]];
        }

        /** lookup all properties */
        for (const key in this.feature.properties) {
            if (key[0] !== '_' && this.feature.properties.hasOwnProperty(key)) {
                let pt: PropertyType | string = key;
                /** find property type */
                if (ft && ft.properties && ft.properties.hasOwnProperty(key)) {
                    pt = ft.properties[key];
                }
                if (typeof pt === 'string') {
                    pt = {
                        title: pt,
                        type: 'string',
                        description: pt
                    } as PropertyType;
                }

                const element = this.feature.properties[key];
                defaultSection.properties!.push({
                    key: key,
                    value: element,
                    type: pt
                });
            }
        }

        return result;
    }

    public get properties(): any[] {
        let result: any[] = [];
        if (this.feature) {
            for (const key in this.feature.properties) {
                if (this.feature.properties.hasOwnProperty(key)) {
                    const element = this.feature.properties[key];
                    result.push(element);
                }
            }
        } else {
        }
        return result;
    }

    public centerFeature() {
        if (this.feature && this.manager) {
            this.manager.zoomFeature(this.feature, 14);
        }
    }
}