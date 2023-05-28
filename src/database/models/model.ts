export abstract class Model {
    static deleteAll: () => Promise<number>;
    static create: (item: any) => Promise<Model | undefined>;
    public static getOne: (columns: Record<string, any>) => Promise<any>;
}

interface IIndexable {
    [key: string]: any;
  }
export abstract class FinovoModel<T extends object>  implements ProxyHandler<FinovoModel<T>> {
    public fields: T;
    [index: string]: any;
    constructor(_fields: T) {
        this.fields = _fields;
        return new Proxy(this, this)
    }

    public merge(fill: Partial<T>) {
        for (let key in fill) {
            if(fill[key]) (this.fields as any)[key] = fill[key];
        }
    }

 

    public abstract save(): Promise<T>;

    get (target: FinovoModel<T>, prop: string) {
        
        console.log(target)
       if(this.fields[prop]) {
        return this.fields[prop];
       }
       return this[prop] || null;
    }

    set(target: FinovoModel<T>, p: string | symbol, newValue: any, receiver: any) {
        if(p === 'fields') {
            return false;
        }
        this.fields[p] = newValue;
        return true;
    };

    toString() {
        return this.fields.toString()


    }

    toJSON() {
        return this.fields;
    }


    static deleteAll: () => Promise<number>;
    static create: (item: any) => Promise<Model | null>;
    public static getOne: (columns: Record<string, any>) => Promise<FinovoModel<any> | null>;
    public static find: (columns: Record<string, any>, match: boolean) => Promise<FinovoModel<any>[]>;
    public static table: () => string;

}