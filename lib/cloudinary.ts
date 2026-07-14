import { apiClient } from './apiClient';

interface UploadResult {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    resource_type: string;
}

export const uploadToCloudinary = async (file: File, folder: string = 'general'): Promise<string> => {
    try {
        // 1. Get Signature
        const response = await apiClient.get('/api/upload/signature', { folder });

        if (!response.success || !response.data) {
            throw new Error('Failed to get upload signature');
        }

        const { signature, timestamp, cloud_name, api_key, public_id } = response.data;

        if (!cloud_name) {
            console.error("Missing cloud_name in signature response:", response.data);
            throw new Error('Cloudinary cloud name is missing in server response');
        }

        // 2. Prepare Form Data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);
        if (public_id) {
            formData.append('public_id', public_id);
        }

        // 3. Upload to Cloudinary
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await uploadRes.json();

        if (uploadRes.ok) {
            return data.secure_url;
        } else {
            console.error('Cloudinary Error:', data);
            throw new Error(data.error?.message || 'Upload failed');
        }

    } catch (error) {
        console.error('Upload Service Error:', error);
        throw error;
    }
};
