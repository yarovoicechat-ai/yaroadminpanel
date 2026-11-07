export function sanitizeDocumentUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    let trimmed = String(rawUrl).trim().replace(/\\/g, '/');

    // If already data or blob URL
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // Raw base64 string without prefix
    if (/^[A-Za-z0-9+/=]{100,}$/.test(trimmed)) {
        if (trimmed.startsWith('/9j/')) return `data:image/jpeg;base64,${trimmed}`;
        if (trimmed.startsWith('iVBORw')) return `data:image/png;base64,${trimmed}`;
        return `data:image/jpeg;base64,${trimmed}`;
    }

    // Upgrade insecure HTTP on api.yaroapp.in to HTTPS to prevent browser mixed-content blocking
    if (trimmed.startsWith('http://api.yaroapp.in')) {
        trimmed = trimmed.replace('http://', 'https://');
    }

    // Convert localhost/127.0.0.1 backend references to production API base
    if (/^https?:\/\/(localhost|127\.0\.0\.1):(3001|5000|3101|4001)/i.test(trimmed)) {
        trimmed = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1):(3001|5000|3101|4001)/i, 'https://api.yaroapp.in');
    }

    // If full URL with http(s)
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    // Relative path (e.g. /uploads/xxx, uploads/xxx, api/uploads/xxx)
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yaroapp.in';
    return `${apiBase.replace(/\/+$/, '')}/${trimmed.replace(/^\/+/, '')}`;
}

export function documentFileType(url: string, fallbackHint?: string): { kind: 'image' | 'pdf' | 'file'; extension: string } {
    if (!url) return { kind: 'file', extension: 'bin' };
    const clean = url.split(/[?#]/)[0];
    const mime = /^data:([^;,]+)/i.exec(url)?.[1]?.toLowerCase();
    const extension = clean.split('.').pop()?.toLowerCase() || '';

    if (mime?.startsWith('image/') || /^(png|jpe?g|webp|gif|svg|avif|bmp)$/.test(extension)) {
        return { kind: 'image', extension: mime ? mime.split('/')[1].replace('jpeg', 'jpg') : (extension || 'jpg') };
    }
    if (mime === 'application/pdf' || extension === 'pdf') {
        return { kind: 'pdf', extension: 'pdf' };
    }
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
        return { kind: 'file', extension: 'docx' };
    }
    if (mime === 'application/msword' || extension === 'doc') {
        return { kind: 'file', extension: 'doc' };
    }

    // If fallbackHint mentions image or card or photo or front or back or pan or selfie
    const hint = String(fallbackHint || '').toLowerCase();
    if (hint.includes('card') || hint.includes('front') || hint.includes('back') || hint.includes('pan') || hint.includes('selfie') || hint.includes('photo') || hint.includes('image')) {
        return { kind: 'image', extension: 'jpg' };
    }

    // In recruitment docs, unless it explicitly says resume or pdf, documents are almost always images
    if (!hint.includes('resume') && !hint.includes('cv') && !clean.includes('pdf')) {
        return { kind: 'image', extension: 'jpg' };
    }

    return { kind: 'file', extension: /^[a-z0-9]{1,6}$/.test(extension) ? extension : 'bin' };
}

export function documentDownloadName(title: string, url: string): string {
    const ext = documentFileType(url, title).extension;
    return `${title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'document'}.${ext}`;
}

export function requestDocumentUrl(record: any, kind: 'front' | 'back' | 'pan' | 'resume' | 'selfie'): string {
    const data = record?.data || record?.roleData || record || {};
    const applicant = record?.applicant || {};
    const fields = {
        front: [
            'adharFront', 'aadhaarFront', 'aadharFront', 'adharFrontUrl', 'aadhaarFrontUrl', 'aadharFrontUrl',
            'govtIdUrl', 'idCardFront', 'idFront', 'frontUrl', 'frontImage', 'govtId', 'idProof', 'identityCardFront'
        ],
        back: [
            'adharBack', 'aadhaarBack', 'aadharBack', 'adharBackUrl', 'aadhaarBackUrl', 'aadharBackUrl',
            'idCardBack', 'idBack', 'backUrl', 'backImage', 'identityCardBack'
        ],
        pan: [
            'panCard', 'panCardUrl', 'pan', 'panUrl', 'panCardImage', 'taxIdUrl', 'panDoc', 'panFile'
        ],
        resume: [
            'resumeUrl', 'resume', 'resumePdfUrl', 'cv', 'cvUrl', 'curriculumVitae'
        ],
        selfie: [
            'selfieUrl', 'selfieWithIdCard', 'selfie', 'selfieWithId', 'faceImage', 'selfieImage', 'selfieWithCard'
        ]
    };

    const isUrl = (value: any): value is string =>
        typeof value === 'string' &&
        value.trim().length > 0 &&
        (/^(https?:\/\/|data:|\/|uploads\/|[A-Za-z0-9+/=]{100,})/i.test(value.trim()));

    // 1. Check data / roleData fields
    for (const field of fields[kind]) {
        if (isUrl(data[field])) return sanitizeDocumentUrl(data[field]);
        if (isUrl(applicant[field])) return sanitizeDocumentUrl(applicant[field]);
        if (isUrl(record[field])) return sanitizeDocumentUrl(record[field]);
    }

    // 2. Check documents and attachments arrays
    const documents = [record?.documents, data?.documents, applicant?.documents, record?.attachments, data?.attachments].flatMap(value => Array.isArray(value) ? value : []);
    const match = documents.find(document => {
        const type = String(document?.documentType || document?.type || '').toLowerCase().replace(/[^a-z]/g, '');
        const name = String(document?.name || document?.fileName || '').toLowerCase();
        return kind === 'front'
            ? type.includes('front') || type.includes('aadhaar') || type.includes('adhar') || type.includes('aadhar') || type === 'govtid' || name.includes('front') || name.includes('adhar') || name.includes('aadhaar')
            : kind === 'back'
            ? type.includes('back') || name.includes('back')
            : kind === 'pan'
            ? type.includes('pan') || name.includes('pan')
            : kind === 'resume'
            ? type.includes('resume') || type.includes('cv') || name.includes('resume') || name.includes('cv')
            : type.includes('selfie') || name.includes('selfie') || type.includes('face');
    });

    const found = match?.url || match?.fileUrl || match?.path || match?.documentUrl;
    return isUrl(found) ? sanitizeDocumentUrl(found) : '';
}
