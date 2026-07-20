import { apiClient } from './apiClient';

export interface UploadResult {
    success: boolean;
    url?: string;
    message?: string;
}

export async function uploadRecruitmentDocument(
    file: File,
    role: string,
    documentType: string = 'Document'
): Promise<UploadResult> {
    const roleFolders: Record<string, string> = {
        agency: 'Recruitment/Agency',
        operator: 'Recruitment/Operator',
        admin: 'Recruitment/Admin',
        'customer-service': 'Recruitment/CustomerService',
        'super-admin': 'Recruitment/SuperAdmin',
    };

    const folder = roleFolders[role.toLowerCase()] || 'Recruitment/General';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('documentType', documentType);

    try {
        const res = await apiClient.uploadFile('/api/upload', formData);
        if (res.success && res.data?.url) {
            return { success: true, url: res.data.url };
        }
        return { success: false, message: res.message || 'Upload failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Error uploading document' };
    }
}
