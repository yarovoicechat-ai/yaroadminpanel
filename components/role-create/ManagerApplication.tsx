'use client';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout } from './RoleCreateLayout';
import { ReferralState } from './ReferralBanner';
import { FileUpload } from './FileUpload';
import { apiClient } from '@/lib/apiClient';

function ManagerForm({ role }: { role: 'country-manager' | 'state-manager' }) {
  const title = role === 'country-manager' ? 'Country Manager' : 'State Manager';
  const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });
  const [data, setData] = useState({ name: '', email: '', phone: '', country: '', state: '', experienceYears: '', resume: '', selfie: '', agreed: false });
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const field = (key: string, value: any) => setData(prev => ({ ...prev, [key]: value }));
  const submit = async () => {
    if (!referral.isVerified) return void toast.error('Verify your Owner / Operator referral code.');
    if (!data.name.trim() || !/\S+@\S+\.\S+/.test(data.email) || !data.phone.trim() || !data.country.trim() || (role === 'state-manager' && !data.state.trim())) return void toast.error('Complete your contact details and assigned territory.');
    if (!data.resume || !data.selfie || !data.agreed) return void toast.error('Resume, selfie with ID card and consent are mandatory.');
    try {
      setSubmitting(true);
      const res = await apiClient.post(`/api/recruitment/${role}`, { ...data, referralCode: referral.code, documents: [
        { name: 'Resume', documentType: 'Resume', url: data.resume },
        { name: 'Selfie with ID card', documentType: 'SelfieWithIdCard', url: data.selfie },
      ] });
      if (!res.success) throw new Error(res.message || 'Application failed');
      setApplicationId(res.data?.applicationId || 'Submitted');
    } catch (e: any) { toast.error(e.message || 'Application failed'); } finally { setSubmitting(false); }
  };
  return <RoleCreateLayout roleKey={role} roleTitle={`${title} Application`} roleSubtitle="Recruit Super Admin, Admin, BD Leader, BD, Agency, Host and Customer Support within your assigned territory. Your team inherits the same hiring limits." badgeText="Owner / Operator Approval" themeGradient="from-slate-950 via-indigo-950 to-slate-950" accentColor="indigo" steps={[{ id: 'application', title: 'Profile, Territory & Documents' }]} currentStep={0} onStepChange={() => {}} onReferralVerified={setReferral} onSubmit={submit} submitting={submitting} success={Boolean(applicationId)} applicationId={applicationId} formData={{}}>
    <div className="grid gap-5 md:grid-cols-2">
      {(['name', 'email', 'phone', 'country', ...(role === 'state-manager' ? ['state'] : []), 'experienceYears'] as const).map(key => <label key={key} className="space-y-2 text-sm text-slate-200"><span className="capitalize">{key === 'experienceYears' ? 'Experience (years)' : key}{key !== 'experienceYears' ? ' *' : ''}</span><input className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white" type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} value={(data as any)[key]} onChange={e => field(key, e.target.value)} /></label>)}
      <FileUpload label="Resume" required acceptedFormats={['pdf', 'doc', 'docx']} value={data.resume} onChange={v => field('resume', typeof v === 'string' ? v : '')} />
      <FileUpload label="Selfie holding your ID card" required acceptedFormats={['jpg', 'jpeg', 'png', 'webp']} value={data.selfie} onChange={v => field('selfie', typeof v === 'string' ? v : '')} />
    </div>
    <label className="mt-6 flex gap-3 text-sm text-slate-200"><input type="checkbox" checked={data.agreed} onChange={e => field('agreed', e.target.checked)} />I confirm these documents are mine and accept hiring only within my assigned country{role === 'state-manager' ? ' and state' : ''}.</label>
  </RoleCreateLayout>;
}
export function ManagerApplication({ role }: { role: 'country-manager' | 'state-manager' }) { return <Suspense fallback={<div>Loading application...</div>}><ManagerForm role={role} /></Suspense>; }
