'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const SELLER_STEPS: FormStep[] = [
    { id: 'profile', title: 'Merchant Profile', description: 'Business & coin seller details' },
    { id: 'financials', title: 'Coin Volume & Capital', description: 'Monthly turnover & initial coin limit' },
    { id: 'references', title: 'Business Verification', description: 'Commercial reference & GST/PAN' },
    { id: 'documents', title: 'KYC & Merchant Oath', description: 'Identity verification & contract agreement' },
];

function SellerFormContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });

    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: 'female',
        email: '',
        phone: '',
        country: 'India',
        state: '',
        district: '',
        city: '',

        businessName: '',
        requestedCoinLimit: '100,000 Coins',
        monthlyTurnover: '₹50,000 - ₹2,00,000',
        payoutUpiOrBank: '',

        businessReference: '',
        gstNo: '',

        adharFrontUrl: '',
        adharBackUrl: '',
        panCardUrl: '',
        resumePdfUrl: '',
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
            if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
                toast.error('Full Name, Email, and Phone Number are required.');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                toast.error('Please enter a valid email address.');
                return false;
            }
        } else if (currentStep === 1) {
            if (!formData.payoutUpiOrBank.trim()) {
                toast.error('Payout UPI / Bank Details are required.');
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
            toast.error('You must agree to the Coin Merchant Agreement to submit.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: formData.fullName,
                age: formData.age ? Number(formData.age) : undefined,
                gender: formData.gender,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                state: formData.state,
                district: formData.district,
                city: formData.city,
                role: 'seller',
                referralCode: referral.code,
                documents: [
                    formData.adharFrontUrl ? { name: 'Aadhaar Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                    formData.adharBackUrl ? { name: 'Aadhaar Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                    formData.panCardUrl ? { name: 'PAN Card', documentType: 'PAN', url: formData.panCardUrl } : null,
                    formData.resumePdfUrl ? { name: 'Business Resume / Proof', documentType: 'Resume', url: formData.resumePdfUrl } : null,
                ].filter(Boolean),

                businessName: formData.businessName,
                requestedCoinLimit: formData.requestedCoinLimit,
                monthlyTurnover: formData.monthlyTurnover,
                payoutUpiOrBank: formData.payoutUpiOrBank,
                businessReference: formData.businessReference,
                gstNo: formData.gstNo,
            };

            const res = await apiClient.post('/api/recruitment/seller', payload);
            if (!res.success || !res.data?.applicationId) {
                throw new Error(res.message || 'Seller application could not be submitted.');
            }

            setApplicationId(res.data.applicationId);
            setSuccess(true);
            localStorage.removeItem('recruitment_draft_seller');
            toast.success('Coin Seller Application Submitted Successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <RoleCreateLayout
            roleKey="seller"
            roleTitle="Coin Seller Application Portal"
            roleSubtitle="Apply for Certified Meethi Chat Coin Seller / Merchant Credentials & Credit Limit Clearances."
            badgeText="Certified Coin Seller Clearance"
            themeGradient="from-slate-950 via-amber-950 to-emerald-950"
            accentColor="amber"
            steps={SELLER_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            {/* Step 1: Merchant Profile */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">1. Merchant Identity & Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Merchant / Owner Full Name *</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => updateField('fullName', e.target.value)}
                                placeholder="Full Legal Name"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Merchant Age</label>
                            <input
                                type="number"
                                min="18"
                                max="100"
                                value={formData.age}
                                onChange={e => updateField('age', e.target.value)}
                                placeholder="e.g. 28"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={e => updateField('gender', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400"
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Official Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="seller@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Direct Mobile Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">State *</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={e => updateField('state', e.target.value)}
                                placeholder="e.g. Maharashtra"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">District *</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={e => updateField('district', e.target.value)}
                                placeholder="e.g. Mumbai"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Coin Volume */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Coin Volume & Capital Capacity</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Registered Business / Firm Name (Optional)</label>
                        <input
                            type="text"
                            value={formData.businessName}
                            onChange={e => updateField('businessName', e.target.value)}
                            placeholder="e.g. Royal Digital Agency"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Requested Starting Coin Limit</label>
                            <select
                                value={formData.requestedCoinLimit}
                                onChange={e => updateField('requestedCoinLimit', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400"
                            >
                                <option value="50,000 Coins">50,000 Coins</option>
                                <option value="100,000 Coins">100,000 Coins (Standard)</option>
                                <option value="500,000 Coins">500,000 Coins (Prime Merchant)</option>
                                <option value="1,000,000+ Coins">1,000,000+ Coins (Enterprise)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Expected Monthly Coin Sales</label>
                            <select
                                value={formData.monthlyTurnover}
                                onChange={e => updateField('monthlyTurnover', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400"
                            >
                                <option value="₹20,000 - ₹50,000">₹20,000 - ₹50,000</option>
                                <option value="₹50,000 - ₹2,00,000">₹50,000 - ₹2,00,000</option>
                                <option value="₹2,00,000+">₹2,00,000+</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Payout UPI ID / Bank Account Details *</label>
                        <input
                            type="text"
                            value={formData.payoutUpiOrBank}
                            onChange={e => updateField('payoutUpiOrBank', e.target.value)}
                            placeholder="e.g. merchant@upi or HDFC A/C: 50100..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Business Verification */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. Commercial Verification</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Commercial / Partner Reference</label>
                        <input
                            type="text"
                            value={formData.businessReference}
                            onChange={e => updateField('businessReference', e.target.value)}
                            placeholder="Name & Contact Number of Partner"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">GST Identification Number (If Applicable)</label>
                        <input
                            type="text"
                            value={formData.gstNo}
                            onChange={e => updateField('gstNo', e.target.value)}
                            placeholder="e.g. 27AAAAA0000A1Z5"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-amber-400 font-mono"
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Documents & KYC */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">4. Identity Verification Documents & Merchant Oath</h3>
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
                            label="Business CV / Financial Resume"
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

                    <div className="pt-3">
                        <label className="flex items-start gap-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                            <input
                                type="checkbox"
                                checked={formData.agreedToTerms}
                                onChange={e => updateField('agreedToTerms', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-amber-500 rounded"
                            />
                            <span className="text-xs text-white/80 leading-relaxed">
                                I declare that all business information provided is true and accurate. I agree to uphold Meethi Chat Coin Merchant Terms & Regulations.
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function SellerApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Seller Merchant Portal...</div>}>
            <SellerFormContent />
        </Suspense>
    );
}
