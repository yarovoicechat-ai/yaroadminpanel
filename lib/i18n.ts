export type SupportedLanguage = 'en' | 'hi' | 'ar' | 'es';

const translations: Record<SupportedLanguage, Record<string, string>> = {
    en: {
        recruitment_portal: 'Recruitment Portal',
        submit_application: 'Submit Application',
        applicant_name: 'Full Name',
        email_address: 'Email Address',
        phone_number: 'Phone Number',
        application_id: 'Application ID',
        status_pending: 'Pending',
        status_approved: 'Approved',
        status_rejected: 'Rejected',
    },
    hi: {
        recruitment_portal: 'भर्ती पोर्टल',
        submit_application: 'आवेदन जमा करें',
        applicant_name: 'पूरा नाम',
        email_address: 'ईमेल पता',
        phone_number: 'फ़ोन नंबर',
        application_id: 'आवेदन आईडी',
        status_pending: 'लंबित',
        status_approved: 'स्वीकृत',
        status_rejected: 'अस्वीकृत',
    },
    ar: {
        recruitment_portal: 'بوابة التوظيف',
        submit_application: 'تقديم الطلب',
        applicant_name: 'الاسم الكامل',
        email_address: 'البريد الإلكتروني',
        phone_number: 'رقم الهاتف',
        application_id: 'معرف الطلب',
        status_pending: 'قيد الانتظار',
        status_approved: 'تمت الموافقة',
        status_rejected: 'مرفوض',
    },
    es: {
        recruitment_portal: 'Portal de Reclutamiento',
        submit_application: 'Enviar Solicitud',
        applicant_name: 'Nombre Completo',
        email_address: 'Correo Electrónico',
        phone_number: 'Número de Teléfono',
        application_id: 'ID de Solicitud',
        status_pending: 'Pendiente',
        status_approved: 'Aprobado',
        status_rejected: 'Rechazado',
    },
};

export function translate(key: string, lang: SupportedLanguage = 'en'): string {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
}
