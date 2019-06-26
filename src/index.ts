import Vue, { PropOptions } from "vue";
import { Prop } from "vue/types/options";

export type AnyFunc = (...args: any[]) => any;

export type Validator<T> = (value: T) => boolean;

export interface Finisher<T> {
  readonly required: PropOptions<T> & { required: true };
  readonly optional: PropOptions<T | undefined>;
  default(value: T extends object ? () => T : T): PropOptions<T>;
}

export interface Builder<T> extends Finisher<T> {
  validator(validator: Validator<T>): Finisher<T>;
}

export interface ChainableBuilder<T> extends Builder<T> {
  readonly or: BuilderCollection<T>;
}

export type GeneralBuilder<BaseType> = <
  T1,
  T2 = never,
  T3 = never,
  T4 = never,
  T5 = never
>(
  p1: Prop<T1>,
  p2?: Prop<T2>,
  p3?: Prop<T3>,
  p4?: Prop<T4>,
  p5?: Prop<T5>
) => ChainableBuilder<BaseType | T1 | T2 | T3 | T4 | T5>;

export interface NamedBuilders<BaseType> {
  ofFunction<T extends AnyFunc>(): ChainableBuilder<BaseType | T>;
  ofFunction<A, R>(): ChainableBuilder<BaseType | ((arg: A) => R)>;
  ofArray<T>(): ChainableBuilder<BaseType | T[]>;
  ofRoArray<T>(): ChainableBuilder<BaseType | ReadonlyArray<T>>;
  ofObject<T extends object>(): ChainableBuilder<BaseType | T>;
  ofStringLiterals<T extends string>(...values: T[]): Finisher<T>;
  ofAny(): Builder<any>;
  ofType<T>(): Builder<T>;
}

export type BuilderCollection<BaseType> = GeneralBuilder<BaseType> &
  NamedBuilders<BaseType>;

class BuilderClass<T> implements ChainableBuilder<T> {
  constructor(private opts: PropOptions<T>) {}
  default(value: any) {
    return {
      ...this.opts,
      required: false,
      default: value
    };
  }
  get required() {
    return {
      ...this.opts,
      required: true as true
    };
  }
  get optional() {
    return {
      ...this.opts,
      required: false
    };
  }
  validator(validator: Validator<T>) {
    return new BuilderClass({
      ...this.opts,
      validator
    });
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

function createBuilderCollection<BaseType>(
  baseTypes: Array<Prop<BaseType>>
): BuilderCollection<BaseType> {
  const ret: GeneralBuilder<BaseType> = ((...args: Array<Prop<any>>) =>
    createBuilder(baseTypes, ...args)) as any;
  const namedBuilders: NamedBuilders<BaseType> = {
    ofFunction<T extends AnyFunc>() {
      return createBuilder(baseTypes, Function as any) as ChainableBuilder<
        BaseType | T
      >;
    },
    ofArray<T>() {
      return createBuilder(baseTypes, Array) as ChainableBuilder<
        BaseType | T[]
      >;
    },
    ofRoArray<T>() {
      return createBuilder(baseTypes, Array) as ChainableBuilder<
        BaseType | ReadonlyArray<T>
      >;
    },
    ofObject<T extends object>() {
      return createBuilder(baseTypes, Object);
    },
    ofStringLiterals<T extends string>(...values: T[]): Finisher<T> {
      return new BuilderClass<T>({
        type: String as any,
        validator: (v: string) => values.indexOf(v as T) >= 0
      });
    },
    ofAny() {
      return new BuilderClass<any>({}) as Builder<any>;
    },
    ofType<T>() {
      return new BuilderClass<T>({}) as Builder<T>;
    }
  };
  /* tslint:disable-next-line: prefer-object-spread */
  return Object.assign(ret, namedBuilders);
}

const rootBuilders = createBuilderCollection<never>([]);
export default rootBuilders;
