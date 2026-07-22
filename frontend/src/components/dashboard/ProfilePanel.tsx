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
  ShieldAlertIcon,
  SparklesIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { getPhoneValidationError, sanitizePhoneInput } from '../../utils/phone';
import { candidateApi } from '../../services/api';

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

  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showParseModal, setShowParseModal] = useState(false);
  const [parseProgress, setParseProgress] = useState('');

  const handleResumeUploadAndParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setParseProgress('Uploading resume to storage...');
    setErrorMsg('');
    try {
      const res = await candidateApi.parseResume(file);
      
      // Update local auth context values
      updateProfile({
        resumeUrl: res.resumeUrl,
        resumeName: file.name
      });
      
      setParseProgress('TalentPortal AI is structuring experiences and skills...');
      setParsedData(res.data);
      setShowParseModal(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'AI parsing failed');
    } finally {
      setIsParsing(false);
      setParseProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            onChange={handleResumeUploadAndParse}
            accept=".pdf,.doc,.docx"
            disabled={uploading || isParsing}
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
                  disabled={uploading || isParsing}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove resume"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || isParsing}
                className="mt-1 border-brand-200 text-brand-700 hover:bg-brand-50/50"
              >
                <SparklesIcon className="h-4 w-4 mr-1.5 text-brand-500" />
                Re-parse with AI
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isParsing}
              className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
            >
              <UploadCloudIcon className="h-8 w-8 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">
                {uploading || isParsing ? 'Processing...' : 'Upload & Parse with AI'}
              </span>
              <span className="text-xs text-slate-400">
                Auto-fill profile in seconds (PDF, DOCX)
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

      {/* AI Parsing Overlay */}
      {isParsing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 text-white p-6 backdrop-blur-md">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/50">
              <SparklesIcon className="h-7 w-7 animate-spin" />
            </span>
          </div>
          <h3 className="mt-8 font-display text-2xl font-bold tracking-tight">AI Resume Reader</h3>
          <p className="mt-2 text-sm text-brand-200 animate-pulse">{parseProgress}</p>
          <div className="mt-6 flex max-w-xs flex-col gap-2 rounded-xl bg-slate-900 border border-slate-800 p-4 text-center">
            <p className="text-xs text-slate-400">
              TalentPortal AI is scanning your pages, extracting key skills, and aligning your work experience. This might take up to 10 seconds.
            </p>
          </div>
        </div>
      )}

      {/* AI Resume Parser Review Modal */}
      <AnimatePresence>
        {showParseModal && parsedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    <SparklesIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      AI Resume Extraction Preview
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review and adjust the profile details extracted by TalentPortal AI.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowParseModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
                {/* Personal Info Grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Headline</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                      value={parsedData.headline || ''}
                      onChange={(e) => setParsedData({ ...parsedData, headline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                      value={parsedData.location || ''}
                      onChange={(e) => setParsedData({ ...parsedData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                      value={parsedData.phone || ''}
                      onChange={(e) => setParsedData({ ...parsedData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="font-display text-sm font-bold text-slate-900 mb-2">Skills Extracted</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills?.map((s: string) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-sm font-semibold text-brand-700"
                      >
                        {s}
                        <button
                          onClick={() => setParsedData({ ...parsedData, skills: parsedData.skills.filter((sk: string) => sk !== s) })}
                          className="rounded-full p-0.5 hover:bg-brand-100"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {(!parsedData.skills || parsedData.skills.length === 0) && (
                      <p className="text-sm text-slate-400">No skills parsed.</p>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="font-display text-sm font-bold text-slate-900 mb-3">Work History</h4>
                  <div className="space-y-4">
                    {parsedData.experiences?.map((exp: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="font-bold text-slate-900 text-sm">{exp.title}</span>
                          <span className="text-xs font-medium text-slate-500">
                            {exp.startDate ? exp.startDate.slice(0, 7) : ''} to {exp.isCurrent ? 'Present' : exp.endDate ? exp.endDate.slice(0, 7) : 'Present'}
                          </span>
                        </div>
                        <p className="text-xs text-brand-600 font-semibold mt-0.5">{exp.company}</p>
                        <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                    {(!parsedData.experiences || parsedData.experiences.length === 0) && (
                      <p className="text-sm text-slate-400">No experience parsed.</p>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="font-display text-sm font-bold text-slate-900 mb-3">Education</h4>
                  <div className="space-y-4">
                    {parsedData.educations?.map((ed: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="font-bold text-slate-900 text-sm">{ed.degree} in {ed.fieldOfStudy}</span>
                          <span className="text-xs font-medium text-slate-500">
                            {ed.startDate ? ed.startDate.slice(0, 4) : ''} - {ed.endDate ? ed.endDate.slice(0, 4) : 'Ongoing'}
                          </span>
                        </div>
                        <p className="text-xs text-brand-600 font-semibold mt-0.5">{ed.institution}</p>
                      </div>
                    ))}
                    {(!parsedData.educations || parsedData.educations.length === 0) && (
                      <p className="text-sm text-slate-400">No education parsed.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <Button variant="outline" onClick={() => setShowParseModal(false)}>
                  Cancel
                </Button>
                <Button onClick={async () => {
                  // Merge parsed data into candidate profile
                  updateProfile({
                    title: parsedData.headline || user.title,
                    headline: parsedData.headline || user.headline,
                    location: parsedData.location || user.location,
                    phone: parsedData.phone || user.phone,
                    skills: parsedData.skills || user.skills,
                    experiences: parsedData.experiences?.map((e: any) => ({
                      id: crypto.randomUUID(),
                      company: e.company,
                      title: e.title,
                      startDate: e.startDate,
                      endDate: e.endDate,
                      isCurrent: e.isCurrent,
                      description: e.description
                    })) || user.experiences,
                    educations: parsedData.educations?.map((e: any) => ({
                      id: crypto.randomUUID(),
                      institution: e.institution,
                      degree: e.degree,
                      fieldOfStudy: e.fieldOfStudy,
                      startDate: e.startDate,
                      endDate: e.endDate
                    })) || user.educations
                  });

                  setShowParseModal(false);
                  
                  // Auto-save changes
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
                }}>
                  Confirm & Import to Profile
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}