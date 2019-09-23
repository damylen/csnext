import Vue from 'vue';
import {
    IFormFieldOptions, IFormObject
} from '@csnext/cs-core';
import '@csnext/cs-client';
import Component from 'vue-class-component';
import './cs-form-field.css';
import { CsForm } from '../..';

import "../v-datetime-picker/v-datetime-picker";
import { Emit } from 'vue-property-decorator';

@Component({
    name: 'cs-formfield',
    template: require('./cs-form-field.html'),
    components: { CsForm },
    props: {
        field: undefined,
        target: undefined        
    } as any
})
export class CsFormField extends Vue {
    /** access the original widget from configuration */

    public target?: object;
    public field?: IFormFieldOptions;
    
    @Emit()
    changed(field: IFormFieldOptions) {

    }

    @Emit()
    triggered(field: IFormFieldOptions) {

    }

    public triggerClick(field: IFormFieldOptions) {
        if (field.triggerCallback && this.target) {
            field.triggerCallback(this.target, field);
        }   
        this.triggered(field);
    }


    private rules: {[key: string]: Function} = {
        required: val => !!val || this.$cs.Translate('FIELD_REQUIRED'),
        valueMin: val => {
            if (!this.field || !this.field.min) return true;
            if (typeof +val === 'number' && +val >= this.field.min) return true;
            return this.$cs.Translate(`Value should be >= ${this.field.min}`);
        },
        valueMax: val => {
            if (!this.field || !this.field.max) return true;
            if (typeof +val === 'number' && +val <= this.field.max) return true;
            return this.$cs.Translate(`Value should be <= ${this.field.max}`);
        },
    };

    public deleteKeyFromObject(key: string, field: IFormFieldOptions) {
        if (
            key !== undefined &&
            field !== undefined &&
            this.target !== undefined &&
            field._key &&
            this.target.hasOwnProperty(field._key)
        ) {
            if (this.target[field._key].hasOwnProperty(key)) {
                delete this.target[field._key][key];
                this.$forceUpdate();
            }
        }
    }

    public fieldUpdated(field: IFormFieldOptions) {
        this.changed(field);
    }

    public fieldOptions(field: IFormFieldOptions) {
        if (typeof field.options === 'function') {
            return field.options();
        } else {
            return field.options;
        }
    }

    public updateKey(key: string, field: IFormFieldOptions) {
        console.log('Update key');
        if (
            key !== undefined &&
            field !== undefined &&
            this.target !== undefined &&
            field._key &&
            this.target.hasOwnProperty(field._key)
        ) {
            if (this.target[field._key].hasOwnProperty(key)) {
                // delete this.target[field._key][key];
                this.$forceUpdate();
            }
        }
    }

    public addKeyObject(field: IFormFieldOptions) {
        if (
            !this.target ||
            !field._key ||
            !field.keyValuesType           
        ) {
            return;
        }
        // check if field already exists, if not create one       
        if (this.target[field._key] === undefined) {
            this.target[field._key] = {};
        }

        this.target[field._key]['new'] = field.keyValuesType();
        if (field.addUsingDialog) {
            // let form = new CsForm();
            // this.$cs.TriggerDialog({
            //     component: CsForm,
            //     data: this.target[field._key]['new'],
            //     toolbar: true,
            //     title: field.title
            // } as IDialog);
        }
        this.$forceUpdate();
    }

    keyObjectChange(field: IFormFieldOptions, oldValue: string, newValue: string) {
        let renameProp = (
            oldProp,
            newProp,
        { [oldProp]: old, ...others }
        ) => ({
            [newProp]: old,
            ...others
        });

        if (
            !this.target ||
            !field._key ||
            !field.keyValuesType ||
            !this.target.hasOwnProperty(field._key)
        ) {
            return;
        }

        this.target[field._key] = renameProp(oldValue, newValue, this.target[field._key]);

        console.log('Key event');
        console.log(oldValue + ' -> ' + newValue);
    }

    mounted() {
        if (this.field && this.field.type === 'form') {
        }
    }
}

Vue.component('cs-formfield', CsFormField);

