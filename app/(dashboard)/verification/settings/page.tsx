'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';

const defaults: any = {
  faceVerificationEnabled: true, kycVerificationEnabled: true,
  rolesRequiringFaceVerification: ['host'], rolesRequiringKycVerification: ['host'],
  faceImageMaximumSizeMb: 5, maximumSubmissionAttempts: 5, resubmissionAllowed: true,
  verificationExpiryDays: 365, bankDetailsRequiredForWithdrawal: true,
  manualReviewRequired: true, notificationsEnabled: true, autoAssignmentEnabled: false,
  automaticApprovalEnabled: false,
};
const toggles = [
  ['faceVerificationEnabled', 'Face verification enabled'], ['kycVerificationEnabled', 'KYC verification enabled'],
  ['resubmissionAllowed', 'Resubmission allowed'], ['bankDetailsRequiredForWithdrawal', 'Bank details required for withdrawal'],
  ['manualReviewRequired', 'Manual review required'], ['notificationsEnabled', 'Notifications enabled'],
  ['autoAssignmentEnabled', 'Auto assignment enabled'],
];
export default function VerificationSettingsPage() {
  const [form, setForm] = useState(defaults); const [saving, setSaving] = useState(false);
  useEffect(() => { apiClient.get('/api/v1/admin/verifications/settings').then(result => setForm({ ...defaults, ...(result.data || {}) })).catch((error: any) => toast.error(error.message)); }, []);
  const save = async () => { try { setSaving(true); await apiClient.patch('/api/v1/admin/verifications/settings', form); toast.success('Verification settings saved'); } catch (error: any) { toast.error(error.message); } finally { setSaving(false); } };
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold">Verification Settings</h1><p className="text-sm text-muted-foreground">Automatic approval is permanently disabled. All decisions remain manual.</p></div>
    <Card glass><CardHeader><CardTitle>Workflow</CardTitle></CardHeader><CardContent className="space-y-5">
      {toggles.map(([key, label]) => <div key={key} className="flex items-center justify-between rounded-xl border border-white/10 p-4"><div><p className="font-semibold">{label}</p>{key === 'manualReviewRequired' && <p className="text-xs text-muted-foreground">Required by this verification policy.</p>}</div><Switch checked={!!form[key]} onCheckedChange={checked => setForm((value: any) => ({ ...value, [key]: checked }))} /></div>)}
      <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Maximum image size (MB)" value={form.faceImageMaximumSizeMb} onChange={value => setForm((current: any) => ({ ...current, faceImageMaximumSizeMb: value }))} />
        <NumberField label="Maximum attempts" value={form.maximumSubmissionAttempts} onChange={value => setForm((current: any) => ({ ...current, maximumSubmissionAttempts: value }))} />
        <NumberField label="Expiry period (days)" value={form.verificationExpiryDays} onChange={value => setForm((current: any) => ({ ...current, verificationExpiryDays: value }))} /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Roles requiring face verification" value={(form.rolesRequiringFaceVerification || []).join(', ')} onChange={value => setForm((current: any) => ({ ...current, rolesRequiringFaceVerification: value.split(',').map((item: string) => item.trim()).filter(Boolean) }))} />
        <TextField label="Roles requiring KYC verification" value={(form.rolesRequiringKycVerification || []).join(', ')} onChange={value => setForm((current: any) => ({ ...current, rolesRequiringKycVerification: value.split(',').map((item: string) => item.trim()).filter(Boolean) }))} />
        <TextField label="Allowed image formats" value={(form.allowedImageFormats || ['jpg', 'jpeg', 'png']).join(', ')} onChange={value => setForm((current: any) => ({ ...current, allowedImageFormats: value.split(',').map((item: string) => item.trim().toLowerCase()).filter(Boolean) }))} />
      </div>
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4"><p className="font-semibold text-red-300">Automatic approval: Disabled</p><p className="text-xs text-red-200/70">This value cannot be enabled through the API.</p></div>
      <Button onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</Button>
    </CardContent></Card>
  </div>;
}
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="space-y-2 text-sm font-semibold">{label}<Input value={value} onChange={event => onChange(event.target.value)} /></label>;
}
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="space-y-2 text-sm font-semibold">{label}<Input type="number" min={1} value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
}
