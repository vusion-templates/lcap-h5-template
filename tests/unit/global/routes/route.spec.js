import { filterAuthResources } from '@/router/guards/auth';

describe('filterAuthResources', () => {
    test('should return an empty array if input is not an array or is empty', () => {
        expect(filterAuthResources(null)).toEqual([]);
        expect(filterAuthResources(undefined)).toEqual([]);
        expect(filterAuthResources([])).toEqual([]);
    });

    test('all have father path in the list', () => {
        const resources = [
            { resourceValue: '/m/a' },
            { resourceValue: '/m/a/b' },
            { resourceValue: '/m/a/b/c' },
            { resourceValue: '/m/d' },
        ];

        const filtered = filterAuthResources(resources);

        expect(filtered).toEqual(resources);
    });

    test('demo1: do not have a father path in the list', () => {
        const resources = [
            { resourceValue: '/m/a' },
            { resourceValue: '/m/a/b/c' },
        ];

        const filtered = filterAuthResources(resources);

        expect(filtered).toEqual([{ resourceValue: '/m/a' }]);
    });

    test('demo2: do not have a father path in the list', () => {
        const resources = [{ resourceValue: '/m/a/b' }];

        const filtered = filterAuthResources(resources);

        expect(filtered).toHaveLength(0);
    });

    test('demo3: do not have a father path in the list', () => {
        const resources = [
            { resourceValue: '/m/a/b/c' },
            { resourceValue: '/m/a/b' },
        ];

        const filtered = filterAuthResources(resources);

        expect(filtered).toHaveLength(0);
    });

    test('demo4: do not have a father path in the list', () => {
        const resources = [
            { resourceValue: '/m/a/b/c' },
            { resourceValue: '/m/a/b' },
            { resourceValue: '/m/a' },
        ];

        const filtered = filterAuthResources(resources);

        expect(filtered).toEqual(resources);
    });
});
