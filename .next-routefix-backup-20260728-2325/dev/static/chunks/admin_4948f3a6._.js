(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/admin/hooks/useFormValidation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFormValidation",
    ()=>useFormValidation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useFormValidation(formData) {
    _s();
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const validateField = (name, value)=>{
        let error = '';
        switch(name){
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
    const validateForm = ()=>{
        const newErrors = {};
        const requiredFields = [
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
            'confirmedTrue'
        ];
        requiredFields.forEach((field)=>{
            const err = validateField(field, formData[field]);
            if (err) {
                newErrors[field] = err;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const clearError = (field)=>{
        setErrors((prev)=>{
            const next = {
                ...prev
            };
            delete next[field];
            return next;
        });
    };
    return {
        errors,
        setErrors,
        validateField,
        validateForm,
        clearError
    };
}
_s(useFormValidation, "o+SUXTQUSJNurFcpxixiLrA9BM0=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/services/applicationApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "submitTeamLeaderApplication",
    ()=>submitTeamLeaderApplication
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/admin/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = ("TURBOPACK compile-time value", "https://api.mithichat.live") || 'https://api.mithichat.live';
async function submitTeamLeaderApplication(formData) {
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
            body: formDataPayload
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
                resumeUrl: typeof formData.resume === 'string' ? formData.resume : formData.resume?.name || '',
                portfolioPdfUrl: typeof formData.portfolioPdf === 'string' ? formData.portfolioPdf : formData.portfolioPdf?.name || '',
                experienceLetterUrl: typeof formData.experienceLetter === 'string' ? formData.experienceLetter : formData.experienceLetter?.name || '',
                addressProofUrl: typeof formData.addressProof === 'string' ? formData.addressProof : formData.addressProof?.name || '',
                governmentIdUrl: typeof formData.governmentIdProof === 'string' ? formData.governmentIdProof : formData.governmentIdProof?.name || '',
                profilePhotoUrl: typeof formData.profilePhoto === 'string' ? formData.profilePhoto : formData.profilePhoto?.name || ''
            };
            response = await fetch(`${API_BASE_URL}/api/teamleader/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonBody)
            });
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            message: error?.message || 'Failed to communicate with recruitment backend.'
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/role-create/FormInput.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormInput",
    ()=>FormInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
const FormInput = ({ label, name, type = 'text', placeholder, value, onChange, required = false, error, options = [], rows = 3, ariaLabel })=>{
    const inputId = `input-${name}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1.5 text-left",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: inputId,
                className: "block text-xs font-semibold text-white/90",
                children: [
                    label,
                    " ",
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-pink-400 font-bold",
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/FormInput.tsx",
                        lineNumber: 37,
                        columnNumber: 38
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/role-create/FormInput.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            type === 'select' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                id: inputId,
                name: name,
                value: value,
                onChange: onChange,
                "aria-label": ariaLabel || label,
                "aria-required": required,
                "aria-invalid": Boolean(error),
                className: `w-full bg-white/20 border text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${error ? 'border-pink-400 focus:ring-pink-400' : 'border-white/30 focus:ring-pink-400 hover:border-white/50'}`,
                children: options.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: opt.value,
                        className: "bg-slate-900 text-white",
                        children: opt.label
                    }, opt.value, false, {
                        fileName: "[project]/admin/components/role-create/FormInput.tsx",
                        lineNumber: 56,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/admin/components/role-create/FormInput.tsx",
                lineNumber: 41,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)) : type === 'textarea' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                id: inputId,
                name: name,
                rows: rows,
                placeholder: placeholder,
                value: value,
                onChange: onChange,
                "aria-label": ariaLabel || label,
                "aria-required": required,
                "aria-invalid": Boolean(error),
                className: `w-full bg-white/20 border text-white placeholder-white/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${error ? 'border-pink-400 focus:ring-pink-400' : 'border-white/30 focus:ring-pink-400 hover:border-white/50'}`
            }, void 0, false, {
                fileName: "[project]/admin/components/role-create/FormInput.tsx",
                lineNumber: 62,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                id: inputId,
                name: name,
                type: type,
                placeholder: placeholder,
                value: value,
                onChange: onChange,
                "aria-label": ariaLabel || label,
                "aria-required": required,
                "aria-invalid": Boolean(error),
                className: `w-full bg-white/20 border text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${error ? 'border-pink-400 focus:ring-pink-400' : 'border-white/30 focus:ring-pink-400 hover:border-white/50'}`
            }, void 0, false, {
                fileName: "[project]/admin/components/role-create/FormInput.tsx",
                lineNumber: 79,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-pink-300 text-xs font-semibold mt-1 animate-pulse",
                children: error
            }, void 0, false, {
                fileName: "[project]/admin/components/role-create/FormInput.tsx",
                lineNumber: 97,
                columnNumber: 23
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/role-create/FormInput.tsx",
        lineNumber: 35,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c = FormInput;
var _c;
__turbopack_context__.k.register(_c, "FormInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/role-create/FileUpload.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileUpload",
    ()=>FileUpload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadCloud$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/cloud-upload.js [app-client] (ecmascript) <export default as UploadCloud>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const FileUpload = ({ label, name, required = false, value, onChange, error: propError, acceptedFormats = [
    'pdf',
    'doc',
    'docx',
    'png',
    'jpg',
    'jpeg'
], maxSizeMB = 10 })=>{
    _s();
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [localError, setLocalError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [urlInput, setUrlInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(typeof value === 'string' ? value : '');
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const validateAndProcessFile = (file)=>{
        setLocalError('');
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!acceptedFormats.includes(extension)) {
            const errStr = `Only ${acceptedFormats.join(', ').toUpperCase()} formats are allowed.`;
            setLocalError(errStr);
            return;
        }
        if (file.size > maxSizeBytes) {
            const errStr = `File size exceeds the maximum limit of ${maxSizeMB} MB.`;
            setLocalError(errStr);
            return;
        }
        onChange(file);
    };
    const handleFileChange = (e)=>{
        if (e.target.files && e.target.files[0]) {
            validateAndProcessFile(e.target.files[0]);
        }
    };
    const handleUrlBlur = ()=>{
        if (urlInput.trim()) {
            onChange(urlInput.trim());
        }
    };
    const displayedError = propError || localError;
    const fileName = value instanceof File ? value.name : typeof value === 'string' ? value : '';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1.5 text-left",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-xs font-semibold text-white/90",
                children: [
                    label,
                    " ",
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-pink-400 font-bold",
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                        lineNumber: 70,
                        columnNumber: 38
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                lineNumber: 69,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `bg-white/20 border rounded-2xl p-4 transition-all ${displayedError ? 'border-pink-400 bg-pink-500/10' : value ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/30 hover:border-white/50'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col sm:flex-row items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileInputRef,
                                type: "file",
                                accept: acceptedFormats.map((f)=>`.${f}`).join(','),
                                onChange: handleFileChange,
                                className: "hidden"
                            }, void 0, false, {
                                fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                                lineNumber: 83,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>fileInputRef.current?.click(),
                                className: "bg-white/20 hover:bg-white/30 border border-white/40 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-all shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UploadCloud$3e$__["UploadCloud"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                                        lineNumber: 96,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    " Choose File"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                                lineNumber: 91,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 text-center sm:text-left overflow-hidden w-full",
                                children: fileName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-300 font-semibold truncate",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                            size: 14,
                                            className: "shrink-0 text-emerald-400"
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                                            lineNumber: 102,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate",
                                            children: fileName
                                        }, void 0, false, {
                                            fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                                            lineNumber: 103,
                                            columnNumber: 33
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                                    lineNumber: 101,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-white/60",
                                    children: [
                                        "PDF, DOC, PNG, JPG (Max ",
                                        maxSizeMB,
                                        " MB)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                                    lineNumber: 106,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                                lineNumber: 99,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                        lineNumber: 82,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3 pt-2 border-t border-white/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Or paste document link/URL...",
                            value: urlInput,
                            onChange: (e)=>{
                                setUrlInput(e.target.value);
                                onChange(e.target.value);
                            },
                            onBlur: handleUrlBlur,
                            className: "w-full bg-transparent text-white placeholder-white/40 text-xs focus:outline-none"
                        }, void 0, false, {
                            fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                            lineNumber: 115,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                        lineNumber: 114,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                lineNumber: 73,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            displayedError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-pink-300 text-xs font-semibold mt-1 flex items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        size: 13
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                        lineNumber: 131,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    " ",
                    displayedError
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/role-create/FileUpload.tsx",
                lineNumber: 130,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/role-create/FileUpload.tsx",
        lineNumber: 68,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(FileUpload, "FmosmeyiW10M40uveSIEeYDtWi8=");
_c = FileUpload;
var _c;
__turbopack_context__.k.register(_c, "FileUpload");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/role-create/SectionTitle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SectionTitle",
    ()=>SectionTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
const SectionTitle = ({ title, icon: Icon, description })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-b border-white/20 pb-3 mb-5 text-left",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2.5",
            children: [
                Icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-2 rounded-xl bg-white/20 border border-white/30 text-white shadow-sm",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        size: 18
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/SectionTitle.tsx",
                        lineNumber: 18,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/admin/components/role-create/SectionTitle.tsx",
                    lineNumber: 17,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-base font-extrabold tracking-wider text-white uppercase",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/admin/components/role-create/SectionTitle.tsx",
                            lineNumber: 22,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-white/70 font-medium mt-0.5",
                            children: description
                        }, void 0, false, {
                            fileName: "[project]/admin/components/role-create/SectionTitle.tsx",
                            lineNumber: 23,
                            columnNumber: 37
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/components/role-create/SectionTitle.tsx",
                    lineNumber: 21,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/admin/components/role-create/SectionTitle.tsx",
            lineNumber: 15,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/admin/components/role-create/SectionTitle.tsx",
        lineNumber: 14,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c = SectionTitle;
var _c;
__turbopack_context__.k.register(_c, "SectionTitle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/role-create/Button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
'use client';
;
;
const Button = ({ type = 'button', variant = 'primary', onClick, disabled = false, loading = false, children, className = '' })=>{
    const baseStyle = 'font-bold px-8 py-2.5 rounded-full text-sm transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30',
        secondary: 'bg-white hover:bg-slate-100 text-slate-900 shadow-md',
        outline: 'border border-white/40 hover:bg-white/10 text-white'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: type,
        onClick: onClick,
        disabled: disabled || loading,
        className: `${baseStyle} ${variants[variant]} ${className}`,
        children: [
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                size: 16,
                className: "animate-spin text-white"
            }, void 0, false, {
                fileName: "[project]/admin/components/role-create/Button.tsx",
                lineNumber: 42,
                columnNumber: 25
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/role-create/Button.tsx",
        lineNumber: 36,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Button;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/components/role-create/LanguageSelector.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageSelector",
    ()=>LanguageSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const LanguageSelector = ()=>{
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageSelector.useEffect": ()=>{
            // Initialize Google Translate script if not already added
            if (!document.getElementById('google-translate-script')) {
                const addScript = document.createElement('script');
                addScript.id = 'google-translate-script';
                addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                addScript.async = true;
                document.body.appendChild(addScript);
                window.googleTranslateElementInit = ({
                    "LanguageSelector.useEffect": ()=>{
                        new window.google.translate.TranslateElement({
                            pageLanguage: 'en',
                            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                        }, 'google_translate_element');
                    }
                })["LanguageSelector.useEffect"];
            }
        }
    }["LanguageSelector.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col sm:flex-row items-center justify-between gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-white/90 shadow-sm text-xs",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                        size: 15,
                        className: "text-pink-300 animate-spin-slow"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/LanguageSelector.tsx",
                        lineNumber: 31,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-semibold text-white",
                        children: "Select Language"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/LanguageSelector.tsx",
                        lineNumber: 32,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/role-create/LanguageSelector.tsx",
                lineNumber: 30,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "google_translate_element",
                        className: "google-translate-container"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/LanguageSelector.tsx",
                        lineNumber: 36,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-white/60 font-medium whitespace-nowrap",
                        children: "Powered by Google Translate"
                    }, void 0, false, {
                        fileName: "[project]/admin/components/role-create/LanguageSelector.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/admin/components/role-create/LanguageSelector.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/role-create/LanguageSelector.tsx",
        lineNumber: 29,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LanguageSelector, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = LanguageSelector;
var _c;
__turbopack_context__.k.register(_c, "LanguageSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/admin/app/apply/team-leader/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeamLeaderApplicationPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-client] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/share-2.js [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$hooks$2f$useFormValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/hooks/useFormValidation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$services$2f$applicationApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/services/applicationApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/role-create/FormInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/role-create/FileUpload.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$SectionTitle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/role-create/SectionTitle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/role-create/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$LanguageSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/components/role-create/LanguageSelector.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
const initialFormData = {
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
    confirmedTrue: false
};
function TeamLeaderApplicationContent() {
    _s();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialFormData);
    const [skillInput, setSkillInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { errors, validateField, validateForm, clearError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$hooks$2f$useFormValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormValidation"])(formData);
    const handleTextChange = (field, value)=>{
        setFormData((prev)=>({
                ...prev,
                [field]: value
            }));
        clearError(field);
    };
    const handleAddSkill = ()=>{
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData((prev)=>({
                    ...prev,
                    skills: [
                        ...prev.skills,
                        skillInput.trim()
                    ]
                }));
            setSkillInput('');
        }
    };
    const handleRemoveSkill = (skillToRemove)=>{
        setFormData((prev)=>({
                ...prev,
                skills: prev.skills.filter((s)=>s !== skillToRemove)
            }));
    };
    const handleReset = ()=>{
        setFormData(initialFormData);
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info('Form has been reset');
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        const isValid = validateForm();
        if (!isValid) {
            __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Please fix all highlighted errors before submitting.');
            return;
        }
        try {
            setSubmitting(true);
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$services$2f$applicationApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["submitTeamLeaderApplication"])(formData);
            if (response.success) {
                setSuccess(true);
                __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Application Submitted Successfully!');
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(response.message || 'Application submission failed.');
            }
        } catch  {
            __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Network error occurred during submission.');
        } finally{
            setSubmitting(false);
        }
    };
    if (success) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#6A11CB] via-[#a21caf] to-[#FF0099] flex items-center justify-center p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-md w-full text-center space-y-6 bg-white/10 backdrop-blur-2xl border border-white/30 p-10 rounded-[20px] text-white shadow-2xl animate-fade-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto animate-bounce",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                            className: "w-12 h-12 text-emerald-400"
                        }, void 0, false, {
                            fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                            lineNumber: 115,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                        lineNumber: 114,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-3xl font-black tracking-wide",
                        children: "Application Submitted Successfully"
                    }, void 0, false, {
                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                        lineNumber: 117,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-white/80 text-sm",
                        children: "Thank you for applying to Mithi Chat. Our Team Leader recruitment division will contact you shortly."
                    }, void 0, false, {
                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                        lineNumber: 118,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-white/60",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-2 h-2 rounded-full bg-emerald-400 animate-ping"
                            }, void 0, false, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 122,
                                columnNumber: 25
                            }, this),
                            "Redirecting in 3 seconds..."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                        lineNumber: 121,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                lineNumber: 113,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/admin/app/apply/team-leader/page.tsx",
            lineNumber: 112,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#6A11CB] via-[#86198f] to-[#FF0099] flex flex-col items-center py-10 px-4 text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[900px] w-full mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$LanguageSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LanguageSelector"], {}, void 0, false, {
                    fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                    lineNumber: 135,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                lineNumber: 134,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[900px] w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[20px] p-6 md:p-12 text-white shadow-2xl space-y-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center space-y-3 border-b border-white/10 pb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wider uppercase",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        size: 14,
                                        className: "text-amber-300"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 144,
                                        columnNumber: 25
                                    }, this),
                                    " Mithi Chat Hiring Portal"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 143,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-amber-200 bg-clip-text text-transparent uppercase",
                                children: "TEAM LEADER APPLICATION FORM"
                            }, void 0, false, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 146,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs md:text-sm text-white/80 max-w-xl mx-auto font-medium",
                                children: "Please complete all required fields to apply as a Team Leader."
                            }, void 0, false, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 149,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                        lineNumber: 142,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSubmit,
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$SectionTitle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SectionTitle"], {
                                        title: "Personal Information",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
                                        description: "Basic details & contact details"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 158,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Full Name",
                                                name: "fullName",
                                                required: true,
                                                value: formData.fullName,
                                                onChange: (e)=>handleTextChange('fullName', e.target.value),
                                                error: errors.fullName,
                                                placeholder: "e.g. Rahul Sharma"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 161,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Email Address",
                                                name: "emailAddress",
                                                type: "email",
                                                required: true,
                                                value: formData.emailAddress,
                                                onChange: (e)=>handleTextChange('emailAddress', e.target.value),
                                                error: errors.emailAddress,
                                                placeholder: "rahul@example.com"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 170,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Mobile Number",
                                                name: "mobileNumber",
                                                type: "tel",
                                                required: true,
                                                value: formData.mobileNumber,
                                                onChange: (e)=>handleTextChange('mobileNumber', e.target.value),
                                                error: errors.mobileNumber,
                                                placeholder: "+91 9876543210"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 180,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "WhatsApp Number",
                                                name: "whatsAppNumber",
                                                type: "tel",
                                                value: formData.whatsAppNumber || '',
                                                onChange: (e)=>handleTextChange('whatsAppNumber', e.target.value),
                                                placeholder: "+91 9876543210"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 190,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Date of Birth",
                                                name: "dob",
                                                type: "date",
                                                value: formData.dob || '',
                                                onChange: (e)=>handleTextChange('dob', e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 198,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Gender",
                                                name: "gender",
                                                type: "select",
                                                value: formData.gender || 'male',
                                                onChange: (e)=>handleTextChange('gender', e.target.value),
                                                options: [
                                                    {
                                                        value: 'male',
                                                        label: 'Male'
                                                    },
                                                    {
                                                        value: 'female',
                                                        label: 'Female'
                                                    },
                                                    {
                                                        value: 'other',
                                                        label: 'Other'
                                                    }
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Country",
                                                name: "country",
                                                required: true,
                                                value: formData.country,
                                                onChange: (e)=>handleTextChange('country', e.target.value),
                                                error: errors.country
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 217,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "State",
                                                name: "state",
                                                required: true,
                                                value: formData.state,
                                                onChange: (e)=>handleTextChange('state', e.target.value),
                                                error: errors.state,
                                                placeholder: "e.g. Maharashtra"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 225,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "City",
                                                name: "city",
                                                required: true,
                                                value: formData.city,
                                                onChange: (e)=>handleTextChange('city', e.target.value),
                                                error: errors.city,
                                                placeholder: "e.g. Mumbai"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 234,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "District",
                                                name: "district",
                                                value: formData.district || '',
                                                onChange: (e)=>handleTextChange('district', e.target.value),
                                                placeholder: "e.g. Mumbai City"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 243,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 160,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 157,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$SectionTitle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SectionTitle"], {
                                        title: "Professional Information",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"],
                                        description: "Work history & skill highlights"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 255,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Current Company",
                                                name: "currentCompany",
                                                value: formData.currentCompany || '',
                                                onChange: (e)=>handleTextChange('currentCompany', e.target.value),
                                                placeholder: "Current employer name"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 258,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Current Designation",
                                                name: "currentDesignation",
                                                value: formData.currentDesignation || '',
                                                onChange: (e)=>handleTextChange('currentDesignation', e.target.value),
                                                placeholder: "e.g. Team Lead / Operations Lead"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 265,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Years of Experience",
                                                name: "yearsOfExperience",
                                                required: true,
                                                value: formData.yearsOfExperience,
                                                onChange: (e)=>handleTextChange('yearsOfExperience', e.target.value),
                                                error: errors.yearsOfExperience,
                                                placeholder: "e.g. 4 Years"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 272,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Highest Qualification",
                                                name: "highestQualification",
                                                value: formData.highestQualification || '',
                                                onChange: (e)=>handleTextChange('highestQualification', e.target.value),
                                                placeholder: "e.g. Bachelor's / Master's"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 281,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5 text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-semibold text-white/90",
                                                children: "Skills (Multi-select)"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 292,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Type a skill and click Add...",
                                                        value: skillInput,
                                                        onChange: (e)=>setSkillInput(e.target.value),
                                                        onKeyDown: (e)=>e.key === 'Enter' && (e.preventDefault(), handleAddSkill()),
                                                        className: "w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                        lineNumber: 294,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleAddSkill,
                                                        className: "bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold px-4 py-2.5 rounded-full text-xs shrink-0 flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                                lineNumber: 307,
                                                                columnNumber: 37
                                                            }, this),
                                                            " Add"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                        lineNumber: 302,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 293,
                                                columnNumber: 29
                                            }, this),
                                            formData.skills.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2 pt-2",
                                                children: formData.skills.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-medium",
                                                        children: [
                                                            s,
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>handleRemoveSkill(s),
                                                                className: "hover:text-pink-300 transition-all",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                    size: 12
                                                                }, void 0, false, {
                                                                    fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                                    lineNumber: 323,
                                                                    columnNumber: 49
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                                lineNumber: 318,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, s, true, {
                                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                        lineNumber: 313,
                                                        columnNumber: 41
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 311,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 291,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 254,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$SectionTitle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SectionTitle"], {
                                        title: "Social Links",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"],
                                        description: "Online portfolio & profiles"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 334,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "LinkedIn Profile",
                                                name: "linkedInProfile",
                                                type: "url",
                                                required: true,
                                                value: formData.linkedInProfile,
                                                onChange: (e)=>handleTextChange('linkedInProfile', e.target.value),
                                                error: errors.linkedInProfile,
                                                placeholder: "https://linkedin.com/in/username"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 337,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Portfolio Website",
                                                name: "portfolioWebsite",
                                                type: "url",
                                                value: formData.portfolioWebsite || '',
                                                onChange: (e)=>handleTextChange('portfolioWebsite', e.target.value),
                                                placeholder: "https://myportfolio.com"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 347,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "GitHub Profile",
                                                name: "gitHubProfile",
                                                type: "url",
                                                value: formData.gitHubProfile || '',
                                                onChange: (e)=>handleTextChange('gitHubProfile', e.target.value),
                                                placeholder: "https://github.com/username"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 355,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 336,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 333,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$SectionTitle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SectionTitle"], {
                                        title: "Uploads",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"],
                                        description: "Documents (Max 10 MB per file | Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG)"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 368,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "Resume / CV",
                                                name: "resume",
                                                required: true,
                                                value: formData.resume,
                                                onChange: (file)=>handleTextChange('resume', file),
                                                error: errors.resume
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 371,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "Portfolio PDF",
                                                name: "portfolioPdf",
                                                value: formData.portfolioPdf || null,
                                                onChange: (file)=>handleTextChange('portfolioPdf', file)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 379,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "Experience Letter",
                                                name: "experienceLetter",
                                                value: formData.experienceLetter || null,
                                                onChange: (file)=>handleTextChange('experienceLetter', file)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 385,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "Address Proof",
                                                name: "addressProof",
                                                required: true,
                                                value: formData.addressProof,
                                                onChange: (file)=>handleTextChange('addressProof', file),
                                                error: errors.addressProof
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 391,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "Government ID Proof",
                                                name: "governmentIdProof",
                                                required: true,
                                                value: formData.governmentIdProof,
                                                onChange: (file)=>handleTextChange('governmentIdProof', file),
                                                error: errors.governmentIdProof
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 399,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "Aadhaar Card Front Side",
                                                name: "adharFront",
                                                value: formData.adharFront || null,
                                                onChange: (file)=>handleTextChange('adharFront', file)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 407,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "Aadhaar Card Back Side",
                                                name: "adharBack",
                                                value: formData.adharBack || null,
                                                onChange: (file)=>handleTextChange('adharBack', file)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 413,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "PAN Card",
                                                name: "pan",
                                                value: formData.pan || null,
                                                onChange: (file)=>handleTextChange('pan', file)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 419,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FileUpload$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FileUpload"], {
                                                label: "Profile Photo",
                                                name: "profilePhoto",
                                                value: formData.profilePhoto || null,
                                                onChange: (file)=>handleTextChange('profilePhoto', file)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 425,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 370,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 367,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$SectionTitle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SectionTitle"], {
                                        title: "Application Details",
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
                                        description: "Expectations & personal note"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 436,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Expected Salary",
                                                name: "expectedSalary",
                                                value: formData.expectedSalary || '',
                                                onChange: (e)=>handleTextChange('expectedSalary', e.target.value),
                                                placeholder: "e.g. ₹8,000,000 / annum"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 439,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                                label: "Available Joining Date",
                                                name: "availableJoiningDate",
                                                type: "date",
                                                value: formData.availableJoiningDate || '',
                                                onChange: (e)=>handleTextChange('availableJoiningDate', e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 446,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 438,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                        label: "Why do you want to join us?",
                                        name: "whyJoinUs",
                                        type: "textarea",
                                        required: true,
                                        rows: 3,
                                        value: formData.whyJoinUs,
                                        onChange: (e)=>handleTextChange('whyJoinUs', e.target.value),
                                        error: errors.whyJoinUs,
                                        placeholder: "Tell us what motivates you to join Mithi Chat..."
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 455,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FormInput"], {
                                        label: "Personal Note",
                                        name: "personalNote",
                                        type: "textarea",
                                        required: true,
                                        rows: 3,
                                        value: formData.personalNote,
                                        onChange: (e)=>handleTextChange('personalNote', e.target.value),
                                        error: errors.personalNote,
                                        placeholder: "Share any additional details about your leadership style..."
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 467,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 435,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "flex items-center gap-3 cursor-pointer text-xs font-semibold text-white/90 bg-white/10 border border-white/20 p-4 rounded-2xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: formData.confirmedTrue,
                                                onChange: (e)=>handleTextChange('confirmedTrue', e.target.checked),
                                                className: "w-5 h-5 rounded text-orange-500 focus:ring-0 cursor-pointer shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 483,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "I confirm that all information provided is true and accurate to the best of my knowledge. *"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                                lineNumber: 489,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 482,
                                        columnNumber: 25
                                    }, this),
                                    errors.confirmedTrue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-pink-300 text-xs font-semibold mt-1.5",
                                        children: errors.confirmedTrue
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 492,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 481,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-white/10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "button",
                                        variant: "secondary",
                                        onClick: handleReset,
                                        children: "Reset Form"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 498,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$components$2f$role$2d$create$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "submit",
                                        variant: "primary",
                                        loading: submitting,
                                        children: "Submit Application"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                        lineNumber: 501,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                                lineNumber: 497,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                        lineNumber: 154,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/app/apply/team-leader/page.tsx",
                lineNumber: 139,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
        lineNumber: 131,
        columnNumber: 9
    }, this);
}
_s(TeamLeaderApplicationContent, "0+2cEYvKMZ5lG6olokz4BxC+EP0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$hooks$2f$useFormValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormValidation"]
    ];
});
_c = TeamLeaderApplicationContent;
function TeamLeaderApplicationPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#6A11CB] text-white flex items-center justify-center",
            children: "Loading Team Leader Portal..."
        }, void 0, false, {
            fileName: "[project]/admin/app/apply/team-leader/page.tsx",
            lineNumber: 514,
            columnNumber: 29
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamLeaderApplicationContent, {}, void 0, false, {
            fileName: "[project]/admin/app/apply/team-leader/page.tsx",
            lineNumber: 515,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/app/apply/team-leader/page.tsx",
        lineNumber: 514,
        columnNumber: 9
    }, this);
}
_c1 = TeamLeaderApplicationPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "TeamLeaderApplicationContent");
__turbopack_context__.k.register(_c1, "TeamLeaderApplicationPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=admin_4948f3a6._.js.map