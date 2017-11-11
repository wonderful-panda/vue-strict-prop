import Vue, { VNode } from "vue";
import p from "../..";

describe("vue-strict-props / basic test", () => {
    it("ofString", () => {
        expect(p(String).required).toEqual({
            type: String,
            required: true
        });
        expect(p(String).optional).toEqual({
            type: String,
            required: false
        });
        expect(p(String).default("a")).toEqual({
            type: String,
            required: false,
            default: "a"
        });
        expect(p(String).default("a")).toEqual({
            type: String,
            required: false,
            default: "a"
        });
    });

    it("ofString with validator", () => {
        const validator = (val: string) => val.startsWith("a");
        expect(p(String).validator(validator).required).toEqual({
            type: String,
            validator,
            required: true
        });
        expect(p(String).validator(validator).optional).toEqual({
            type: String,
            validator,
            required: false
        });
        expect(
            p(String)
                .validator(validator)
                .default("a")
        ).toEqual({
            type: String,
            validator,
            required: false,
            default: "a"
        });
    });

    it("ofNumber", () => {
        expect(p(Number).required).toEqual({
            type: Number,
            required: true
        });
        expect(p(Number).optional).toEqual({
            type: Number,
            required: false
        });
        expect(p(Number).default(1)).toEqual({
            type: Number,
            required: false,
            default: 1
        });
    });

    it("ofBoolean", () => {
        expect(p(Boolean).required).toEqual({
            type: Boolean,
            required: true
        });
        expect(p(Boolean).optional).toEqual({
            type: Boolean,
            required: false
        });
        expect(p(Boolean).default(false)).toEqual({
            type: Boolean,
            required: false,
            default: false
        });
    });

    it("ofSymbol", () => {
        expect(p(Symbol).required).toEqual({
            type: Symbol,
            required: true
        });
        expect(p(Symbol).optional).toEqual({
            type: Symbol,
            required: false
        });
        const defaultValue = Symbol("foo");
        expect(p(Symbol).default(defaultValue)).toEqual({
            type: Symbol,
            required: false,
            default: defaultValue
        });
    });

    it("ofArray", () => {
        expect(p.ofArray<string>().required).toEqual({
            type: Array,
            required: true
        });
        expect(p.ofArray<string>().optional).toEqual({
            type: Array,
            required: false
        });
        expect(p.ofArray<string>().default(() => [])).toMatchObject({
            type: Array,
            required: false,
            default: expect.any(Function)
        });
    });

    it("readonly array", () => {
        expect(p.ofRoArray<string>().required).toEqual({
            type: Array,
            required: true
        });
        expect(p.ofRoArray<string>().optional).toEqual({
            type: Array,
            required: false
        });
        expect(p.ofRoArray<string>().default(() => Object.freeze(["foo"]))).toMatchObject({
            type: Array,
            required: false,
            default: expect.any(Function)
        });
    });

    it("ofFunction", () => {
        const nop = () => {};
        const defFunc = () => nop;
        expect(p.ofFunction<() => void>().required).toEqual({
            type: Function,
            required: true
        });
        expect(p.ofFunction<() => void>().optional).toEqual({
            type: Function,
            required: false
        });
        expect(p.ofFunction<() => void>().default(defFunc)).toEqual({
            type: Function,
            required: false,
            default: defFunc
        });
    });

    it("multiple types", () => {
        expect(p(String, Number).required).toEqual({
            type: [String, Number],
            required: true
        });
        expect(p(String, Number).optional).toEqual({
            type: [String, Number],
            required: false
        });
        expect(p(String, Number).default(1)).toEqual({
            type: [String, Number],
            required: false,
            default: 1
        });

        class Test {
            foo: string;
            bar: number;
        }
        expect(p(Test).optional).toEqual({
            type: Test,
            required: false
        });
    });

    it("multiple types by or", () => {
        expect(p(String).or(Number).required).toEqual({
            type: [String, Number],
            required: true
        });
        expect(p(String).or(Number).optional).toEqual({
            type: [String, Number],
            required: false
        });
        expect(p(String).or(Boolean, Symbol).required).toEqual({
            type: [String, Boolean, Symbol],
            required: true
        });
    });

    it("ofStringLiterals", () => {
        const propOptions = p.ofStringLiterals("foo", "bar").default("foo");
        expect(propOptions).toMatchObject({
            type: String,
            required: false,
            default: "foo",
            validator: expect.any(Function)
        });
        // avoid error: "object is possibly 'undefined'"
        if (propOptions.validator) {
            expect(propOptions.validator("foo")).toBe(true);
            expect(propOptions.validator("bar")).toBe(true);
            expect(propOptions.validator("baz" as any)).toBe(false);
        } else {
            fail("validator is undefined");
        }
    });

    it("ofAny", () => {
        expect(p.ofAny().required).toEqual({
            required: true
        });
        expect(p.ofAny().optional).toEqual({
            required: false
        });
        expect(p.ofAny().default(1)).toEqual({
            required: false,
            default: 1
        });
    });
});
