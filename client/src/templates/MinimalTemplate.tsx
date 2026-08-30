import React from 'react';
import { ResumeDraft } from '../contexts/ResumeBuilderContext';

/**
 * A third visual layout consuming the same ResumeDraft shape as
 * ClassicTemplate (see Part 1 §5.10). Deliberately plain: single column,
 * no color fills, no pills/badges, and no icons — built to parse cleanly
 * in ATS software and print well on plain paper.
 */

function formatDateRange(start?: string | null, end?: string | null, isCurrent?: boolean): string {
  const fmt = (d: string) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };
  const startLabel = start ? fmt(start) : '';
  const endLabel = isCurrent ? 'Present' : end ? fmt(end) : '';
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  if (startLabel) return startLabel;
  if (endLabel) return endLabel;
  return '';
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    // Accent-colored rule (via the shared `.resume-content` CSS-variable
    // override for `border-primary-600` — see index.css) instead of a
    // hard-coded gray one. This was the only section-heading-level element
    // in this template; being gray-only, it never responded to the
    // customization panel's accent color at all (root cause of "Minimal
    // does not apply accent color"). Heading text itself stays gray-900 —
    // only the divider picks up the accent, keeping the template's plain,
    // ATS-safe/print-safe look intact.
    <h2 className="border-b border-primary-600 pb-0.5 text-xs font-bold uppercase tracking-wider text-gray-900">
      {children}
    </h2>
  );
}

export function MinimalTemplate({ draft }: { draft: ResumeDraft }) {
  const { resume, education, experience, projects, skills, certifications, achievements } = draft;

  const contactLine = [resume.email, resume.phone, resume.location].filter(Boolean).join('  |  ');

  return (
    <div className="flex flex-col gap-3 break-words font-sans text-[13px] leading-snug text-gray-900">
      <header className="flex flex-col gap-0.5 text-center">
        <h1 className="text-xl font-bold">{resume.full_name || 'Your Name'}</h1>
        {contactLine && <p className="text-xs text-gray-700">{contactLine}</p>}
      </header>

      {resume.summary && <p className="whitespace-pre-line text-[13px] leading-snug">{resume.summary}</p>}

      {experience.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Experience</SectionHeading>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {experience.map((exp) => {
              const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
              return (
                <li key={exp.experience_id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="font-semibold">
                      {exp.job_title}
                      {exp.company_name ? `, ${exp.company_name}` : ''}
                    </span>
                    {dateRange && <span className="text-xs text-gray-600">{dateRange}</span>}
                  </div>
                  {exp.description && <p className="whitespace-pre-line text-gray-800">{exp.description}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {education.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Education</SectionHeading>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {education.map((edu) => {
              const dateRange = formatDateRange(edu.start_date, edu.end_date);
              return (
                <li key={edu.education_id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="font-semibold">{edu.institution_name}</span>
                    {dateRange && <span className="text-xs text-gray-600">{dateRange}</span>}
                  </div>
                  <p className="text-gray-800">
                    {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                    {edu.gpa ? ` — GPA ${edu.gpa}` : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Projects</SectionHeading>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {projects.map((proj) => (
              <li key={proj.project_id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="font-semibold">{proj.project_name}</span>
                  {proj.technologies && <span className="text-xs text-gray-600">{proj.technologies}</span>}
                </div>
                {proj.description && <p className="whitespace-pre-line text-gray-800">{proj.description}</p>}
                {proj.project_link && <p className="break-all text-xs text-gray-700">{proj.project_link}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {skills.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Skills</SectionHeading>
          <p className="mt-1.5 text-gray-800">
            {skills.map((s) => (s.proficiency_level ? `${s.skill_name} (${s.proficiency_level})` : s.skill_name)).join(', ')}
          </p>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Certifications</SectionHeading>
          <ul className="mt-1.5 flex flex-col gap-1">
            {certifications.map((cert) => (
              <li key={cert.certification_id} className="break-inside-avoid text-gray-800">
                <span className="font-semibold">{cert.certification_name}</span>
                {cert.issuing_organization ? `, ${cert.issuing_organization}` : ''}
                {cert.issue_date ? ` — ${formatDateRange(cert.issue_date)}` : ''}
                {cert.credential_url && (
                  <p className="break-all text-xs text-gray-700">{cert.credential_url}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {achievements.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Achievements</SectionHeading>
          <ul className="mt-1.5 flex flex-col gap-1">
            {achievements.map((ach) => (
              <li key={ach.achievement_id} className="break-inside-avoid text-gray-800">
                <span className="font-semibold">{ach.title}</span>
                {ach.description ? ` — ${ach.description}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
