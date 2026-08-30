import React from 'react';
import { ResumeDraft } from '../contexts/ResumeBuilderContext';

/**
 * A fourth visual layout consuming the same ResumeDraft shape as
 * ClassicTemplate (see Part 1 §5.10). A centered, serif-led layout with
 * double-rule section headers — design inspiration taken from the
 * reference project's "Elegant" resume template, adapted to this app's
 * existing data model and Tailwind-based rendering approach.
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

// Previously both rules were plain gray, so — like Minimal/Classic before
// their fix — Elegant had no section-level element responding to the
// customization panel's accent color (only project/credential links did).
// Using `border-primary-600` here picks up the same CSS-variable override
// (see index.css) the other three templates use.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-y border-primary-600 py-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
      {children}
    </h2>
  );
}

export function ElegantTemplate({ draft }: { draft: ResumeDraft }) {
  const { resume, education, experience, projects, skills, certifications, achievements } = draft;

  const contactLine = [resume.email, resume.phone, resume.location].filter(Boolean).join('  ·  ');

  return (
    <div className="flex flex-col gap-5 break-words font-serif text-gray-900">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-bold tracking-wide">{resume.full_name || 'Your Name'}</h1>
        {contactLine && <p className="text-sm tracking-wide text-gray-600">{contactLine}</p>}
        {resume.summary && (
          <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-gray-700">{resume.summary}</p>
        )}
      </header>

      {experience.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Experience</SectionHeading>
          <ul className="mt-3 flex flex-col gap-3 text-sm">
            {experience.map((exp) => {
              const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
              return (
                <li key={exp.experience_id} className="break-inside-avoid text-center">
                  <p className="font-semibold">
                    {exp.job_title}
                    {exp.company_name ? `, ${exp.company_name}` : ''}
                  </p>
                  {dateRange && <p className="text-xs italic text-gray-500">{dateRange}</p>}
                  {exp.description && (
                    <p className="mx-auto mt-1 max-w-xl whitespace-pre-line text-gray-700">{exp.description}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {education.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Education</SectionHeading>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {education.map((edu) => {
              const dateRange = formatDateRange(edu.start_date, edu.end_date);
              return (
                <li key={edu.education_id} className="break-inside-avoid text-center">
                  <p className="font-semibold">{edu.institution_name}</p>
                  <p className="text-gray-700">
                    {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </p>
                  {dateRange && <p className="text-xs italic text-gray-500">{dateRange}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Projects</SectionHeading>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {projects.map((proj) => (
              <li key={proj.project_id} className="break-inside-avoid text-center">
                <p className="font-semibold">{proj.project_name}</p>
                {proj.technologies && <p className="text-xs italic text-gray-500">{proj.technologies}</p>}
                {proj.description && (
                  <p className="mx-auto mt-1 max-w-xl whitespace-pre-line text-gray-700">{proj.description}</p>
                )}
                {proj.project_link && (
                  <a href={proj.project_link} className="break-all text-xs text-primary-700 underline">
                    {proj.project_link}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {skills.length > 0 && (
        <section className="break-inside-avoid text-center">
          <SectionHeading>Skills</SectionHeading>
          <p className="mt-3 text-sm text-gray-700">
            {skills.map((s) => (s.proficiency_level ? `${s.skill_name} (${s.proficiency_level})` : s.skill_name)).join('  ·  ')}
          </p>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="break-inside-avoid text-center">
          <SectionHeading>Certifications</SectionHeading>
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {certifications.map((cert) => (
              <li key={cert.certification_id} className="break-inside-avoid">
                <span className="font-semibold">{cert.certification_name}</span>
                {cert.issuing_organization ? ` — ${cert.issuing_organization}` : ''}
                {cert.issue_date ? ` (${formatDateRange(cert.issue_date)})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {achievements.length > 0 && (
        <section className="break-inside-avoid text-center">
          <SectionHeading>Achievements</SectionHeading>
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {achievements.map((ach) => (
              <li key={ach.achievement_id} className="break-inside-avoid">
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
