export abstract class Model {
    static deleteAll: () => Promise<number>;
    static create: (item: any) => Promise<Model | undefined>;
    public static getOne: (columns: Record<string, any>) => Promise<any>;
}
