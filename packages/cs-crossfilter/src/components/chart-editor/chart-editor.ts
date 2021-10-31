import Component from 'vue-class-component';
import { WidgetBase } from '@csnext/cs-client';
import './chart-editor.css';
import { IFormObject, IWidget } from '@csnext/cs-core';
import { ChartOptions, CrossFilterDatasource, CrossDashboardManager } from '../..';
import { GeojsonPlusLayer } from '@csnext/cs-map';

@Component({
  name: 'actions',
  template: require('./chart-editor.html'),
} as any)
export class ChartEditor extends WidgetBase {
      
  public valid?: boolean;
  public resizing = false;

  static hasYAxis = [ (v: any) => { return v.type && ['scatter', 'heatmap'].includes(v.type)}];
  static hasXAxis = [ (v: any) => { return v.type && ['scatter', 'heatmap'].includes(v.type)}];
  static hasKey = [ (v: any) => { return v.type && ['rowchart', 'histogram', 'stat', 'time'].includes(v.type)}];
  static isRowChart = [ (v: any) => { return v.type && v.type === 'rowchart'}];
  static isHistogram = [ (v: any) => { return v.type && v.type === 'histogram'}];
  static isLine = [ (v: any) => { return v.type === 'time'}];
  static isStat = [ (v: any) => { return v.type && v.type === 'stat'}];
  static isTime = [ (v: any) => { return v.type && v.type === 'time'}];

  public get source(): CrossFilterDatasource | undefined {
    if (this.widget?.content) {
      return this.widget.content as CrossFilterDatasource;
    }
  }

  public get keys() : any[] {
    
    // if (this.options?._source.featureType?.properties) {
    //   return this.options._source.featureType.properties;
    // }
    // if (this.options && this.options?.layerId && !this.options._layer) {
    //   this.options._layer = this.options._source.getLayer(this.options.layerId) as GeojsonPlusLayer;
    // }
    // if (this.options?._layer?._source?._featureType?.properties) {
    //   return this.options?._layer?._source?._featureType?.properties;
    // }
    
    return [];
    
  }

  public get manager() : CrossDashboardManager | undefined
  {
    return this.widget?.data?.manager;
  }

  public get options(): ChartOptions | undefined { 
    return this.widget?.data?.chartOptions;
  }

  public get chartWidget(): IWidget | undefined { 
    return this.widget?.data?.chart;
  }

  public updateOptions() {
    if (this.chartWidget?.events) {
      this.chartWidget.events.publish(CrossFilterDatasource.CROSSFILTER, CrossFilterDatasource.UPDATE_CHART);
    }    
  }
  
  public get formDef(): IFormObject {
    return {                            
        hideTitle: true,
        isPanel: false,

        fields: [
           {
            title: 'TYPE',
            _key: 'type',
            type: 'selection',
            readonly: false,
            options: ['histogram', 'rowchart', 'scatter', 'heatmap', 'stat', 'time']             
          },
          {
            title: 'TITLE',
            _key: 'title',
            type: 'string'                ,
            requirements: ChartEditor.hasKey
          },
          {
            title: 'DISABLE_FILTER',
            _key: 'disableFilter',
            type: 'checkbox',
            requirements: ChartEditor.isHistogram
          },          
          {
            title: 'TITLE_X_AXIS',
            _key: 'titleX',
            type: 'string',                                       
            requirements: ChartEditor.hasXAxis
          },
          {
            title: 'TITLE_Y_AXIS',
            _key: 'titleY',
            type: 'string',
            requirements: ChartEditor.hasYAxis                           
          },
          {
            title: 'key',
            _key: 'key',
            type: 'combobox-objects',
            options: this.keys,
            keyText: 'label',
            keyValue: 'key',
            requirements: ChartEditor.hasKey                
          },
          {
            title: 'keyX',
            _key: 'keyX',
            type: 'combobox-objects',
            options: this.keys,
            keyText: 'label',
            keyValue: 'key',
            requirements: ChartEditor.hasXAxis
          },
          {
            title: 'keyY',
            _key: 'keyY',
            type: 'combobox-objects',
            options: this.keys,
            keyText: 'label',
            keyValue: 'key',
            requirements: ChartEditor.hasYAxis 
          },
          {
            title: 'order by name',
            _key: 'orderByName',
            type: 'checkbox',
            requirements: ChartEditor.isRowChart
          },
          {
            title: 'time aggregation',
            _key: 'timeAggregation',
            type: 'selection',
            options: ['hour', 'day', 'week', 'month', 'year'],
            requirements: ChartEditor.isTime
          },         
          {
            title: 'top',
            _key: 'top',
            type: 'number',
            requirements: ChartEditor.isRowChart 
          },
          {
            title: 'bucketSize',
            _key: 'bucketSize',
            type: 'number',
            requirements: ChartEditor.isHistogram 
          },
          {
            title: 'stat type',
            _key: 'statValue',
            type: 'options',
            requirements: ChartEditor.isStat
          },
          {
            title: 'line curve',
            _key: 'lineCurve',
            type: 'selection',
            options: ['curve', 'linear', 'step'],
            requirements: ChartEditor.isLine
          },    
          


          

        ]
    } as IFormObject;
}


  public mounted() {    
    

  
    this.busManager.subscribe(this.widget.events, 'layout', (a: string, e: any) => {            
        // this.updateChart();      
    } )
    // this.busManager.subscribe(this.datasource.events, CrossFilterDatasource.CROSSFILTER, (a: string, d: any) => {
    //   switch (a) {
    //     case CrossFilterDatasource.CROSSFILTER_DATALOADED:
    //       this.updateChart();
    //       break;
    //   }
    // });
  }
}
