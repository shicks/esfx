// 4.1.4 Reflect.hasMetadata ( metadataKey, target [, propertyKey] )
// https://rbuckton.github.io/reflect-metadata/#reflect.hasmetadata

import "..";

describe("Reflect.hasMetadata", () => {
    it("InvalidTarget", () => {
        expect(() => Reflect.hasMetadata("key", undefined!)).toThrow(TypeError);
    });

    it("WithoutTargetKeyWhenNotDefined", () => {
        let obj = {};
        let result = Reflect.hasMetadata("key", obj);
        expect(result).toBe(false);
    });

    it("WithoutTargetKeyWhenDefined", () => {
        let obj = {};
        Reflect.defineMetadata("key", "value", obj);
        let result = Reflect.hasMetadata("key", obj);
        expect(result).toBe(true);
    });

    it("WithoutTargetKeyWhenDefinedOnPrototype", () => {
        let prototype = {};
        let obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype);
        let result = Reflect.hasMetadata("key", obj);
        expect(result).toBe(true);
    });

    it("WithTargetKeyWhenNotDefined", () => {
        let obj = {};
        let result = Reflect.hasMetadata("key", obj, "name");
        expect(result).toBe(false);
    });

    it("WithTargetKeyWhenDefined", () => {
        let obj = {};
        Reflect.defineMetadata("key", "value", obj, "name");
        let result = Reflect.hasMetadata("key", obj, "name");
        expect(result).toBe(true);
    });

    it("WithTargetKeyWhenDefinedOnPrototype", () => {
        let prototype = {};
        let obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, "name");
        let result = Reflect.hasMetadata("key", obj, "name");
        expect(result).toBe(true);
    });
});