import { FeatureType, TextEntity, TextRelation, GraphElement } from '@csnext/cs-data';
import { Schema, Node as ProseMirrorNode } from 'prosemirror-model'
import { guidGenerator } from '@csnext/cs-core';

export class GraphDocument extends GraphElement {    
    // public name?: string;
    
    public originalText?: string;
    public editedText?: string;
    public entities?: TextEntity[];
    public relations?: TextRelation[];
    public observations?: FeatureType[];
    public suggestedObservation?: FeatureType[] = [];
    public reliability?: string;
    public credibility?: string;
    public note?: string;    
    public sourceId?: string;
    public doc: any = {
        type: "doc",
        content: [    
        ],
      };
    public notes?: DocumentNote[];
    // public _node?: GraphElement;
    // public _source?: GraphElement;

    public get name() : string {
        return this.properties?.name ?? '';
    }

    // public set name(value: string)

    constructor(element?: GraphElement) {
        super();
        
        if (element) {
            Object.assign(this, element);
        }

        if (!this.properties) { this.properties = {}};
        this.properties.id = this.properties.id ?? guidGenerator();
        this.properties.created_time = this.properties.created_time ?? new Date().getTime();        
        this.properties.updated_time = this.properties.updated_time ?? new Date().getTime();        
    }

    public get _node() : GraphElement {
        return this;
    }
        

    public getNode(): GraphElement {
        return {
            id: this.id, type: 'node', title: this.name, _title: this.name, classId: 'input', properties: {
                name: this.name,
                text: this.originalText,
                reliability: this.reliability,
                credibility: this.credibility,                
                start: '01-03-2019'
            }            
        } as GraphElement;
    }
}


export class DocumentNote {
    public start?: number;
    public end?: number;
    public text?: string;
    public note?: string;
}
