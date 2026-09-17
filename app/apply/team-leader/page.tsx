'use client';

import React, { useState, Suspense } from 'react';
import { User, Briefcase, Share2, Upload, FileText, CheckCircle, Plus, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { ApplicationFormData } from '@/types/application';
import { useFormValidation } from '@/hooks/useFormValidation';
import { submitTeamLeaderApplication } from '@/services/applicationApi';
import { FormInput } from '@/components/role-create/FormInput';
import { FileUpload } from '@/components/role-create/FileUpload';
import { SectionTitle } from '@/components/role-create/SectionTitle';
import { Button } from '@/components/role-create/Button';
import { LanguageSelector } from '@/components/role-create/LanguageSelector';

const initialFormData: ApplicationFormData = {
    fullName: '',
    emailAddress: '',
    mobileNumber: '',
    whatsAppNumber: '',
    dob: '',
    gender: 'male',
    country: 'India',
    state: '',
    city: '',

    currentCompany: '',
    currentDesignation: '',
    yearsOfExperience: '',
    highestQualification: '',
    skills: [],

    linkedInProfile: '',
    portfolioWebsite: '',
    gitHubProfile: '',

    resume: null,
    adharFront: null,
    adharBack: null,
    pan: null,
    portfolioPdf: null,
    experienceLetter: null,
    addressProof: null,
    governmentIdProof: null,
    profilePhoto: null,

    expectedSalary: '',
    availableJoiningDate: '',
    whyJoinUs: '',
    personalNote: '',

    confirmedTrue: false,
};

function TeamLeaderApplicationContent() {
    const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
    const [skillInput, setSkillInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const { errors, validateField, validateForm, clearError } = useFormValidation(formData);

    const handleTextChange = (field: keyof ApplicationFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        clearError(field);
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }));
    };

    const handleReset = () => {
        setFormData(initialFormData);
        toast.info('Form has been reset');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateForm();
        if (!isValid) {
            toast.error('Please fix all highlighted errors before submitting.');
            return;
        }

        try {
            setSubmitting(true);
            const response = await submitTeamLeaderApplication(formData);

            if (response.success) {
                setSuccess(true);
                toast.success('Application Submitted Successfully!');
            } else {
                toast.error(response.message || 'Application submission failed.');
            }
        } catch {
            toast.error('Network error occurred during submission.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#6A11CB] via-[#a21caf] to-[#FF0099] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-white/10 backdrop-blur-2xl border border-white/30 p-10 rounded-[20px] text-white shadow-2xl animate-fade-in">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black tracking-wide">Application Submitted Successfully</h2>
                    <p className="text-white/80 text-sm">
                        Thank you for applying to Voice Call Club. Our Team Leader recruitment division will contact you shortly.
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-white/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Redirecting in 3 seconds...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#6A11CB] via-[#86198f] to-[#FF0099] flex flex-col items-center py-10 px-4 text-white">
            
            {/* Top Language Selector */}
            <div className="max-w-[900px] w-full mb-6">
                <LanguageSelector />
            </div>

            {/* Main Centered Glass Container */}
            <div className="max-w-[900px] w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[20px] p-6 md:p-12 text-white shadow-2xl space-y-8">
                
                {/* Header Section */}
                <div className="text-center space-y-3 border-b border-white/10 pb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wider uppercase">
                        <Sparkles size={14} className="text-amber-300" /> Voice Call Club Hiring Portal
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-amber-200 bg-clip-text text-transparent uppercase">
                        TEAM LEADER APPLICATION FORM
                    </h1>
                    <p className="text-xs md:text-sm text-white/80 max-w-xl mx-auto font-medium">
                        Please complete all required fields to apply as a Team Leader.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Section 1: Personal Information */}
                    <div className="space-y-4">
                        <SectionTitle title="Personal Information" icon={User} description="Basic details & contact details" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Full Name"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={(e) => handleTextChange('fullName', e.target.value)}
                                error={errors.fullName}
                                placeholder="e.g. Rahul Sharma"
                            />
                            <FormInput
                                label="Email Address"
                                name="emailAddress"
                                type="email"
                                required
                                value={formData.emailAddress}
                                onChange={(e) => handleTextChange('emailAddress', e.target.value)}
                                error={errors.emailAddress}
                                placeholder="rahul@example.com"
                            />
                            <FormInput
                                label="Mobile Number"
                                name="mobileNumber"
                                type="tel"
                                required
                                value={formData.mobileNumber}
                                onChange={(e) => handleTextChange('mobileNumber', e.target.value)}
                                error={errors.mobileNumber}
                                placeholder="+91 9876543210"
                            />
                            <FormInput
                                label="WhatsApp Number"
                                name="whatsAppNumber"
                                type="tel"
                                value={formData.whatsAppNumber || ''}
                                onChange={(e) => handleTextChange('whatsAppNumber', e.target.value)}
                                placeholder="+91 9876543210"
                            />
                            <FormInput
                                label="Date of Birth"
                                name="dob"
                                type="date"
                                value={formData.dob || ''}
                                onChange={(e) => handleTextChange('dob', e.target.value)}
                            />
                            <FormInput
                                label="Gender"
                                name="gender"
                                type="select"
                                value={formData.gender || 'male'}
                                onChange={(e) => handleTextChange('gender', e.target.value)}
                                options={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                            <FormInput
                                label="Country"
                                name="country"
                                required
                                value={formData.country}
                                onChange={(e) => handleTextChange('country', e.target.value)}
                                error={errors.country}
                            />
                            <FormInput
                                label="State"
                                name="state"
                                required
                                value={formData.state}
                                onChange={(e) => handleTextChange('state', e.target.value)}
                                error={errors.state}
                                placeholder="e.g. Maharashtra"
                            />
                            <FormInput
                                label="City"
                                name="city"
                                required
                                value={formData.city}
                                onChange={(e) => handleTextChange('city', e.target.value)}
                                error={errors.city}
                                placeholder="e.g. Mumbai"
                            />
                            <FormInput
                                label="District"
                                name="district"
                                value={formData.district || ''}
                                onChange={(e) => handleTextChange('district', e.target.value)}
                                placeholder="e.g. Mumbai City"
                            />
                        </div>
                    </div>

                    {/* Section 2: Professional Information */}
                    <div className="space-y-4">
                        <SectionTitle title="Professional Information" icon={Briefcase} description="Work history & skill highlights" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Current Company"
                                name="currentCompany"
                                value={formData.currentCompany || ''}
                                onChange={(e) => handleTextChange('currentCompany', e.target.value)}
                                placeholder="Current employer name"
                            />
                            <FormInput
                                label="Current Designation"
                                name="currentDesignation"
                                value={formData.currentDesignation || ''}
                                onChange={(e) => handleTextChange('currentDesignation', e.target.value)}
                                placeholder="e.g. Team Lead / Operations Lead"
                            />
                            <FormInput
                                label="Years of Experience"
                                name="yearsOfExperience"
                                required
                                value={formData.yearsOfExperience}
                                onChange={(e) => handleTextChange('yearsOfExperience', e.target.value)}
                                error={errors.yearsOfExperience}
                                placeholder="e.g. 4 Years"
                            />
                            <FormInput
                                label="Highest Qualification"
                                name="highestQualification"
                                value={formData.highestQualification || ''}
                                onChange={(e) => handleTextChange('highestQualification', e.target.value)}
                                placeholder="e.g. Bachelor's / Master's"
                            />
                        </div>

                        {/* Interactive Multi-Select Skills */}
                        <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-semibold text-white/90">Skills (Multi-select)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a skill and click Add..."
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                    className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold px-4 py-2.5 rounded-full text-xs shrink-0 flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                            {formData.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {formData.skills.map((s) => (
                                        <span
                                            key={s}
                                            className="bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-medium"
                                        >
                                            {s}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(s)}
                                                className="hover:text-pink-300 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Social Links */}
                    <div className="space-y-4">
                        <SectionTitle title="Social Links" icon={Share2} description="Online portfolio & profiles" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="LinkedIn Profile"
                                name="linkedInProfile"
                                type="url"
                                required
                                value={formData.linkedInProfile}
                                onChange={(e) => handleTextChange('linkedInProfile', e.target.value)}
                                error={errors.linkedInProfile}
                                placeholder="https://linkedin.com/in/username"
                            />
                            <FormInput
                                label="Portfolio Website"
                                name="portfolioWebsite"
                                type="url"
                                value={formData.portfolioWebsite || ''}
                                onChange={(e) => handleTextChange('portfolioWebsite', e.target.value)}
                                placeholder="https://myportfolio.com"
                            />
                            <FormInput
                                label="GitHub Profile"
                                name="gitHubProfile"
                                type="url"
                                value={formData.gitHubProfile || ''}
                                onChange={(e) => handleTextChange('gitHubProfile', e.target.value)}
                                placeholder="https://github.com/username"
                            />
                        </div>
                    </div>

                    {/* Section 4: Uploads */}
                    <div className="space-y-4">
                        <SectionTitle title="Uploads" icon={Upload} description="Documents (Max 10 MB per file | Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG)" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FileUpload
                                label="Resume / CV"
                                name="resume"
                                required
                                value={formData.resume}
                                onChange={(file) => handleTextChange('resume', file)}
                                error={errors.resume}
                            />
                            <FileUpload
                                label="Portfolio PDF"
                                name="portfolioPdf"
                                value={formData.portfolioPdf || null}
                                onChange={(file) => handleTextChange('portfolioPdf', file)}
                            />
                            <FileUpload
                                label="Experience Letter"
                                name="experienceLetter"
                                value={formData.experienceLetter || null}
                                onChange={(file) => handleTextChange('experienceLetter', file)}
                            />
                            <FileUpload
                                label="Address Proof"
                                name="addressProof"
                                required
                                value={formData.addressProof}
                                onChange={(file) => handleTextChange('addressProof', file)}
                                error={errors.addressProof}
                            />
                            <FileUpload
                                label="Government ID Proof"
                                name="governmentIdProof"
                                required
                                value={formData.governmentIdProof}
                                onChange={(file) => handleTextChange('governmentIdProof', file)}
                                error={errors.governmentIdProof}
                            />
                            <FileUpload
                                label="Aadhaar Card Front Side"
                                name="adharFront"
                                value={formData.adharFront || null}
                                onChange={(file) => handleTextChange('adharFront', file)}
                            />
                            <FileUpload
                                label="Aadhaar Card Back Side"
                                name="adharBack"
                                value={formData.adharBack || null}
                                onChange={(file) => handleTextChange('adharBack', file)}
                            />
                            <FileUpload
                                label="PAN Card"
                                name="pan"
                                value={formData.pan || null}
                                onChange={(file) => handleTextChange('pan', file)}
                            />
                            <FileUpload
                                label="Profile Photo"
                                name="profilePhoto"
                                value={formData.profilePhoto || null}
                                onChange={(file) => handleTextChange('profilePhoto', file)}
                            />
                        </div>
                    </div>

                    {/* Section 5: Application Details */}
                    <div className="space-y-4">
                        <SectionTitle title="Application Details" icon={FileText} description="Expectations & personal note" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Expected Salary"
                                name="expectedSalary"
                                value={formData.expectedSalary || ''}
                                onChange={(e) => handleTextChange('expectedSalary', e.target.value)}
                                placeholder="e.g. ₹8,000,000 / annum"
                            />
                            <FormInput
                                label="Available Joining Date"
                                name="availableJoiningDate"
                                type="date"
                                value={formData.availableJoiningDate || ''}
                                onChange={(e) => handleTextChange('availableJoiningDate', e.target.value)}
                            />
                        </div>

                        <FormInput
                            label="Why do you want to join us?"
                            name="whyJoinUs"
                            type="textarea"
                            required
                            rows={3}
                            value={formData.whyJoinUs}
                            onChange={(e) => handleTextChange('whyJoinUs', e.target.value)}
                            error={errors.whyJoinUs}
                            placeholder="Tell us what motivates you to join Voice Call Club..."
                        />

                        <FormInput
                            label="Personal Note"
                            name="personalNote"
                            type="textarea"
                            required
                            rows={3}
                            value={formData.personalNote}
                            onChange={(e) => handleTextChange('personalNote', e.target.value)}
                            error={errors.personalNote}
                            placeholder="Share any additional details about your leadership style..."
                        />
                    </div>

                    {/* Section 6: Declaration */}
                    <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-white/90 bg-white/10 border border-white/20 p-4 rounded-2xl">
                            <input
                                type="checkbox"
                                checked={formData.confirmedTrue}
                                onChange={(e) => handleTextChange('confirmedTrue', e.target.checked)}
                                className="w-5 h-5 rounded text-orange-500 focus:ring-0 cursor-pointer shrink-0"
                            />
                            <span>I confirm that all information provided is true and accurate to the best of my knowledge. *</span>
                        </label>
                        {errors.confirmedTrue && (
                            <p className="text-pink-300 text-xs font-semibold mt-1.5">{errors.confirmedTrue}</p>
                        )}
                    </div>

                    {/* Section 7: Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-white/10">
                        <Button type="button" variant="secondary" onClick={handleReset}>
                            Reset Form
                        </Button>
                        <Button type="submit" variant="primary" loading={submitting}>
                            Submit Application
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default function TeamLeaderApplicationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#6A11CB] text-white flex items-center justify-center">Loading Team Leader Portal...</div>}>
            <TeamLeaderApplicationContent />
        </Suspense>
    );
}
