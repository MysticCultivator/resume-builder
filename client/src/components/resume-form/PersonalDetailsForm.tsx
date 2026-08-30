import React, { useState } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { Input } from '../shared/Input';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PersonalDetailsForm() {
  const { draft, updatePersonalField } = useResumeBuilder();
  const { resume } = draft;
  const [emailTouched, setEmailTouched] = useState(false);

  const email = resume.email ?? '';
  const emailError = emailTouched && email !== '' && !EMAIL_PATTERN.test(email) ? 'Enter a valid email address.' : undefined;

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Resume title"
        placeholder="e.g. Software Engineer Resume"
        value={resume.title ?? ''}
        onChange={(e) => updatePersonalField('title', e.target.value)}
      />
      <Input
        label="Full name"
        placeholder="e.g. Priya Sharma"
        value={resume.full_name ?? ''}
        onChange={(e) => updatePersonalField('full_name', e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => updatePersonalField('email', e.target.value)}
        onBlur={() => setEmailTouched(true)}
        error={emailError}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Phone"
          type="tel"
          value={resume.phone ?? ''}
          onChange={(e) => updatePersonalField('phone', e.target.value)}
          placeholder="+91 98765 43210"
        />
        <Input
          label="Location"
          value={resume.location ?? ''}
          onChange={(e) => updatePersonalField('location', e.target.value)}
          placeholder="City, State"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="summary" className="text-sm font-medium text-gray-700">
          Career objective / profile summary
        </label>
        <textarea
          id="summary"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          rows={4}
          placeholder="A short summary of your experience and what you're looking for next."
          value={resume.summary ?? ''}
          onChange={(e) => updatePersonalField('summary', e.target.value)}
        />
      </div>
      <p className="text-xs text-gray-500">Changes save automatically a moment after you stop typing.</p>
    </div>
  );
}
