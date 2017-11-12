# vue-strict-prop
[![Build Status](https://travis-ci.org/wonderful-panda/vue-strict-prop.svg?branch=master)](https://travis-ci.org/wonderful-panda/vue-strict-prop)

strict-typed prop builder for Vue component

## Example

```typescript
import Vue, { VNode } from "vue";
import p from "vue-strict-prop";

const MyComponent = Vue.extend({
    props: {
        // equivarent to { type: String, required: true, validator: v => v.length >= 3 }.
        title: p(String).validator(v => v.length >= 3).required,

        // equivarent to { type: String, required: false }.
        // `this.description` is statically typed as `string | undefined`.
        description: p(String).optional,

        // equivarent to { type: [String, Number], required: true }.
        // `this.height` is statically typed as `string | number`.
        height: p(String, Number).required,

        // equivarent to {
        //      type: String,
        //      required: false,
        //      default: "black",
        //      validator: v => v === "black" || v === "blue" || v === "red"
        //  }.
        // `this.color` is statically typed as `"black" | "blue" | "red"`.
        color: p.ofStringLiterals("brack", "blue", "red").default("black"),

        // equivarent to { type: Array, required: true }.
        // `this.buttons` is statically typed as `Array<string>`
        buttons: p.ofArray<string>().required
    },
    render(h): VNode {
        /* snip */
    }
});
```
