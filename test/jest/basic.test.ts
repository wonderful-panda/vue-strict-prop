import Vue, { VNode } from "vue";
import p from "../..";

describe("vue-strict-props / basic test", () => {
    it("str", () => {
        expect(p.str.required).toEqual({ type: String, required: true });
        expect(p.str.optional).toEqual({ type: String, required: false });
        expect(p.str.default("a")).toEqual({
            type: String,
            required: false,
            default: "a"
        });
        expect(p.str.default("a")).toEqual({
            type: String,
            required: false,
            default: "a"
        });
    });

    it("str with validator", () => {
        const validator = (val: string) => val.startsWith("a");
        expect(p.str.validator(validator).required).toEqual({
            type: String,
            validator,
            required: true
        });
        expect(p.str.validator(validator).optional).toEqual({
            type: String,
            validator,
            required: false
        });
        expect(p.str.validator(validator).default("a")).toEqual({
            type: String,
            validator,
            required: false,
            default: "a"
        });
    });

    it("num", () => {
        expect(p.num.required).toEqual({ type: Number, required: true });
        expect(p.num.optional).toEqual({ type: Number, required: false });
        expect(p.num.default(1)).toEqual({
            type: Number,
            required: false,
            default: 1
        });
    });

    it("bool", () => {
        expect(p.bool.required).toEqual({ type: Boolean, required: true });
        expect(p.bool.optional).toEqual({ type: Boolean, required: false });
        expect(p.bool.default(false)).toEqual({
            type: Boolean,
            required: false,
            default: false
        });
    });

    it("symbol", () => {
        expect(p.sym.required).toEqual({ type: Symbol, required: true });
        expect(p.sym.optional).toEqual({ type: Symbol, required: false });
        const defaultValue = Symbol("foo");
        expect(p.sym.default(defaultValue)).toEqual({
            type: Symbol,
            required: false,
            default: defaultValue
        });
    });

    it("array", () => {
        expect(p.array<string>().required).toEqual({
            type: Array,
            required: true
        });
        expect(p.array<string>().optional).toEqual({
            type: Array,
            required: false
        });
        expect(p.array<string>().default(() => [])).toMatchObject({
            type: Array,
            required: false,
            default: expect.any(Function)
        });
    });

    it("readonly array", () => {
        expect(p.readonlyArray<string>().required).toEqual({
            type: Array,
            required: true
        });
        expect(p.readonlyArray<string>().optional).toEqual({
            type: Array,
            required: false
        });
        expect(p.readonlyArray<string>().default(() => Object.freeze(["foo"]))).toMatchObject({
            type: Array,
            required: false,
            default: expect.any(Function)
        });
    });

    it("func", () => {
        const nop = () => {};
        const defFunc = () => nop;
        expect(p.func<() => void>().required).toEqual({
            type: Function,
            required: true
        });
        expect(p.func<() => void>().optional).toEqual({
            type: Function,
            required: false
        });
        expect(p.func<() => void>().default(defFunc)).toEqual({
            type: Function,
            required: false,
            default: defFunc
        });
    });

    it("instanceOf", () => {
        expect(p.instanceOf(String, Number).required).toEqual({
            type: [String, Number],
            required: true
        });
        expect(p.instanceOf(String, Number).optional).toEqual({
            type: [String, Number],
            required: false
        });
        expect(p.instanceOf(String, Number).default(1)).toEqual({
            type: [String, Number],
            required: false,
            default: 1
        });

        class Test {
            foo: string;
            bar: number;
        }
        expect(p.instanceOf(Test).optional).toEqual({
            type: Test,
            required: false
        });
    });

    it("or", () => {
        expect(p.str.or.num.required).toEqual({
            type: [String, Number],
            required: true
        });
        expect(p.str.or.num.default("foo")).toEqual({
            type: [String, Number],
            required: false,
            default: "foo"
        });
        expect(p.str.or.instanceOf(Boolean, Symbol).required).toEqual({
            type: [String, Boolean, Symbol],
            required: true
        });
    });

    it("stringLiteral", () => {
        const propOptions = p.stringLiteral("foo", "bar").default("foo");
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

    it("any", () => {
        expect(p.anything.required).toEqual({ required: true });
        expect(p.anything.optional).toEqual({ required: false });
        expect(p.anything.default(1)).toEqual({ required: false, default: 1 });
    });
});
