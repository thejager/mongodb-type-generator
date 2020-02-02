import { MongoClient, ObjectID } from 'mongodb';
import { startCase } from 'lodash';

function makeBasicType(type) {
    return { type };
}

export function determineType(value) {
    if (typeof value === 'string') {
        return makeBasicType('string');
    } else if (typeof value === 'number') {
        return makeBasicType('number');
    } else if (value === null) {
        return makeBasicType('null');
    } else if (value === undefined) {
        return makeBasicType('undefined');
    } else if (value instanceof Date) {
        return makeBasicType('date');
    } else if (ObjectID.isValid(value)) {
        return makeBasicType('string');
    } else if (Array.isArray(value)) {
        if (value.length === 0) {
            return { type: 'array', childType: { type: 'any' } };
        } else {
            return { type: 'array', childType: determineType(value[0]) };
        }
    } else if (typeof value === 'object') {
        try {
            return {
                type: 'object',
                fields: Object.keys(value).map(fieldName => {
                    return {
                        type: determineType(value[fieldName]),
                        name: fieldName,
                    };
                }),
            };
        } catch (err) {
            console.log(err);
            console.log(value);
        }
    }

    return { type: 'any' };
}

export function _printType(type, printTrailingSemiColon = true) {
    if (type.type === 'number') {
        return 'number' + (printTrailingSemiColon ? ';' : '');
    } else if (type.type === 'date') {
        return 'Date' + (printTrailingSemiColon ? ';' : '');
    } else if (type.type === 'null') {
        return 'null' + (printTrailingSemiColon ? ';' : '');
    } else if (type.type === 'undefined') {
        return 'undefined' + (printTrailingSemiColon ? ';' : '');
    } else if (type.type === 'string') {
        return 'string' + (printTrailingSemiColon ? ';' : '');
    } else if (type.type === 'any') {
        return 'any' + (printTrailingSemiColon ? ';' : '');
    } else if (type.type === 'array') {
        return `${_printType(type.childType, false)}[]${printTrailingSemiColon ? ';' : ''}`;
    } else if (type.type === 'object') {
        return `{
${type.fields
    .map(
        field =>
            `    ${field.name}: ${_printType(field.type)
                .split('\n')
                .map((s, idx) => (idx > 0 && idx + 1 < _printType(field.type).length ? `    ${s}` : s))
                .join('\n')}`
    )
    .join('\n')}
}${printTrailingSemiColon ? ';' : ''}`;
    } else {
        console.log(type);
    }
}

export function printType(typeName, type) {
    return `type ${typeName} = ${_printType(type)}`;
}

export function createTypeName(collectionName) {
    const result = startCase(collectionName)
        .split(' ')
        .join('');

    if (result.endsWith('s')) {
        return result.slice(0, result.length - 1);
    }

    return result;
}

(async () => {
    const client: MongoClient = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db();

    const collections = await db.collections();

    const typeStrings = [];

    for (const collection of collections) {
        const doc = await collection.findOne({});
        typeStrings.push(printType(createTypeName(collection.collectionName), determineType(doc)));
    }

    console.log(typeStrings.join('\n\n'));

    await client.close();
})();
