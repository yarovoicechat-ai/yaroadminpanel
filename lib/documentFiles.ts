export function documentFileType(url: string): { kind: 'image' | 'pdf' | 'file'; extension: string } {
    const mime = /^data:([^;,]+)/i.exec(url)?.[1]?.toLowerCase();
    const extension = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase() || '';
    if (mime?.startsWith('image/') || (!mime && /^(png|jpe?g|webp|gif|svg|avif)$/.test(extension))) {
        return { kind: 'image', extension: mime ? mime.split('/')[1].replace('jpeg', 'jpg') : extension };
    }
    if (mime === 'application/pdf' || (!mime && extension === 'pdf')) return { kind: 'pdf', extension: 'pdf' };
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return { kind: 'file', extension: 'docx' };
    if (mime === 'application/msword') return { kind: 'file', extension: 'doc' };
    return { kind: 'file', extension: /^[a-z0-9]{1,6}$/.test(extension) ? extension : 'bin' };
}

export function documentDownloadName(title: string, url: string): string {
    return `${title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'document'}.${documentFileType(url).extension}`;
}

export function requestDocumentUrl(record: any, kind: 'front' | 'back' | 'pan' | 'resume' | 'selfie'): string {
    const data = record?.data || record?.roleData || record || {};
    const fields = {
        front: ['adharFront', 'aadhaarFront', 'adharFrontUrl', 'aadhaarFrontUrl', 'govtIdUrl', 'idCardFront', 'idFront', 'frontUrl', 'frontImage'],
        back: ['adharBack', 'aadhaarBack', 'adharBackUrl', 'aadhaarBackUrl', 'idCardBack', 'idBack', 'backUrl', 'backImage'],
        pan: ['panCard', 'panCardUrl', 'pan', 'panUrl', 'panCardImage'],
        resume: ['resumeUrl', 'resume', 'resumePdfUrl', 'cv', 'cvUrl'],
        selfie: ['selfieUrl', 'selfieWithIdCard', 'selfie', 'selfieWithId', 'faceImage', 'selfieImage']
    };
    const isUrl = (value: any): value is string => typeof value === 'string' && value.trim().length > 0 && /^(https?:\/\/|data:|\/|uploads\/)/i.test(value.trim());
    for (const field of fields[kind]) if (isUrl(data[field])) return data[field];
    const documents = [record?.documents, data?.documents, record?.attachments, data?.attachments].flatMap(value => Array.isArray(value) ? value : []);
    const match = documents.find(document => {
        const type = String(document?.documentType || document?.type || '').toLowerCase().replace(/[^a-z]/g, '');
        const name = String(document?.name || document?.fileName || '').toLowerCase();
        return kind === 'front' ? type.includes('front') || type.includes('aadhaar') || type === 'govtid' || name.includes('front') || name.includes('adhar')
            : kind === 'back' ? type.includes('back') || name.includes('back')
            : kind === 'pan' ? type.includes('pan') || name.includes('pan')
            : kind === 'resume' ? type.includes('resume') || type.includes('cv') || name.includes('resume') || name.includes('cv')
            : type.includes('selfie') || name.includes('selfie') || type.includes('face');
    });
    const found = match?.url || match?.fileUrl || match?.path || match?.documentUrl;
    return isUrl(found) ? found : '';
}
