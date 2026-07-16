import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileTextIcon,
  UploadCloudIcon,
  XIcon,
  PlusIcon,
  CheckCircle2Icon,
  Trash2Icon } from
'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
export function ProfilePanel() {
  const { user, updateProfile } = useAuth();
  const [skillInput, setSkillInput] = useState('');
  const [saved, setSaved] = useState(false);
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
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const completion = (() => {
    let done = 0;
    const total = 5;
    if (user.title) done++;
    if (user.location) done++;
    if (user.bio) done++;
    if (user.skills.length) done++;
    if (user.resumeName) done++;
    return Math.round(done / total * 100);
  })();
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
              label="Full name"
              value={user.name}
              onChange={(e) =>
              updateProfile({
                name: e.target.value
              })
              } />
            
            <Input
              label="Professional title"
              placeholder="e.g. Frontend Engineer"
              value={user.title}
              onChange={(e) =>
              updateProfile({
                title: e.target.value
              })
              } />
            
            <Input
              label="Location"
              placeholder="City, Country"
              value={user.location}
              onChange={(e) =>
              updateProfile({
                location: e.target.value
              })
              } />
            
            <Input label="Email" value={user.email} disabled />
          </div>
          <div className="mt-4">
            <Textarea
              label="About you"
              placeholder="A short professional summary…"
              value={user.bio}
              onChange={(e) =>
              updateProfile({
                bio: e.target.value
              })
              } />
            
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
            {user.skills.length === 0 &&
            <p className="text-sm text-slate-400">No skills added yet.</p>
            }
            {user.skills.map((s) =>
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

        <div className="flex items-center gap-3">
          <Button onClick={save}>Save changes</Button>
          {saved &&
          <motion.span
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            
              <CheckCircle2Icon className="h-4 w-4" /> Saved
            </motion.span>
          }
        </div>
      </div>

      {/* Sidebar: completion + resume */}
      <aside className="space-y-6">
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
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold text-slate-900">
            Resume / CV
          </h3>
          {user.resumeName ?
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <FileTextIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user.resumeName}
                </p>
                <p className="text-xs text-slate-500">Uploaded · 240 KB</p>
              </div>
              <button
              onClick={() =>
              updateProfile({
                resumeName: null
              })
              }
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
              aria-label="Remove resume">
              
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div> :

          <button
            onClick={() =>
            updateProfile({
              resumeName: 'My_Resume.pdf'
            })
            }
            className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
            
              <UploadCloudIcon className="h-8 w-8 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">
                Upload your resume
              </span>
              <span className="text-xs text-slate-400">
                PDF or DOCX, up to 5MB
              </span>
            </button>
          }
          <div className="mt-4">
            <Badge tone="accent">AI-parsed profile ready</Badge>
          </div>
        </div>
      </aside>
    </div>);

}