/**
 * Returns a Map where key is a number and value is generic `T` or `undefined`
 */
export type MapById<T> = Record<number, T | undefined>;

/**
 * Returns either `U` or `T`
 *
 * @description
 * This type makes sure you can't use both T and U at the same time
 * which is possible using intersection types;
 *
 * @example
 * This is possible with intersection types:
 *
 * ```ts
 * type Foo = { a: string } | { b: string };
 *
 * const foo:Foo = { a: '', b: '' }; // This is allowed
 * ```
 *
 * We can make it "exclusive" by using this type:
 *
 * ```ts
 * type Foo = Exclusive<{ a: string }, { b: string }>;
 *
 * const foo:Foo = { a: '', b: '' }; // This is not allowed
 * const foo:Foo = { a: '' }; // This is allowed
 * const foo:Foo = { b: '' }; // This is allowed
 * ```
 */
export type Exclusive<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>> =
    | (T & { [k in Exclude<keyof U, keyof T>]?: never })
    | (U & { [k in Exclude<keyof T, keyof U>]?: never });

/**
 * Make a readonly type readable by removing the readonly modifier
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
