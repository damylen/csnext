import { TimeDataSource, MessageBusManager, Topics } from '@csnext/cs-core';
import { DataSource, FeatureTypes, GraphElement, GraphSettings, PropertyType, PropertyValueType } from '../';
// import { DiagramAction, GraphAction, DiagramElement, ObservationTypes } from "./../classes/";

// import { AppState } from '@csnext/cs-client';
import throttle from 'lodash.throttle';


export type GraphObject = {[key: string]: GraphElement};
export class GraphFilter {
    public hasIncomingTypeRelation?: any;
    public hasObjectTypeRelation?: any;
    public hasObjectRelation?: any;
}
export class GraphDatasource extends DataSource {

    public static GRAPH_EVENTS = 'graph-events';
    public static GRAPH_UPDATED = 'graph-updated';
    public static GRAPH_LOADED = 'graph-loaded';
    public static ELEMENT_UPDATED = 'element-updated';

    public activeId = '';
    public graph: GraphObject = {};
    // public diagram: DiagramElement[] = [];
    public activeElement?: GraphElement;
    public graphSettings: GraphSettings = new GraphSettings();
    public timesource?: TimeDataSource;
    public busManager = new MessageBusManager();        
    // public featureTypes: FeatureTypes = {};
    // public observationTypes: ObservationTypes = {};
    private _nodeTypes?: GraphElement[];
    private _edgeTypes?: {[key:string]: PropertyType};
    private _availableColors: string[] = [];
    
    public get observationTypes() : FeatureTypes | undefined {
        return this.featureTypes;
    }

    public get featureTypes() : FeatureTypes | undefined {
        return this._meta;
    }

    public set featureTypes(value: FeatureTypes | undefined) {
        this._meta = value;
    }

    constructor() {
        super();        
    }

    public getColor() : string {
        if (this._availableColors.length===0) {
            this._availableColors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];            
        }
        const color = this._availableColors.pop();
        if (color) {
            return color;
        } else {
            return 'lightgray';
        }
    }

    public nodeTypes: GraphElement[] = [
    ];

    public loadData() {
        
    }

    public get availableEdgeTypes(): {[key:string]: PropertyType} {
        if (!this.featureTypes) { return {} }
        if (this._edgeTypes !== undefined) { return this._edgeTypes; }
        let res: {[key:string]: PropertyType} = {};
        for (const type of Object.values(this.featureTypes)) {
            if (type.properties) {
                for (const prop of type.properties?.filter(t => (t.type === PropertyValueType.relation && t.relation?.type))) {
                    if (!res.hasOwnProperty(prop.relation?.type!)) {
                        res[prop.relation!.type!] = { ...prop}; //, ...{_visible: false}};
                        res[prop.relation!.type!]._visible = true;

                    }
                }
        }
           
            
        }
        // if (this.graph) {          
        //   for (const key in this.graph) {
        //     if (this.graph.hasOwnProperty(key)) {
        //       const el = this.graph[key];         
        //     //   el._hidden = this.getHidden(el);
        //       if (
        //         el.isType &&
        //         el.properties?.classId && 
        //         el.type === "edge" &&
        //         !res.hasOwnProperty(el.properties.classId)
        //       ) {
        //         el._visible = true;
        //         res[el.properties.classId] = el;
        //       }
        //     }
        //   }
        // }
        this._edgeTypes = res;
        return res;
      }

    public get availableNodeTypes(): GraphElement[] {            
        if (this._nodeTypes !== undefined) { return this._nodeTypes; }
        let res: GraphElement[] = [];
        if (this.graph) {
          for (const key of Object.keys(this.graph)) {
              const el = this.graph[key];
              el._hidden = this.getHidden(el);
              el._visible = true;
            if (el.isType && el.type === "node" && (res.findIndex(e => e.id === el.id) === -1)) {
              res.push(el);
            }
          }
        }
        this._nodeTypes = res;
        return res;
      }

      public getHidden(e: GraphElement, filters?: GraphSettings): boolean {        
        if (!filters || !e.classId) { return false; }        
        if (e.class) {
            if (!e.class._visible) { e.class._visible = true; }
            return !e.class._visible;
        } else return false;        
    }

    public getElement(id: string): GraphElement | undefined {
        if (this.graph.hasOwnProperty(id)) { return this.graph[id]; }
        return;        
    }

    public getClassElements(classId: string, traversal?: boolean, filter?: GraphFilter) : GraphElement[] | undefined {
        let res : GraphElement[] = [];
        if (traversal) {            
            res = Object.values(this.graph).filter(c => c._featureType?._inheritedTypes?.includes(classId));
        } else {
            res = Object.values(this.graph).filter(c => c.classId === classId);
        }
        if (filter) {            
            if (filter.hasObjectTypeRelation) {                                
                res = res.filter(o => o._outgoing && o._outgoing?.find(r => {                    
                    for (const field in filter.hasObjectTypeRelation) {
                        if (Object.prototype.hasOwnProperty.call(filter.hasObjectTypeRelation, field)) {
                            const value = filter.hasObjectTypeRelation[field];
                            if (r.classId === field && r.to?.id === value) {
                                return true;
                            }
                        }                        
                    }
                    return false;                    
                }));
            } else if (filter.hasIncomingTypeRelation) {
                res = res.filter(o => o._incomming && o._incomming?.find(r => {                    
                    for (const field in filter.hasIncomingTypeRelation) {
                        if (Object.prototype.hasOwnProperty.call(filter.hasIncomingTypeRelation, field)) {
                            const value = filter.hasIncomingTypeRelation[field];
                            const v = (typeof value === 'function') ? value() : value;                            
                            if (r.classId === field && r.from?.id === v) {
                                return true;
                            }
                        }                        
                    }
                    return false;                    
                }));
            }
             else if (filter.hasObjectRelation) {
                res = res.filter(o => o._outgoing && o._outgoing?.find(r => {                    
                            if (r.to?.id === filter.hasObjectRelation) {
                                return true;
                            }
                    
                    return false;                    
                }));
            }
        }
        return res;
        
    }

    

    public addNode(element: GraphElement, classId?: string) {

        let res = this;

        if (!element.id) { element.id = element._title; }
        if (!element._title && element.properties?.name) { element._title = element.properties.name; }
        if (!element._title && element.id) { element._title = element.id; }
        element.type = 'node';        
        if (classId) { element.classId = classId; }        
        
        // if (element.classId) {
        //     res = res.addElement(element,stepId).addEdge({ fromId: element.id, toId: element.classId, _firstStep: stepId, classId: 'is', properties: { verified: true} }, stepId) as any;
        // } else {
        //     res = res.addElement(element, stepId);
        // }        

        if (!element._featureType && element.classId && this.featureTypes && this.featureTypes.hasOwnProperty(element.classId)) {
            element._featureType = this.featureTypes[element.classId];
        }

        res = res.addElement(element);        
        return this;
    }

    public createEdge(element: GraphElement, classId?: string) : GraphElement {
        
        element.type = 'edge';

        if (!element.properties) {
            element.properties = {};            
        }

        if (!element.properties.hasOwnProperty('verified')) {
            element.properties.verified = true;
        }

        if (!element.id) {
            element.id = 'edge-' + element.fromId + '-' + element.toId + '-' + element.classId + '-' + element._title;
        }

        element.properties.id = element.id;

        if (element.classId === undefined) {
            element.classId = classId;
        }

        // if (element.toId && !element.to) {
        //     element.to = this.getElement(element.toId);
        // }

        if (element.to && !element.to._incomming) {
            element.to._incomming = [];
        }

        if (element.to?._incomming && !element.to._incomming.includes(element)) {
            element.to._incomming.push(element);
        }
        

        // if (element.fromId && !element.from) {
        //     element.from = this.getElement(element.fromId);
        // }

        if (element.from && !element.from._outgoing) {
            element.from._outgoing = [];
        }

        if (element.from?._outgoing && !element.from._outgoing.includes(element)) {
            element.from._outgoing.push(element);
        }
                
        return element;
        // return res;
    }

    public addEdge(element: GraphElement, classId?: string) {
        if (element.toId && element.toId.indexOf(',') !== -1) {
            let tos = element.toId.split(',');
            for (const to of tos) {
                let toId = to.trim();
                this.addEdge({ ...element, ...{ toId: toId } }, classId);
            }
            return;
        } else {
            element = this.createEdge(element,classId);            
            return this.addElement(element);
        }        
        // return res;
    }

    private stringToDate(_date: string, _format: string, _delimiter: string): Date {
        var formatLowerCase = _format.toLowerCase();
        var formatItems = formatLowerCase.split(_delimiter);
        var dateItems = _date.split(_delimiter);
        var monthIndex = formatItems.indexOf("mm");
        var dayIndex = formatItems.indexOf("dd");
        var yearIndex = formatItems.indexOf("yyyy");
        var month = parseInt(dateItems[monthIndex]);
        month -= 1;
        var formatedDate = new Date(dateItems[yearIndex] as any, month, dateItems[dayIndex] as any);
        return formatedDate;
    }

     public updateStartEnd(element: GraphElement, force = false) {
        if ((!element._startDate || force) && element.properties?.hasOwnProperty('start'))  {
            if (typeof element.properties.start === 'string') {
                element._startDate = this.stringToDate(element.properties!.start, 'dd-mm-yyyy', '-');
            }
            if (typeof element.properties.start === 'number') {
                element._startDate = new Date(element.properties.start);
            }

        }

        if ((!element._endDate || force) && element.properties?.hasOwnProperty('end')) {
            if (typeof element.properties.end === 'string') {
                element._endDate = this.stringToDate(element.properties!.end, 'dd-mm-yyyy', '-');
            }
            if (typeof element.properties.end === 'number') {
                element._endDate = new Date(element.properties.end);
            }
        }
    }

    
    public addElement(element: GraphElement) {
        element = { ...new GraphElement(), ...element };        
        // if (source && !element.properties!.hasOwnProperty('source')) {
        //     element.properties!.source = source;
        // }
        
        this.updateStartEnd(element);
        if (element.isType && !element.backgroundColor) {
            element.backgroundColor = this.getColor();
        }

        if (element.id) {
            this.graph[element.id] = element;
        }

        return this;
    }

    public reset() {
        if (this.graph) {
            for (const el of Object.values(this.graph)) {
                el._derivatives = [];
            }
        }

        this.graph = {};
    }
  

    public triggerUpdateGraph(element?: GraphElement) {
        this.bus.publish(GraphDatasource.GRAPH_EVENTS, GraphDatasource.GRAPH_UPDATED, element);            
    }


    private debounceUpdateTimeGraph = throttle(() => {
        this.updateTimeGraph();
    }, 500, { leading: false, trailing: true });

    private updateTimeGraph() {
        // if (this.diagram.o)
        this.triggerUpdateGraph();
    }

    public initTimeDatasource() {
        if (!this.timesource) { return; }
        this.busManager.subscribe(this.timesource.events, Topics.TIME_TOPIC, (a, e) => {

            switch (a) {
                case Topics.TIMELINE_MOVING:
                    this.graphSettings.focusDate = e;                    
                    this.debounceUpdateTimeGraph(); break;
                case Topics.TIMELINE_MOVED:
                    this.graphSettings.focusDate = e;                    
                    this.updateTimeGraph();
                    break;
            }

        });
    }

    public updateEdges(clean = false) {

        for (const e of Object.values(this.graph)) {
            if (e.type === 'edge')
                if (e.classId && !e.class) {
                    let c = this.getElement(e.classId);                    
                    if (!c) {
                        this.addEdge({id: e.classId, properties: { name: e.classId}, isType: true, _visible: false})
                    }
                    e.class = c;                    
                }

            if (e.toId && !e.to) {
                e.to = this.getElement(e.toId);
                if (e.to && !e.isType && e.classId !== 'is' && e.classId !== 'source' && e.classId !== 'hasSource') {
                    if (!e.to._incomming) {
                        e.to._incomming = [e];
                    } else {
                        // if (e.to._incomming.findIndex(o => o.id === e.id) === -1) {
                        e.to._incomming.push(e);
                        // }
                    }

                }
                // if (!e.to) {
                //   let external = new GraphElement();
                //   external.id = e.toId;
                //   external.title = e.toId;
                //   external.classId = 'source';
                //   e.to = external;
                //   this.tutorialSource.graph.push(external);
                // }
            }

            if (e.fromId && !e.from) {
                e.from = this.getElement(e.fromId);
                if (e.from && !e.isType && e.classId !== 'is' && e.classId !== 'source' && e.classId !== 'hasSource') {
                    if (!e.from._outgoing) {
                        e.from._outgoing = [e];
                    } else {
                        // if (e.from._outgoing.findIndex(o => o.id === e.id) === -1) {
                        e.from._outgoing.push(e);
                        // }
                    }
                }
            }

            let w = 3;
            //   if (this.settings.showReliability) {
            //     w = 15;
            //     if (e.properties && e.properties.hasOwnProperty("reliability")) {
            //       w = parseFloat(e.properties["reliability"]) * 10;
            //     }
            //   }

            if (!e._title || clean) {
                e._title = GraphElement.getTitle(e, true);
            }
            if (!e._search  || clean) {
                e._search = e._title;
                if (e.class && e.class._title) {
                    e._search += e.class._title;
                }
            }
        }
    }

    public emptyGraph(trigger = true) {
        for (const el of Object.values(this.graph)) {
            el._included = false;
        }
        if (trigger) {
            this.triggerUpdateGraph();
        }
    }

    public updateNode(e: GraphElement, clean = false) {
        if (e.type === 'node') {
            if (!e._title || clean) {
                e._title = GraphElement.getTitle(e, clean);
            }
            if (!e.class && e.classId) {
                let c = this.getElement(e.classId);
                if (!c) {
                    this.addNode({id: e.classId, properties: {name: e.classId}, isType: true, _visible: false})
                }
                e.class = c;                    
            }
        }
    }

    public updateNodes(clean = false) {
        for (const e of Object.values(this.graph)) {
           this.updateNode(e, clean);
        }

    }

    public execute(): Promise<GraphDatasource> {
        return new Promise((resolve) => {
            resolve(this);
        })

    }


}