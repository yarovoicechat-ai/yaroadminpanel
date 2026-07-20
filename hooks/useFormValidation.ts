import { useState } from 'react';
import { ApplicationFormData, FormValidationErrors } from '../types/application';

export function useFormValidation(formData: ApplicationFormData) {
    const [errors, setErrors] = useState<FormValidationErrors>({});

    const validateField = (name: keyof ApplicationFormData, value: any): string => {
        let error = '';

        switch (name) {
            case 'fullName':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'Full Name is required.';
                }
                break;

            case 'emailAddress':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'Email Address is required.';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    error = 'Please enter a valid email address.';
                }
                break;

            case 'mobileNumber':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'Mobile Number is required.';
                } else if (!/^[0-9+\s\-]{8,15}$/.test(value.trim())) {
                    error = 'Please enter a valid mobile number.';
                }
                break;

            case 'country':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'Country is required.';
                }
                break;

            case 'state':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'State is required.';
                }
                break;

            case 'city':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'City is required.';
                }
                break;

            case 'yearsOfExperience':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'Years of Experience is required.';
                }
                break;

            case 'linkedInProfile':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'LinkedIn Profile URL is required.';
                } else if (!value.toLowerCase().includes('linkedin.com')) {
                    error = 'Please enter a valid LinkedIn URL.';
                }
                break;

            case 'resume':
                if (!value) {
                    error = 'Resume / CV upload is required.';
                }
                break;

            case 'addressProof':
                if (!value) {
                    error = 'Address Proof document is required.';
                }
                break;

            case 'governmentIdProof':
                if (!value) {
                    error = 'Government ID Proof is required.';
                }
                break;

            case 'whyJoinUs':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'Please explain why you want to join us.';
                }
                break;

            case 'personalNote':
                if (!value || typeof value !== 'string' || !value.trim()) {
                    error = 'Personal Note is required.';
                }
                break;

            case 'confirmedTrue':
                if (!value) {
                    error = 'You must confirm that all provided information is true.';
                }
                break;

            default:
                break;
        }

        return error;
    };

    const validateForm = (): boolean => {
        const newErrors: FormValidationErrors = {};

        const requiredFields: Array<keyof ApplicationFormData> = [
            'fullName',
            'emailAddress',
            'mobileNumber',
            'country',
            'state',
            'city',
            'yearsOfExperience',
            'linkedInProfile',
            'resume',
            'addressProof',
            'governmentIdProof',
            'whyJoinUs',
            'personalNote',
            'confirmedTrue',
        ];

        requiredFields.forEach((field) => {
            const err = validateField(field, formData[field]);
            if (err) {
                newErrors[field] = err;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearError = (field: keyof ApplicationFormData) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    return {
        errors,
        setErrors,
        validateField,
        validateForm,
        clearError,
    };
}
