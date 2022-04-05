import { generateHash } from '@csnext/cs-core';
import { FeatureType, GraphDatasource, LinkInfo } from '../..';
import { StringUtils } from '../../utils/string-utils';

export class BaseElementProperties {
  [key: string]: any;
  name?: string;
  description?: string;
  tags?: string[];
  created_time?: number;    
  updated_time?: number;
  approved_time?: number;
  suggested_time?: number;
  is_placeholder?: boolean;
  hash_?: number;
}

export interface IGraphElementAction {
  action: 'update' | 'delete';
  elements: GraphElement[];
}

export class RelationInfo {
  public toId?: string;
  public classId?: string;
  public label?: string;
}

export class GraphElement<T = BaseElementProperties> {
  public id?: string;  
  public type?: 'node' | 'edge' = 'node';
  public classId?: string;
  public class?: GraphElement;
  public toId?: string;
  public group?: string;
  public to?: GraphElement;
  public fromId?: string;
  public shape?: string;
  public from?: GraphElement;
  public aliases?: string;
  public sources?: GraphElement[];
  public alternatives?: string;
  public kb_source?: string;
  public kb_time?: number;
  public backgroundColor?: string;
  public properties?: T;
  public relations?: RelationInfo[];
  public timeseries?: Record<string, number[][]>;

  public _flat?: {
    [key: string]: any;
  } = {};

  public _alternatives?: string[] = [];
  public _source?: GraphElement;
  public _graphSource?: GraphDatasource;
  public _originals?: GraphElement[];
  public _startDate?: Date;
  public _endDate?: Date;
  public _hidden?: boolean = false;

  public _visible?: boolean = false;
  public _collapsed?: boolean = false;
  public _firstStep?: string;
  public _instances?: LinkInfo[];
  public _search?: string;
  public _group?: string;
  public _isEditting?: boolean;
  public _isLinked?: GraphElement;
  public _featureType?: FeatureType;
  public _derivatives?: GraphElement[];
  public _incomming?: GraphElement[];
  public _outgoing?: GraphElement[];
  public _temporary?: any;
  public _elements?: { [key: string]: GraphElement | GraphElement[] };

  public static outOfRange(e: GraphElement, date: Date) {
    if (e._startDate) {
      if (e._startDate >= date) {
        return true;
      }      
      if (e._endDate && e._endDate <= date) return true;
    }
    return false;
  }

  public static getGroup(e: GraphElement): string | undefined {
    if (e.group !== undefined) {
      return e.group;
    } else if (e.class !== undefined) {
      return GraphElement.getGroup(e.class);
    } else {
      if (e.type === 'edge' && e.from) {
        return GraphElement.getGroup(e.from);
      } else {
        return undefined;
      }
    }
  }

  

  public static updateOriginals(e: GraphElement) {
    if (e._outgoing) {
      e._originals = e
        ._outgoing!.filter((r) => r && r.to && r.classId === 'HAS_ORIGINAL')
        .map((r) => r.to!);
    }
  }

  public static getBackgroundColor(
    e: GraphElement,
    activated?: boolean
  ): string {
    if (e.backgroundColor !== undefined) {
      if (activated !== null) {
        if (!activated) {
          return e.backgroundColor;
        }
      }
      return e.backgroundColor;
    } else if (e._featureType?.color) {
      e.backgroundColor = e._featureType.color;
      return e.backgroundColor;
    } else if (e.class !== undefined) {
      return GraphElement.getBackgroundColor(e.class, activated);
    } else {
      if (e.type === 'edge' && e.from) {
        return GraphElement.getBackgroundColor(e.from, activated);
      } else {
        return 'blue';
      }
    }
  }

  public static getHash(e: GraphElement): number {
    return generateHash(`${e.id}-${e.properties?.updated_time}-${e.properties?.updated_time}`);
  }

  public static getFlat(e: GraphElement): GraphElement {
    const result = JSON.parse(
      JSON.stringify(e, (key, value: any) => {
        if (key.startsWith('_')) {
          return undefined;
        }
        return value;
      })
    ) as GraphElement;
    if (result.to) { delete result.to; }
    if (result.from) { delete result.from; }
    return result;
  }

  public static getClassTitle(e: GraphElement) : string {
    if (e._featureType?.title){
      return e._featureType.title;
    }
    if (e.classId) {
      return StringUtils.SentenceCase(e.classId.replaceAll('_', ' '))
    }
    return '(unknown)';    
  }

  public static getTimeVisibility(e: GraphElement, date: Date): boolean {
    return !GraphElement.outOfRange(e, date);
  }
}
