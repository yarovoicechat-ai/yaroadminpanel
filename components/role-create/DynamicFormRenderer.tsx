'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from './RoleCreateLayout';
import { ReferralState } from './ReferralBanner';
import { apiClient } from '@/lib/apiClient';

export interface DynamicFieldConfig {
    fieldKey: string;
    label: string;
    fieldType: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'upload' | 'date' | 'multi-select';
    required?: boolean;
    options?: string[];
    placeholder?: string;
    stepId: string;
}

export interface DynamicFormConfig {
    role: string;
    title: string;
    subtitle: string;
    badgeText: string;
    themeGradient: string;
    accentColor: string;
    formSteps: FormStep[];
    fields: DynamicFieldConfig[];
}

interface DynamicFormRendererProps {
    config: DynamicFormConfig;
}

export function DynamicFormRenderer({ config }: DynamicFormRendererProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState('');

    const activeStep = config.formSteps[currentStep];
    const activeFields = config.fields.filter(f => f.stepId === activeStep?.id);

    const updateField = (fieldKey: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldKey]: value }));
    };

    const validateStep = (): boolean => {
        for (const field of activeFields) {
            if (field.required) {
                const val = formData[field.fieldKey];
                if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
                    toast.error(`Please fill in required field: ${field.label}`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleStepChange = (newStep: number) => {
        if (newStep > currentStep) {
            if (!validateStep()) return;
        }
        setCurrentStep(newStep);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        try {
            setSubmitting(true);

            // Separate generic applicant details from role specific payload
            const applicantName = formData.name || formData.fullName || formData.businessName || 'Applicant';
            const applicantEmail = formData.email || formData.emailAddress || formData.officialEmail || '';
            const applicantPhone = formData.phone || formData.mobileNo || formData.phoneNumber || '';

            const documents = config.fields
                .filter(f => f.fieldType === 'upload' && formData[f.fieldKey])
                .map(f => ({ name: f.label, documentType: f.fieldKey, url: formData[f.fieldKey] }));

            const payload = {
                name: applicantName,
                email: applicantEmail,
                phone: applicantPhone,
                role: config.role,
                referralCode: referral.code,
                documents,
                ...formData,
            };

            const res = await apiClient.post(`/api/recruitment/${config.role}`, payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId);
                setSuccess(true);
                toast.success('Application submitted successfully!');
                localStorage.removeItem(`recruitment_draft_${config.role}`);
            } else {
                toast.error(res.message || 'Submission failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error submitting application');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <RoleCreateLayout
            roleKey={config.role}
            roleTitle={config.title}
            roleSubtitle={config.subtitle}
            badgeText={config.badgeText}
            themeGradient={config.themeGradient}
            accentColor={config.accentColor}
            steps={config.formSteps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">
                    {currentStep + 1}. {activeStep?.title}
                </h3>
                {activeStep?.description && (
                    <p className="text-xs text-white/70 mb-3">{activeStep.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeFields.map(field => {
                        const isFullWidth = field.fieldType === 'textarea' || field.fieldType === 'upload';
                        return (
                            <div key={field.fieldKey} className={isFullWidth ? 'sm:col-span-2' : ''}>
                                <label className="text-xs font-semibold text-white/80 block mb-1">
                                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                                </label>

                                {field.fieldType === 'text' && (
                                    <input
                                        type="text"
                                        value={formData[field.fieldKey] || ''}
                                        onChange={e => updateField(field.fieldKey, e.target.value)}
                                        placeholder={field.placeholder || `Enter ${field.label}`}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                                    />
                                )}

                                {field.fieldType === 'textarea' && (
                                    <textarea
                                        rows={3}
                                        value={formData[field.fieldKey] || ''}
                                        onChange={e => updateField(field.fieldKey, e.target.value)}
                                        placeholder={field.placeholder || `Enter details...`}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                                    />
                                )}

                                {field.fieldType === 'dropdown' && (
                                    <select
                                        value={formData[field.fieldKey] || ''}
                                        onChange={e => updateField(field.fieldKey, e.target.value)}
                                        className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400"
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options?.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                )}

                                {field.fieldType === 'upload' && (
                                    <input
                                        type="url"
                                        value={formData[field.fieldKey] || ''}
                                        onChange={e => updateField(field.fieldKey, e.target.value)}
                                        placeholder={field.placeholder || 'Document URL (Google Drive / Cloudinary / Image link)'}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                                    />
                                )}

                                {field.fieldType === 'checkbox' && (
                                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(formData[field.fieldKey])}
                                            onChange={e => updateField(field.fieldKey, e.target.checked)}
                                            className="w-4 h-4 rounded accent-amber-500"
                                        />
                                        <span className="text-xs text-white/80">{field.placeholder || 'I agree'}</span>
                                    </label>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </RoleCreateLayout>
    );
}
