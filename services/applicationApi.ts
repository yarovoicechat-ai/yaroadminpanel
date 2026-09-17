import { ApplicationFormData, ApplicationApiResponse } from '../types/application';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function submitTeamLeaderApplication(formData: ApplicationFormData): Promise<ApplicationApiResponse> {
    try {
        const formDataPayload = new FormData();

        // Append text fields
        formDataPayload.append('fullName', formData.fullName);
        formDataPayload.append('emailAddress', formData.emailAddress);
        formDataPayload.append('mobileNumber', formData.mobileNumber);
        if (formData.whatsAppNumber) formDataPayload.append('whatsAppNumber', formData.whatsAppNumber);
        if (formData.dob) formDataPayload.append('dob', formData.dob);
        if (formData.gender) formDataPayload.append('gender', formData.gender);
        formDataPayload.append('country', formData.country);
        formDataPayload.append('state', formData.state);
        formDataPayload.append('city', formData.city);

        if (formData.currentCompany) formDataPayload.append('currentCompany', formData.currentCompany);
        if (formData.currentDesignation) formDataPayload.append('currentDesignation', formData.currentDesignation);
        formDataPayload.append('yearsOfExperience', formData.yearsOfExperience);
        if (formData.highestQualification) formDataPayload.append('highestQualification', formData.highestQualification);
        formDataPayload.append('skills', JSON.stringify(formData.skills));

        formDataPayload.append('linkedInProfile', formData.linkedInProfile);
        if (formData.portfolioWebsite) formDataPayload.append('portfolioWebsite', formData.portfolioWebsite);
        if (formData.gitHubProfile) formDataPayload.append('gitHubProfile', formData.gitHubProfile);

        if (formData.expectedSalary) formDataPayload.append('expectedSalary', formData.expectedSalary);
        if (formData.availableJoiningDate) formDataPayload.append('availableJoiningDate', formData.availableJoiningDate);
        formDataPayload.append('whyJoinUs', formData.whyJoinUs);
        formDataPayload.append('personalNote', formData.personalNote);

        // Append file attachments
        if (formData.resume instanceof File) formDataPayload.append('resume', formData.resume);
        else if (typeof formData.resume === 'string') formDataPayload.append('resumeUrl', formData.resume);

        if (formData.portfolioPdf instanceof File) formDataPayload.append('portfolioPdf', formData.portfolioPdf);
        else if (typeof formData.portfolioPdf === 'string') formDataPayload.append('portfolioPdfUrl', formData.portfolioPdf);

        if (formData.experienceLetter instanceof File) formDataPayload.append('experienceLetter', formData.experienceLetter);
        else if (typeof formData.experienceLetter === 'string') formDataPayload.append('experienceLetterUrl', formData.experienceLetter);

        if (formData.addressProof instanceof File) formDataPayload.append('addressProof', formData.addressProof);
        else if (typeof formData.addressProof === 'string') formDataPayload.append('addressProofUrl', formData.addressProof);

        if (formData.governmentIdProof instanceof File) formDataPayload.append('governmentIdProof', formData.governmentIdProof);
        else if (typeof formData.governmentIdProof === 'string') formDataPayload.append('governmentIdProofUrl', formData.governmentIdProof);

        if (formData.profilePhoto instanceof File) formDataPayload.append('profilePhoto', formData.profilePhoto);
        else if (typeof formData.profilePhoto === 'string') formDataPayload.append('profilePhotoUrl', formData.profilePhoto);

        // Try multipart submission first, fallback to JSON payload
        let response = await fetch(`${API_BASE_URL}/api/teamleader/apply`, {
            method: 'POST',
            body: formDataPayload,
        });

        // Fallback to JSON payload if multipart is not explicitly configured on API endpoint
        if (!response.ok && response.status === 400) {
            const jsonBody = {
                fullName: formData.fullName,
                emailAddress: formData.emailAddress,
                mobileNumber: formData.mobileNumber,
                whatsAppNumber: formData.whatsAppNumber,
                dob: formData.dob,
                gender: formData.gender,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                currentCompany: formData.currentCompany,
                currentDesignation: formData.currentDesignation,
                yearsOfExperience: formData.yearsOfExperience,
                highestQualification: formData.highestQualification,
                skills: formData.skills,
                linkedInProfile: formData.linkedInProfile,
                portfolioWebsite: formData.portfolioWebsite,
                gitHubProfile: formData.gitHubProfile,
                expectedSalary: formData.expectedSalary,
                availableJoiningDate: formData.availableJoiningDate,
                whyJoinUs: formData.whyJoinUs,
                personalNote: formData.personalNote,
                resumeUrl: typeof formData.resume === 'string' ? formData.resume : (formData.resume?.name || ''),
                portfolioPdfUrl: typeof formData.portfolioPdf === 'string' ? formData.portfolioPdf : (formData.portfolioPdf?.name || ''),
                experienceLetterUrl: typeof formData.experienceLetter === 'string' ? formData.experienceLetter : (formData.experienceLetter?.name || ''),
                addressProofUrl: typeof formData.addressProof === 'string' ? formData.addressProof : (formData.addressProof?.name || ''),
                governmentIdUrl: typeof formData.governmentIdProof === 'string' ? formData.governmentIdProof : (formData.governmentIdProof?.name || ''),
                profilePhotoUrl: typeof formData.profilePhoto === 'string' ? formData.profilePhoto : (formData.profilePhoto?.name || ''),
            };

            response = await fetch(`${API_BASE_URL}/api/teamleader/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonBody),
            });
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to communicate with recruitment backend.',
        };
    }
}
