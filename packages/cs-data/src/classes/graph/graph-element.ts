import { FeatureType, GraphPreset, LinkInfo } from '../..';

export class GraphElement {
  public id?: string;
  // public title?: string;
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
  public properties?: {
    [key: string]: any;
    name?: string;
    description?: string;
    tags?: string[];
    created_time?: number;    
    updated_time?: number;
    approved_time?: number;
    suggested_time?: number;
  } = {};

  public _flat?: {
    [key: string]: any;
  } = {};

  public _alternatives?: string[] = [];
  public _source?: GraphElement;
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
  public _featureType?: FeatureType;
  public _derivatives?: GraphElement[];
  public _incomming?: GraphElement[];
  public _outgoing?: GraphElement[];
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
  // public static getTitle(e: GraphElement, clean = false): string | undefined {
  //   if (e.properties && e.properties.hasOwnProperty('name')) {
  //     return e.properties.name;
  //   }
  //   if (e.properties && e.properties.hasOwnProperty('title')) {
  //     return e.properties.title;
  //   }
  //   // if (e.title !== undefined) {
  //   //     return (clean) ? e.title : e.title.toLowerCase().split('_').join(' ');
  //   // }
  //   // else
  //   if (e.class) {
  //     return GraphElement.getTitle(e.class);
  //   } else {
  //     return e.id || '';
  //   }
  // }

  public static getFlat(e: GraphElement): GraphElement {
    const result = JSON.parse(
      JSON.stringify(e, (key, value: any) => {
        if (key.startsWith('_')) {
          return undefined;
        }
        return value;
      })
    );
    return result;
  }

  public static getTimeVisibility(e: GraphElement, date: Date): boolean {
    return !GraphElement.outOfRange(e, date);
  }

  public static getVisibility(e: GraphElement, filters?: GraphPreset): boolean {
    
    if (e._visible !== undefined && e._visible === false) {
      return false;
    }
    if (e._visible === undefined) {
      return true;
    } else return e._visible;
  }
}
