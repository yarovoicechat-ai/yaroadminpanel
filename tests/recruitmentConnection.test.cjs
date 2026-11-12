/* eslint-disable @typescript-eslint/no-require-imports -- Matches the existing CommonJS Node test harness. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative, context = {}) {
    const loadedModule = { exports: {} };
    const filename = path.join(__dirname, relative);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(code, {
        exports: loadedModule.exports, module: loadedModule, URL, TypeError, __dirname,
        console: { log() {} }, process: { env: { NODE_ENV: 'production' } },
        localStorage: { getItem: () => 'existing-token' }, ...context,
    });
    return loadedModule.exports;
}

test('application and referral requests use the admin origin and preserve the body and token', async () => {
    const calls = [];
    const { apiClient } = load('../lib/apiClient.ts', {
        window: { location: { hostname: 'admin.yaroapp.in', origin: 'https://admin.yaroapp.in' } },
        fetch: async (url, options) => {
            calls.push({ url, options });
            return Response.json({ success: true, data: {} });
        },
    });
    const payload = { documents: [{ url: 'data:application/pdf;base64,AA==' }] };
    await apiClient.post('/api/recruitment/country-manager', payload);
    await apiClient.get('/api/recruitment/verify-referral', { code: 'CODE' });
    await apiClient.get('/api/other');
    assert.equal(calls[0].url, 'https://admin.yaroapp.in/api/recruitment/country-manager');
    assert.equal(calls[0].options.body, JSON.stringify(payload));
    assert.equal(calls[0].options.headers.Authorization, 'Bearer existing-token');
    assert.equal(calls[1].url, 'https://admin.yaroapp.in/api/recruitment/verify-referral?code=CODE');
    assert.equal(calls[2].url, 'https://api.yaroapp.in/api/other');
});

test('oversized and unavailable-service responses give actionable messages without retrying a submission', async () => {
    for (const status of [413, 502, 503, 504]) {
        let calls = 0;
        const { apiClient } = load('../lib/apiClient.ts', {
            fetch: async () => { calls++; return new Response('<html>proxy error</html>', { status }); },
        });
        await assert.rejects(apiClient.post('/api/recruitment/country-manager', {}), error => {
            assert.match(error.message, status === 413 ? /smaller files/ : /temporarily unavailable/);
            assert.doesNotMatch(error.message, /<html>/);
            return true;
        });
        assert.equal(calls, 1);
    }
});

test('production recruitment rewrite targets the configured backend and supports document payloads', async () => {
    const { default: config } = load('../next.config.ts', {
        process: { env: { NODE_ENV: 'production', RECRUITMENT_API_BASE_URL: 'http://127.0.0.1:3101/' } },
    });
    const [rewrite] = await config.rewrites();
    assert.equal(rewrite.source, '/api/recruitment/:path*');
    assert.equal(rewrite.destination, 'http://127.0.0.1:3101/api/recruitment/:path*');
    assert.equal(config.experimental.proxyClientMaxBodySize, '50mb');
});

test('local requests consistently use the backend port 3101', async () => {
    let requestUrl;
    const { apiClient } = load('../lib/apiClient.ts', {
        window: { location: { hostname: 'localhost', origin: 'http://localhost:3100' } },
        fetch: async url => { requestUrl = url; return Response.json({ success: true }); },
    });
    await apiClient.get('/api/other');
    assert.equal(requestUrl, 'http://localhost:3101/api/other');
});

test('mobile network failures remain retryable by the user without automatic duplicate submissions', async () => {
    for (const message of ['Failed to fetch', 'Load failed', 'NetworkError when attempting to fetch resource.']) {
        let calls = 0;
        const { apiClient } = load('../lib/apiClient.ts', {
            fetch: async () => { calls++; throw new TypeError(message); },
        });
        await assert.rejects(apiClient.post('/api/recruitment/country-manager', {}), error => {
            assert.match(error.message, /internet connection/);
            return true;
        });
        assert.equal(calls, 1);
    }
});
