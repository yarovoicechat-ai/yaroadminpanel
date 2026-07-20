'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Plus, Trash2, Save, Eye, Layout, Layers, FileText, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface FormStepDraft {
    id: string;
    title: string;
    description: string;
}

interface FieldDraft {
    fieldKey: string;
    label: string;
    fieldType: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'upload' | 'date' | 'multi-select';
    required: boolean;
    options: string;
    placeholder: string;
    stepId: string;
}

export default function FormBuilderPage() {
    const [roleKey, setRoleKey] = useState('hr');
    const [title, setTitle] = useState('HR Recruitment Portal');
    const [subtitle, setSubtitle] = useState('Apply for HR & Talent Acquisition Lead on MeethiChat.');
    const [badgeText, setBadgeText] = useState('Official HR Recruitment');

    const [steps, setSteps] = useState<FormStepDraft[]>([
        { id: 'personal', title: 'Personal Details', description: 'Applicant profile & contact info' },
        { id: 'qualifications', title: 'Qualifications', description: 'HR experience & certifications' }
    ]);

    const [fields, setFields] = useState<FieldDraft[]>([
        { fieldKey: 'fullName', label: 'Full Legal Name', fieldType: 'text', required: true, options: '', placeholder: 'John Doe', stepId: 'personal' },
        { fieldKey: 'email', label: 'Official Email', fieldType: 'text', required: true, options: '', placeholder: 'hr@example.com', stepId: 'personal' },
        { fieldKey: 'hrExpYears', label: 'HR Experience (Years)', fieldType: 'dropdown', required: true, options: '1-3 Years, 3-5 Years, 5+ Years', placeholder: '', stepId: 'qualifications' },
    ]);

    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const handleAddStep = () => {
        const newStepId = `step_${Date.now()}`;
        setSteps(prev => [...prev, { id: newStepId, title: 'New Step', description: 'Step description' }]);
    };

    const handleRemoveStep = (stepId: string) => {
        setSteps(prev => prev.filter(s => s.id !== stepId));
        setFields(prev => prev.filter(f => f.stepId !== stepId));
    };

    const handleAddField = (stepId: string) => {
        const newFieldKey = `field_${Date.now()}`;
        setFields(prev => [...prev, {
            fieldKey: newFieldKey,
            label: 'New Field Label',
            fieldType: 'text',
            required: false,
            options: '',
            placeholder: '',
            stepId
        }]);
    };

    const handleRemoveField = (fieldKey: string) => {
        setFields(prev => prev.filter(f => f.fieldKey !== fieldKey));
    };

    const handleSaveConfig = async () => {
        if (!roleKey.trim() || !title.trim()) {
            toast.error('Role Key and Title are required.');
            return;
        }

        try {
            setSaving(true);
            const formattedFields = fields.map(f => ({
                ...f,
                options: f.options ? f.options.split(',').map(o => o.trim()).filter(Boolean) : []
            }));

            const payload = {
                role: roleKey.toLowerCase().trim(),
                hostname: `${roleKey.toLowerCase().trim()}.meethichat.live`,
                title,
                subtitle,
                badgeText,
                themeGradient: 'from-slate-950 via-purple-950 to-indigo-950',
                accentColor: 'purple',
                formSteps: steps,
                fields: formattedFields
            };

            const res = await apiClient.post('/api/recruitment/admin/config', payload);

            if (res.success) {
                toast.success(`Role recruitment config '${roleKey.toUpperCase()}' saved successfully!`);
            } else {
                toast.error(res.message || 'Failed to save configuration');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error saving form builder configuration');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Layout className="w-7 h-7 text-indigo-400" />
                        Dynamic Recruitment Form Builder
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Owner visual form designer: Add fields, configure steps, and deploy dynamic recruitment forms without code changes.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                    >
                        <Eye className="w-3.5 h-3.5 mr-1" /> {previewMode ? 'Edit Mode' : 'Live Preview'}
                    </Button>
                    <Button
                        size="sm"
                        disabled={saving}
                        onClick={handleSaveConfig}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                    >
                        <Save className="w-3.5 h-3.5 mr-1" /> {saving ? 'Saving...' : 'Deploy Form Config'}
                    </Button>
                </div>
            </div>

            {/* Config Header Form */}
            <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                <CardHeader className="p-0 pb-3 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-400" />
                        Target Role & Portal Metadata
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Role Key *</label>
                        <Input
                            type="text"
                            value={roleKey}
                            onChange={e => setRoleKey(e.target.value)}
                            placeholder="e.g. hr, finance, moderator"
                            className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Portal Title *</label>
                        <Input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Portal Title"
                            className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Subtitle</label>
                        <Input
                            type="text"
                            value={subtitle}
                            onChange={e => setSubtitle(e.target.value)}
                            placeholder="Portal Subtitle"
                            className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Badge Text</label>
                        <Input
                            type="text"
                            value={badgeText}
                            onChange={e => setBadgeText(e.target.value)}
                            placeholder="Badge Text"
                            className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Steps & Field Builder */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        Form Steps & Fields Structure ({steps.length} Steps, {fields.length} Fields)
                    </h3>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddStep}
                        className="border-slate-700 text-emerald-400 hover:bg-slate-800 text-xs rounded-xl"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Step
                    </Button>
                </div>

                <div className="space-y-6">
                    {steps.map((step, stepIdx) => {
                        const stepFields = fields.filter(f => f.stepId === step.id);
                        return (
                            <Card key={step.id} className="bg-slate-900 border-slate-800 text-white rounded-2xl p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-3 flex-1 mr-4">
                                        <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                                            {stepIdx + 1}
                                        </span>
                                        <Input
                                            type="text"
                                            value={step.title}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setSteps(prev => prev.map(s => s.id === step.id ? { ...s, title: val } : s));
                                            }}
                                            className="bg-slate-950 border-slate-800 text-xs font-bold text-white rounded-xl w-60"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveStep(step.id)}
                                        className="text-rose-400 hover:bg-rose-500/10 text-xs"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Field List for this step */}
                                <div className="space-y-3 pl-4">
                                    {stepFields.map((field) => (
                                        <div key={field.fieldKey} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                                            <Input
                                                type="text"
                                                value={field.label}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFields(prev => prev.map(f => f.fieldKey === field.fieldKey ? { ...f, label: val } : f));
                                                }}
                                                placeholder="Field Label"
                                                className="bg-slate-900 border-slate-800 text-xs text-white rounded-lg"
                                            />
                                            <select
                                                value={field.fieldType}
                                                onChange={e => {
                                                    const val = e.target.value as any;
                                                    setFields(prev => prev.map(f => f.fieldKey === field.fieldKey ? { ...f, fieldType: val } : f));
                                                }}
                                                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-2"
                                            >
                                                <option value="text">Text Input</option>
                                                <option value="textarea">Textarea</option>
                                                <option value="dropdown">Dropdown Select</option>
                                                <option value="checkbox">Checkbox</option>
                                                <option value="upload">Document Upload</option>
                                                <option value="date">Date Picker</option>
                                            </select>
                                            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={e => {
                                                        const checked = e.target.checked;
                                                        setFields(prev => prev.map(f => f.fieldKey === field.fieldKey ? { ...f, required: checked } : f));
                                                    }}
                                                    className="w-4 h-4 rounded accent-indigo-500"
                                                />
                                                Required Field
                                            </label>
                                            <div className="flex items-center justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveField(field.fieldKey)}
                                                    className="text-rose-400 hover:bg-rose-500/10 text-xs"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAddField(step.id)}
                                        className="border-dashed border-slate-700 text-slate-400 hover:text-white text-xs rounded-xl w-full py-2"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Field to Step {stepIdx + 1}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
