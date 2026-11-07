/** Read collection envelopes used by EMS, recruitment and employee APIs. */
export function extractRequestRecords(response: any, keys: string[] = []): any[] {
    if (response?.status === 'rejected') return [];
    let value = response?.status === 'fulfilled' ? response.value : response;
    for (let depth = 0; depth < 6 && value != null; depth++) {
        if (Array.isArray(value)) return value.filter(item => item && typeof item === 'object');
        if (typeof value !== 'object' || value.success === false) return [];
        for (const key of [...keys, 'requests', 'applications', 'employees', 'users', 'items']) {
            if (Array.isArray(value[key])) return extractRequestRecords(value[key]);
        }
        value = value.data;
    }
    return [];
}

export async function fetchRequestRecords(
    get: (endpoint: string, params: Record<string, any>) => Promise<any>,
    endpoint: string,
    params: Record<string, any>,
    keys: string[] = [],
): Promise<any[]> {
    const records: any[] = [];
    let page = 1;
    while (true) {
        const response = await get(endpoint, { ...params, page, limit: 100 });
        if (response?.success === false) throw new Error(response.message || 'Could not load requests');
        const items = extractRequestRecords(response, keys);
        records.push(...items);
        const payload = response?.data ?? response;
        const pagination = payload?.pagination ?? response?.pagination ?? payload;
        const totalPages = Number(pagination?.totalPages);
        if (!items.length || !Number.isFinite(totalPages) || page >= totalPages) break;
        page++;
    }
    return records;
}
