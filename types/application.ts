export interface ApplicationFormData {
    // Personal Information
    fullName: string;
    emailAddress: string;
    mobileNumber: string;
    whatsAppNumber?: string;
    dob?: string;
    gender?: string;
    country: string;
    state: string;
    city: string;

    // Professional Information
    currentCompany?: string;
    currentDesignation?: string;
    yearsOfExperience: string;
    highestQualification?: string;
    skills: string[];

    // Social Links
    linkedInProfile: string;
    portfolioWebsite?: string;
    gitHubProfile?: string;

    // Upload Files / URLs
    resume: File | string | null;
    portfolioPdf?: File | string | null;
    experienceLetter?: File | string | null;
    addressProof: File | string | null;
    governmentIdProof: File | string | null;
    profilePhoto?: File | string | null;

    // Application Details
    expectedSalary?: string;
    availableJoiningDate?: string;
    whyJoinUs: string;
    personalNote: string;

    // Declaration
    confirmedTrue: boolean;
}

export type FormValidationErrors = Partial<Record<keyof ApplicationFormData, string>>;

export interface ApplicationApiResponse {
    success: boolean;
    message: string;
    data?: any;
}
