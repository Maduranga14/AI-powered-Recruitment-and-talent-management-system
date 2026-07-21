import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileTextIcon,
  UploadCloudIcon,
  XIcon,
  PlusIcon,
  CheckCircle2Icon,
  Trash2Icon,
  BriefcaseIcon,
  GraduationCapIcon,
  Link2Icon,
  DownloadIcon,
  ShieldAlertIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { getPhoneValidationError, sanitizePhoneInput } from '../../utils/phone';

export function ProfilePanel() {
  const { 
    user, 
    updateProfile, 
    saveProfile, 
    uploadResume, 
    deleteResume, 
    exportProfileData, 
    deleteCandidateProfile 
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Experience form state
  const [showExpForm, setShowExpForm] = useState(false);
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState('');

  // Education form state
  const [showEdForm, setShowEdForm] = useState(false);
  const [edInstitution, setEdInstitution] = useState('');
  const [edDegree, setEdDegree] = useState('');
  const [edField, setEdField] = useState('');
  const [edStartDate, setEdStartDate] = useState('');
  const [edEndDate, setEdEndDate] = useState('');

  if (!user) return null;

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !user.skills.includes(s)) {
      updateProfile({
        skills: [...user.skills, s]
      });
    }
    setSkillInput('');
  };

  const removeSkill = (s: string) =>
    updateProfile({
      skills: user.skills.filter((x) => x !== s)
    });

  const [skillInput, setSkillInput] = useState('');

  const save = async () => {
    const phoneValidationError = getPhoneValidationError(user.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    setSaving(true);
    try {
      await saveProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg('');
    try {
      await uploadResume(file);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your resume?')) return;
    setUploading(true);
    try {
      await deleteResume();
    } catch (err) {
      alert('Failed to delete resume');
    } finally {
      setUploading(false);
    }
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany.trim() || !expTitle.trim() || !expStartDate) {
      alert('Please fill out Company, Title, and Start Date.');
      return;
    }
    const newExp = {
      id: crypto.randomUUID(),
      company: expCompany.trim(),
      title: expTitle.trim(),
      startDate: expStartDate,
      endDate: expIsCurrent ? null : expEndDate || null,
      isCurrent: expIsCurrent,
      description: expDescription.trim() || null,
    };
    
    updateProfile({
      experiences: [...(user.experiences || []), newExp]
    });

    setExpCompany('');
    setExpTitle('');
    setExpStartDate('');
    setExpEndDate('');
    setExpIsCurrent(false);
    setExpDescription('');
    setShowExpForm(false);
  };

  const handleDeleteExperience = (id: string) => {
    updateProfile({
      experiences: (user.experiences || []).filter((e) => e.id !== id)
    });
  };

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edInstitution.trim() || !edDegree.trim() || !edField.trim() || !edStartDate) {
      alert('Please fill out Institution, Degree, Field of Study, and Start Date.');
      return;
    }
    const newEd = {
      id: crypto.randomUUID(),
      institution: edInstitution.trim(),
      degree: edDegree.trim(),
      fieldOfStudy: edField.trim(),
      startDate: edStartDate,
      endDate: edEndDate || null,
    };

    updateProfile({
      educations: [...(user.educations || []), newEd]
    });

    setEdInstitution('');
    setEdDegree('');
    setEdField('');
    setEdStartDate('');
    setEdEndDate('');
    setShowEdForm(false);
  };

  const handleDeleteEducation = (id: string) => {
    updateProfile({
      educations: (user.educations || []).filter((ed) => ed.id !== id)
    });
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('WARNING: Are you sure you want to delete your candidate profile? This will wipe your phone, location, resume, experiences, education, and skills. Your account credentials will remain active.')) {
      if (window.confirm('Are you absolutely sure you want to proceed with profile deletion? This action is irreversible.')) {
        try {
          await deleteCandidateProfile();
          alert('Your candidate profile was successfully deleted.');
        } catch (err) {
          alert('Failed to delete profile.');
        }
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const completion = user.completenessPercent ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Basic info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Basic information
          </h2>
          <div className="mt-5 flex items-center gap-4">
            <img src={user.avatar} alt="" className="h-16 w-16 rounded-2xl" />
            <div>
              <p className="font-display text-lg font-bold text-slate-900">
                {user.name}
              </p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name (Account Info)"
              value={user.name}
              disabled
            />
            
            <Input
              label="Professional title"
              placeholder="e.g. Frontend Engineer"
              value={user.title}
              onChange={(e) =>
                updateProfile({
                  title: e.target.value
                })
              } 
            />
            
            <Input
              label="Location"
              placeholder="City, Country"
              value={user.location}
              onChange={(e) =>
                updateProfile({
                  location: e.target.value
                })
              } 
            />

            <Input
              label="Phone number"
              placeholder="e.g. 9876543210"
              inputMode="numeric"
              maxLength={10}
              value={user.phone || ''}
              error={phoneError}
              hint={!phoneError ? 'Enter exactly 10 digits (numbers only)' : undefined}
              onChange={(e) => {
                const phone = sanitizePhoneInput(e.target.value);
                setPhoneError(getPhoneValidationError(phone) ?? '');
                updateProfile({ phone });
              }}
            />
          </div>
        </div>

        {/* Work Experience */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 text-slate-600" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                Work experience
              </h2>
            </div>
            {!showExpForm && (
              <Button size="sm" variant="outline" onClick={() => setShowExpForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" /> Add
              </Button>
            )}
          </div>

          {showExpForm && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              onSubmit={handleAddExperience} 
              className="mt-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Company Name"
                  required
                  placeholder="e.g. Acme Corp"
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                />
                <Input
                  label="Job Title"
                  required
                  placeholder="e.g. Senior Developer"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="date"
                  label="Start Date"
                  required
                  value={expStartDate}
                  onChange={(e) => setExpStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  label="End Date"
                  disabled={expIsCurrent}
                  required={!expIsCurrent}
                  value={expEndDate}
                  onChange={(e) => setExpEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="expIsCurrent"
                  checked={expIsCurrent}
                  onChange={(e) => setExpIsCurrent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="expIsCurrent" className="text-sm font-semibold text-slate-700">
                  I currently work here
                </label>
              </div>
              <Textarea
                label="Description"
                placeholder="Key accomplishments and responsibilities..."
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowExpForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit">
                  Add experience
                </Button>
              </div>
            </motion.form>
          )}

          <div className="mt-4 space-y-4">
            {(!user.experiences || user.experiences.length === 0) && !showExpForm && (
              <p className="text-sm text-slate-400 text-center py-4">No work experience entries added.</p>
            )}
            {user.experiences && user.experiences.map((exp) => (
              <div key={exp.id} className="flex justify-between items-start p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                <div>
                  <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                  <p className="text-sm text-slate-600">{exp.company}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(exp.startDate)} – {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-slate-500 mt-2 whitespace-pre-line leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg"
                  aria-label={`Remove experience at ${exp.company}`}
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="h-5 w-5 text-slate-600" />
              <h2 className="font-display text-lg font-bold text-slate-900">
                Education
              </h2>
            </div>
            {!showEdForm && (
              <Button size="sm" variant="outline" onClick={() => setShowEdForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" /> Add
              </Button>
            )}
          </div>

          {showEdForm && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              onSubmit={handleAddEducation} 
              className="mt-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-4"
            >
              <Input
                label="Institution Name"
                required
                placeholder="e.g. University of California, Berkeley"
                value={edInstitution}
                onChange={(e) => setEdInstitution(e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Degree"
                  required
                  placeholder="e.g. Bachelor of Science"
                  value={edDegree}
                  onChange={(e) => setEdDegree(e.target.value)}
                />
                <Input
                  label="Field of Study"
                  required
                  placeholder="e.g. Computer Science"
                  value={edField}
                  onChange={(e) => setEdField(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="date"
                  label="Start Date"
                  required
                  value={edStartDate}
                  onChange={(e) => setEdStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  label="End Date (Expected/Completed)"
                  value={edEndDate}
                  onChange={(e) => setEdEndDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowEdForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit">
                  Add education
                </Button>
              </div>
            </motion.form>
          )}

          <div className="mt-4 space-y-4">
            {(!user.educations || user.educations.length === 0) && !showEdForm && (
              <p className="text-sm text-slate-400 text-center py-4">No education entries added.</p>
            )}
            {user.educations && user.educations.map((ed) => (
              <div key={ed.id} className="flex justify-between items-start p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                <div>
                  <h4 className="font-semibold text-slate-900">{ed.degree} in {ed.fieldOfStudy}</h4>
                  <p className="text-sm text-slate-600">{ed.institution}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(ed.startDate)} – {ed.endDate ? formatDate(ed.endDate) : 'Present'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteEducation(ed.id)}
                  className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg"
                  aria-label={`Remove education at ${ed.institution}`}
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social / Portfolio Links */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <Link2Icon className="h-5 w-5 text-slate-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Social & Portfolio links
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Provide links to showcase your professional credentials and projects.
          </p>
          <div className="mt-5 space-y-4">
            <Input
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/username"
              value={user.links?.linkedIn || ''}
              onChange={(e) =>
                updateProfile({
                  links: {
                    ...(user.links || {}),
                    linkedIn: e.target.value
                  }
                })
              }
            />
            <Input
              label="GitHub Profile URL"
              placeholder="https://github.com/username"
              value={user.links?.gitHub || ''}
              onChange={(e) =>
                updateProfile({
                  links: {
                    ...(user.links || {}),
                    gitHub: e.target.value
                  }
                })
              }
            />
            <Input
              label="Portfolio/Personal Website URL"
              placeholder="https://myportfolio.com"
              value={user.links?.portfolio || ''}
              onChange={(e) =>
                updateProfile({
                  links: {
                    ...(user.links || {}),
                    portfolio: e.target.value
                  }
                })
              }
            />
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Skills
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Skills power your AI job matches — add the ones that represent you
            best.
          </p>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Add a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }} />
            
            <Button variant="outline" onClick={addSkill} aria-label="Add skill">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(!user.skills || user.skills.length === 0) &&
              <p className="text-sm text-slate-400">No skills added yet.</p>
            }
            {user.skills && user.skills.map((s) =>
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm font-medium text-brand-700">
                {s}
                <button
                  onClick={() => removeSkill(s)}
                  className="rounded-full p-0.5 hover:bg-brand-100"
                  aria-label={`Remove ${s}`}>
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving changes…' : 'Save changes'}
          </Button>
          {saved &&
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600"
            >
              <CheckCircle2Icon className="h-4 w-4" /> Saved successfully!
            </motion.span>
          }
        </div>
      </div>

      {/* Sidebar: completion + resume */}
      <aside className="space-y-6">
        {/* Profile completeness card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold text-slate-900">
            Profile strength
          </h3>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">Completion</span>
            <span className="font-bold text-slate-900">{completion}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-brand-600"
              initial={{
                width: 0
              }}
              animate={{
                width: `${completion}%`
              }}
              transition={{
                duration: 0.5
              }} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {completion < 100 ?
              'Complete your profile to improve match accuracy.' :
              'Great! Your profile is fully complete.'}
          </p>

          {user.missingFields && user.missingFields.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Suggested missing sections
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {user.missingFields.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200"
                  >
                    + {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resume CV card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold text-slate-900">
            Resume / CV
          </h3>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleResumeUpload}
            accept=".pdf,.doc,.docx"
            disabled={uploading}
          />
          {errorMsg && (
            <p className="mt-2 text-xs font-semibold text-red-600">{errorMsg}</p>
          )}

          {user.resumeUrl ? (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileTextIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.resumeName || 'Uploaded CV'}
                  </p>
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-600 hover:underline inline-block mt-0.5"
                  >
                    View Document
                  </a>
                </div>
                <button
                  onClick={handleResumeDelete}
                  disabled={uploading}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove resume"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
            >
              <UploadCloudIcon className="h-8 w-8 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">
                {uploading ? 'Uploading…' : 'Upload your resume'}
              </span>
              <span className="text-xs text-slate-400">
                PDF or DOCX, up to 5MB
              </span>
            </button>
          )}
          <div className="mt-4">
            <Badge tone="accent">AI-parsed profile ready</Badge>
          </div>
        </div>

        {/* GDPR Privacy & Compliance Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <ShieldAlertIcon className="h-5 w-5 text-slate-700" />
            <h3 className="font-display text-base font-bold text-slate-900">
              Privacy & data controls
            </h3>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-normal">
            We prioritize compliance with GDPR and CCPA. Manage your data transparency or remove profile information securely below.
          </p>
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              fullWidth
              size="sm"
              onClick={exportProfileData}
            >
              <DownloadIcon className="h-3.5 w-3.5 mr-1.5" /> Download my data (JSON)
            </Button>
            <button
              onClick={handleDeleteProfile}
              className="w-full text-center py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-dashed border-red-200 hover:border-red-300 mt-2"
            >
              Delete my profile & data
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}