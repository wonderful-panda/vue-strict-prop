/* tslint:disable:no-implicit-dependencies */
import Vue, { VNode } from "vue";
import { mount } from "vue-test-utils";
import p from "../..";

describe("vue-strict-prop / component", () => {
    const orgWarnHandler = Vue.config.warnHandler;
    const warnings = [] as string[];
    const ignore = /\$[a-z]+ is readonly\.$/; // warning from vue-test-utils
    const warnHandler = (msg: string) => {
        if (!ignore.test(msg)) {
            warnings.push(msg);
        }
    };

    beforeEach(() => {
        warnings.splice(0);
        Vue.config.warnHandler = warnHandler;
    });
    afterEach(() => {
        Vue.config.warnHandler = orgWarnHandler;
    });

    describe("str.required", () => {
        const Test = Vue.extend({
            props: {
                foo: p.str.required
            },
            render(h): VNode {
                return h("span", this.foo);
            }
        });
        it("pass value other than string", () => {
            const wrapper = mount(Test, { propsData: { foo: 0 } });
            expect(wrapper.html()).toBe("<span>0</span>");
            expect(warnings.shift()).toMatch(/expected string, got number/i);
            expect(warnings.shift()).toBeUndefined();
        });
        it("does not pass value", () => {
            const wrapper = mount(Test, { propsData: {} });
            expect(wrapper.html()).toBe("<span></span>");
            expect(warnings.shift()).toMatch(/missing required prop/i);
            expect(warnings.shift()).toBeUndefined();
        });
    });

    describe("str.optional", () => {
        const Test = Vue.extend({
            props: {
                foo: p.str.optional
            },
            render(h): VNode {
                return h("span", this.foo);
            }
        });
        it("pass value other than string", () => {
            const wrapper = mount(Test, { propsData: { foo: 0 } });
            expect(wrapper.html()).toBe("<span>0</span>");
            expect(warnings.shift()).toMatch(/expected string, got number/i);
            expect(warnings.shift()).toBeUndefined();
        });
        it("does not pass value", () => {
            const wrapper = mount(Test);
            expect(wrapper.html()).toBe("<span></span>");
            expect(warnings.shift()).toBeUndefined();
        });
    });

    describe("str.default", () => {
        const Test = Vue.extend({
            props: {
                foo: p.str.default("default")
            },
            render(h): VNode {
                return h("span", this.foo);
            }
        });
        it("pass value other than string", () => {
            const wrapper = mount(Test, { propsData: { foo: 0 } });
            expect(wrapper.html()).toBe("<span>0</span>");
            expect(warnings.shift()).toMatch(/expected string, got number/i);
            expect(warnings.shift()).toBeUndefined();
        });
        it("does not pass value", () => {
            const wrapper = mount(Test);
            expect(wrapper.html()).toBe("<span>default</span>");
            expect(warnings.shift()).toBeUndefined();
        });
    });
});
