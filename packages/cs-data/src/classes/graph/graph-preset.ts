import { GraphDatasource, GraphElement } from '../../';
import { FeatureType } from '../types/feature-type';

export interface IGraphNodeDefinition {
  x?: number;
  y?: number;
}

export class IGraphFilter {
  public static GRAPH_FILTER = 'graph-filter';
  public static VISIBLE_NODES_CHANGED = 'visible-nodes-changed';
  public static RULES_CHANGED = 'rules-changed';

  public id?: string;
  public title?: string;
  public type?: 'crossfilter' | 'listfilter';
  public layers?: string[];
  public _visibleNodes: GraphElement[] = [];
  public syncMode?: 'normal' | 'follow' = 'normal';
  public nodes?: { [id: string] : IGraphNodeDefinition};
  public geoFilter?: Number[][];
  constructor(public source: GraphDatasource) {}
}

export class NodeRule {
  public title?: string;
  public type?: string;
  public id?: string;
  public disabled?: boolean;
  public _featureType?: FeatureType;
  public traversal?: boolean;
  public filter?: any = {};
}
export class GraphPreset extends IGraphFilter {
  public title?: string;
  public showDataModel? = false;
  public showInstance? = true;
  public showReliability? = false;
  public filterTimeline? = false;
  public filterStep? = false;
  public showExternal? = false;
  public focusDate?: Date;
  public autoFocus? = true;
  public showAllOnMap? = true;
  public nodeSize?: number;
  public radius?: number;
  public hideNodeLabel?: boolean = false;
  public hideEdgeLabel?: boolean = false;
  public layout?: string = 'circular';
  public showAllOnTimeline? = false;
  public nodeStrenth?: number;
  public linkDistance?: number;
  public nodeSpacing?: number;
  public labelMaxLength?: number;
  public animate?: boolean;
  public gravity?: number;
  public speed?: number;
  public edgeStrength?: number;
  public nodeStrength?: number;
  public maxIteration?: number = 500;
  public rankdir?: string;
  public align?: string;
  public clustering?: boolean;
  public globalFontSize?: number = 12;
  public clusterGravity?: number;
  public unitRadius?: number;
  public kr?: number;
  public kg?: number;
  public collideStrength?: number;
  public alpha?: number;
  public nodeRules?: NodeRule[] = [];

  public static export(preset: GraphPreset): string {
    return JSON.stringify(
      { ...preset, ...{ nodes: preset._visibleNodes.map((n) => n.id) } },
      (k, v) => {
        if (k.startsWith('_')) return undefined;
        if (k === 'source') return undefined;
        return v;
      }
    );
  }

  public static import(config: string, source: GraphDatasource): GraphPreset {
    let res = JSON.parse(config) as GraphPreset;
    if (res.nodes) {
      res._visibleNodes = [];
      for (const nid of Object.keys(res.nodes)) {
        const element = source.getElement(nid);
        if (element) {
          res._visibleNodes.push(element);
        }
      }
    }

    return res;
  }
}
