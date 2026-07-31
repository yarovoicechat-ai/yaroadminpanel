'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const OPERATOR_STEPS: FormStep[] = [
    { id: 'personal', title: 'Personal Profile', description: 'Applicant personal details' },
    { id: 'experience', title: 'Operational Experience', description: 'Skills & team management' },
    { id: 'availability', title: 'Shift & Capacity', description: 'Daily hours & team scale' },
    { id: 'verification', title: 'Documents & Undertaking', description: 'Identity verification' },
];

function OperatorFormContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });

    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        email: '',
        phone: '',
        gender: 'female',
        city: '',
        state: '',
        district: '',
        country: 'India',

        experienceYears: '2-5 years',
        previousPlatforms: '',
        languagesSpoken: 'Hindi, English',
        operatorCategory: 'Live Stream Operator',

        dailyActiveHours: '8+ Hours',
        shiftPreference: 'Evening / Night Shift',
        managedTeamSize: '10-20 Members',

        govtIdUrl: '',
        adharFrontUrl: '',
        adharBackUrl: '',
        panCardUrl: '',
        resumePdfUrl: '',
        experienceProofUrl: '',
        agreedToTerms: false,
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState('');

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateCurrentStep = (): boolean => {
        if (currentStep === 0) {
            if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim()) {
                toast.error('Please fill in Full Name, Email, Phone, and City.');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                toast.error('Please enter a valid email address.');
                return false;
            }
        } else if (currentStep === 1) {
            if (!formData.previousPlatforms.trim()) {
                toast.error('Please specify previous platforms or companies managed.');
                return false;
            }
        }
        return true;
    };

    const handleStepChange = (newStep: number) => {
        if (newStep > currentStep) {
            if (!validateCurrentStep()) return;
        }
        setCurrentStep(newStep);
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep()) return;

        if (!referral.code || !referral.isVerified) {
            toast.error('A valid, verified Referral Code (e.g. D07A24) is required to apply.');
            return;
        }

        if (!formData.agreedToTerms) {
            toast.error('Please accept the operator code of conduct to submit.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: formData.fullName,
                age: formData.age ? Number(formData.age) : undefined,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                city: formData.city,
                state: formData.state,
                district: formData.district,
                country: formData.country,
                experienceYears: formData.experienceYears,
                role: 'operator',
                referralCode: referral.code,
                documents: [
                    formData.adharFrontUrl ? { name: 'Aadhaar Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                    formData.adharBackUrl ? { name: 'Aadhaar Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                    formData.panCardUrl ? { name: 'PAN Card', documentType: 'PAN', url: formData.panCardUrl } : null,
                    formData.govtIdUrl ? { name: 'Government ID', documentType: 'GovtID', url: formData.govtIdUrl } : null,
                    formData.resumePdfUrl ? { name: 'Resume PDF', documentType: 'Resume', url: formData.resumePdfUrl } : null,
                    formData.experienceProofUrl ? { name: 'Experience Proof', documentType: 'Certificate', url: formData.experienceProofUrl } : null,
                ].filter(Boolean),

                // Role specific data
                adharFront: formData.adharFrontUrl,
                adharBack: formData.adharBackUrl,
                pan: formData.panCardUrl,
                operatorCategory: formData.operatorCategory,
                previousPlatforms: formData.previousPlatforms,
                languagesSpoken: formData.languagesSpoken,
                dailyActiveHours: formData.dailyActiveHours,
                shiftPreference: formData.shiftPreference,
                managedTeamSize: formData.managedTeamSize,
            };

            const res = await apiClient.post('/api/recruitment/operator', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId);
                setSuccess(true);
                toast.success('Operator Application Submitted Successfully!');
                localStorage.removeItem('recruitment_draft_operator');
            } else {
                toast.error(res.message || 'Submission failed.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <RoleCreateLayout
            roleKey="operator"
            roleTitle="Regional Operator Application"
            roleSubtitle="Apply as an official Regional Operations Lead to manage live stream hosts & regional moderation."
            badgeText="Operations & Team Lead Recruitment"
            themeGradient="from-slate-950 via-teal-950 to-emerald-950"
            accentColor="emerald"
            steps={OPERATOR_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            {/* Step 1: Personal Profile */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">1. Personal & Contact Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Full Name *</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => updateField('fullName', e.target.value)}
                                placeholder="Your Full Name"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Age</label>
                            <input
                                type="number"
                                min="18"
                                max="100"
                                value={formData.age}
                                onChange={e => updateField('age', e.target.value)}
                                placeholder="e.g. 24"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="operator@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Mobile / WhatsApp Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">State *</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={e => updateField('state', e.target.value)}
                                placeholder="e.g. Delhi / Maharashtra / UP"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">District *</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={e => updateField('district', e.target.value)}
                                placeholder="e.g. South Delhi / Lucknow"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={e => updateField('gender', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">City *</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => updateField('city', e.target.value)}
                                placeholder="e.g. Delhi"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => updateField('country', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                    </div>
                    </div>
                </div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Operational Experience & Skills</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Years of Team Management Exp</label>
                            <select
                                value={formData.experienceYears}
                                onChange={e => updateField('experienceYears', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                            >
                                <option value="<1 year">&lt; 1 Year</option>
                                <option value="1-2 years">1 - 2 Years</option>
                                <option value="2-5 years">2 - 5 Years</option>
                                <option value="5+ years">5+ Years</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Operator Specialization</label>
                            <select
                                value={formData.operatorCategory}
                                onChange={e => updateField('operatorCategory', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                            >
                                <option value="Live Stream Operator">Live Stream Operations</option>
                                <option value="Regional Team Lead">Regional Team Lead</option>
                                <option value="Quality & Moderation">Quality & Moderation</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Previous Apps / Companies Managed *</label>
                        <input
                            type="text"
                            value={formData.previousPlatforms}
                            onChange={e => updateField('previousPlatforms', e.target.value)}
                            placeholder="e.g. Loco, ShareChat, Tango, Bigo"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Languages Spoken</label>
                        <input
                            type="text"
                            value={formData.languagesSpoken}
                            onChange={e => updateField('languagesSpoken', e.target.value)}
                            placeholder="e.g. Hindi, English, Punjabi, Tamil"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Availability */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. Availability & Shift Capacity</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Daily Available Active Hours</label>
                        <select
                            value={formData.dailyActiveHours}
                            onChange={e => updateField('dailyActiveHours', e.target.value)}
                            className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="4-6 Hours">4 - 6 Hours / Day</option>
                            <option value="8+ Hours">8+ Hours (Full Time)</option>
                            <option value="12+ Hours">12+ Hours (Flexible Shifts)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Shift Preference</label>
                        <select
                            value={formData.shiftPreference}
                            onChange={e => updateField('shiftPreference', e.target.value)}
                            className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="Morning Shift">Morning Shift (8 AM - 4 PM)</option>
                            <option value="Evening / Night Shift">Evening / Night Shift (4 PM - 12 AM)</option>
                            <option value="Late Night Shift">Late Night Shift (12 AM - 8 AM)</option>
                            <option value="Flexible / Any Shift">Flexible Rotational Shifts</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Team Size You Can Manage</label>
                        <select
                            value={formData.managedTeamSize}
                            onChange={e => updateField('managedTeamSize', e.target.value)}
                            className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="5-10 Members">5 - 10 Members</option>
                            <option value="10-20 Members">10 - 20 Members</option>
                            <option value="20-50 Members">20 - 50 Members</option>
                            <option value="50+ Members">50+ Members</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Step 4: Verification */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">4. Identity Verification & Experience Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileUpload
                            label="Aadhaar Card Front Side Document"
                            name="adharFrontUrl"
                            required
                            value={formData.adharFrontUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('adharFrontUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('adharFrontUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                        <FileUpload
                            label="Aadhaar Card Back Side Document"
                            name="adharBackUrl"
                            required
                            value={formData.adharBackUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('adharBackUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('adharBackUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileUpload
                            label="PAN Card Document"
                            name="panCardUrl"
                            required
                            value={formData.panCardUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('panCardUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('panCardUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                        <FileUpload
                            label="Operator Resume / CV Document"
                            name="resumePdfUrl"
                            required
                            value={formData.resumePdfUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('resumePdfUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('resumePdfUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                    </div>
                    <FileUpload
                        label="Experience Certificate / Recommendation Letter (Optional)"
                        name="experienceProofUrl"
                        value={formData.experienceProofUrl}
                        onChange={(fileOrUrl) => {
                            if (typeof fileOrUrl === 'string') {
                                updateField('experienceProofUrl', fileOrUrl);
                            } else if (fileOrUrl instanceof File) {
                                const reader = new FileReader();
                                reader.onloadend = () => updateField('experienceProofUrl', reader.result as string);
                                reader.readAsDataURL(fileOrUrl);
                            }
                        }}
                    />

                    <div className="pt-3">
                        <label className="flex items-start gap-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                            <input
                                type="checkbox"
                                checked={formData.agreedToTerms}
                                onChange={e => updateField('agreedToTerms', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-emerald-500 rounded"
                            />
                            <span className="text-xs text-white/80 leading-relaxed">
                                I confirm that all details provided are accurate. I agree to uphold the operational integrity and moderation guidelines of MithiChat.
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function OperatorApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Operator Portal...</div>}>
            <OperatorFormContent />
        </Suspense>
    );
}
