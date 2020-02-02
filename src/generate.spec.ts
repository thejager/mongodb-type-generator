import { determineType, printType } from './generate';

describe('Generating types', () => {
    test('number', () => {
        expect(determineType(9)).toEqual({ type: 'number' });
        expect(determineType('hello')).toEqual({ type: 'string' });
        expect(determineType(new Date())).toEqual({ type: 'date' });
        expect(determineType(new Date())).toEqual({ type: 'date' });
        expect(determineType([])).toEqual({ type: 'array', childType: { type: 'any' } });
        expect(determineType([9])).toEqual({ type: 'array', childType: { type: 'number' } });
    });

    test('object', () => {
        expect(determineType({ a: 9 })).toEqual({
            type: 'object',
            fields: [{ name: 'a', type: { type: 'number' } }],
        });
    });

    test('object printing', () => {
        expect(printType('MyType', determineType(9))).toEqual('type MyType = number;');

        expect(printType('MyType', determineType({ a: 9 }))).toEqual(`type MyType = {
    a: number;
};`);

        expect(printType('MyType', determineType({ a: { b: 9 } }))).toEqual(`type MyType = {
    a: {
        b: number;
    };
};`);

        expect(printType('MyType', determineType({ a: { b: 9, c: 9 }, b: { c: new Date() } }))).toMatchSnapshot();

        expect(printType('MyType', { type: 'any' })).toEqual(`type MyType = any;`);

        expect(printType('MyType', determineType([]))).toEqual(`type MyType = any[];`);
    });
});
