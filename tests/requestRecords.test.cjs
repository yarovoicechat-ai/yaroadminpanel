const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const moduleUnderTest = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/requestRecords.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { module: moduleUnderTest, exports: moduleUnderTest.exports });
const { extractRequestRecords, fetchRequestRecords } = moduleUnderTest.exports;

test('EMS paginated response is unwrapped into request rows, not the pagination object', () => {
    const rows = [{ _id: 'country-request' }];
    const result = extractRequestRecords({ status: 'fulfilled', value: {
        success: true, data: { data: rows, pagination: { total: 1, totalPages: 1 } },
    } });
    assert.equal(result[0], rows[0]);
    assert.doesNotThrow(() => result.forEach(() => {}));
});

test('recruitment, employees and legacy direct arrays remain supported', () => {
    const rows = [{ _id: 'request' }];
    for (const response of [rows, { data: rows }, { data: { applications: rows } },
        { data: { employees: rows } }, { data: { requests: rows } }]) {
        assert.equal(extractRequestRecords(response)[0], rows[0]);
    }
    for (const response of [undefined, { data: {} }, { data: 'invalid' },
        { status: 'rejected', reason: new Error('offline') }, { success: false, data: rows }]) {
        assert.equal(extractRequestRecords(response).length, 0);
    }
});

test('all Admin request pages are loaded with the requested role filter', async () => {
    const calls = [];
    const rows = await fetchRequestRecords(async (endpoint, params) => {
        calls.push({ endpoint, ...params });
        return { success: true, data: { data: [{ _id: `admin-${params.page}` }],
            pagination: { page: params.page, totalPages: 3 } } };
    }, '/api/ems/requests', { requestType: 'Admin Request', role: 'admin' });
    assert.equal(rows.length, 3);
    assert.deepEqual(calls.map(call => call.page), [1, 2, 3]);
    assert.ok(calls.every(call => call.role === 'admin' && call.limit === 100));
});

test('application pagination and API errors are handled without hiding a failed request', async () => {
    const rows = await fetchRequestRecords(async (_, params) => ({ success: true,
        data: { applications: [{ _id: params.page }], totalPages: 2 } }), '/applications', {});
    assert.equal(rows.length, 2);
    await assert.rejects(fetchRequestRecords(async () => ({ success: false, message: 'Access denied' }), '/requests', {}),
        /Access denied/);
});
