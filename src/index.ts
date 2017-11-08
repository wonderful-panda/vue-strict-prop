import Vue, { PropOptions } from "vue";
import { Prop } from "vue/types/options";

export type AnyFunc = (...args: any[]) => any;

export type Validator<T> = (value: T) => boolean;

export interface Finisher<T> {
    readonly required: PropOptions<T>;
    readonly optional: PropOptions<T | undefined>;
    default(value: T | (() => T & object)): PropOptions<T>;
}

export interface Builder<T> extends Finisher<T> {
    validator(validator: Validator<T>): Finisher<T>;
}

export interface ChainableBuilder<T> extends Builder<T> {
    readonly or: BuilderCollection<T>;
}

export interface BuilderCollection<BaseType> {
    readonly str: ChainableBuilder<BaseType | string>;
    readonly num: ChainableBuilder<BaseType | number>;
    readonly bool: ChainableBuilder<BaseType | boolean>;
    readonly sym: ChainableBuilder<BaseType | symbol>;
    func<T extends AnyFunc>(): ChainableBuilder<BaseType | T>;
    array<T>(): ChainableBuilder<BaseType | T[]>;
    readonlyArray<T>(): ChainableBuilder<BaseType | ReadonlyArray<T>>;
    obj<T extends object>(): ChainableBuilder<BaseType | T>;
    instanceOf<T1, T2 = never, T3 = never, T4 = never, T5 = never>(
        p1: Prop<T1>,
        p2?: Prop<T2>,
        p3?: Prop<T3>,
        p4?: Prop<T4>,
        p5?: Prop<T5>
    ): ChainableBuilder<BaseType | T1 | T2 | T3 | T4 | T5>;
}

class BuilderClass<T> implements ChainableBuilder<T> {
    constructor(private opts: PropOptions<T>) {}
    default(value: any) {
        return { ...this.opts, required: false, default: value };
    }
    get required() {
        return { ...this.opts, required: true };
    }
    get optional() {
        return { ...this.opts, required: false };
    }
    validator(validator: Validator<T>) {
        return new BuilderClass({ ...this.opts, validator });
    }
    get or() {
        const type = this.opts.type || [];
        const types = type instanceof Array ? type : [type];
        return createBuilderCollection(types);
    }
}

function createBuilder<BaseType, T>(
    baseTypes: Array<Prop<BaseType>>,
    ...types: Array<Prop<T>>
): ChainableBuilder<BaseType | T> {
    const newTypes = [...baseTypes, ...types] as Array<Prop<BaseType | T>>;
    return new BuilderClass({
        type: newTypes.length === 1 ? newTypes[0] : newTypes
    });
}

function createBuilderCollection<BaseType>(baseTypes: Array<Prop<BaseType>>): BuilderCollection<BaseType> {
    return {
        str: createBuilder(baseTypes, String),
        num: createBuilder(baseTypes, Number),
        bool: createBuilder(baseTypes, Boolean),
        sym: createBuilder(baseTypes, Symbol),
        func<T extends AnyFunc>() {
            return createBuilder(baseTypes, Function as any) as ChainableBuilder<BaseType | T>;
        },
        array<T>() {
            return createBuilder(baseTypes, Array);
        },
        readonlyArray<T>() {
            return createBuilder(baseTypes, Array);
        },
        obj<T extends object>() {
            return createBuilder(baseTypes, Object);
        },
        instanceOf(...args: Array<Prop<any>>) {
            return createBuilder(baseTypes, ...args);
        }
    };
}

const rootBuilders = createBuilderCollection<never>([]);
export default {
    ...rootBuilders,
    stringLiteral<T extends string>(...values: T[]): Finisher<T> {
        return new BuilderClass<T>({
            type: String as any,
            validator: (v: string) => values.indexOf(v as T) >= 0
        });
    },
    anything: new BuilderClass<any>({}) as Builder<any>
};
