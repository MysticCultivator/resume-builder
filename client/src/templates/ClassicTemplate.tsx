import React from 'react';
import { ResumeDraft } from '../contexts/ResumeBuilderContext';

/**
 * A single visual layout that renders the shared resume shape.
 * More templates can be added here later, each consuming the same
 * ResumeDraft/ResumeWithSections data (see Part 1 §5.10).
 */

/** Formats a start/end date pair, or "Present" for an ongoing entry — never
 *  shows a raw ISO string or an empty dash if both dates are missing. */
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

// Previously each section repeated this <h2> inline with a plain gray
// bottom border, so — like Minimal before its fix — Classic had no
// section-level element that responded to the customization panel's
// accent color at all (only the small project/credential links did).
// Pulling it into one component and giving it an accent-colored underline
// (same `border-primary-600` mechanism the other three templates use)
// fixes that consistently, without changing the traditional gray-label look.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-primary-600 pb-0.5 text-sm font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </h2>
  );
}

export function ClassicTemplate({ draft }: { draft: ResumeDraft }) {
  const { resume, education, experience, projects, skills, certifications, achievements } = draft;

  const contactLine = [resume.email, resume.phone, resume.location].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col gap-4 break-words font-sans text-gray-900">
      <header className="border-b border-gray-300 pb-3">
        <h1 className="text-2xl font-bold">{resume.full_name || 'Your Name'}</h1>
        {contactLine && <p className="text-sm text-gray-600">{contactLine}</p>}
        {resume.summary && <p className="mt-2 whitespace-pre-line text-sm">{resume.summary}</p>}
      </header>

      {education.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Education</SectionHeading>
          <ul className="mt-1 flex flex-col gap-2 text-sm">
            {education.map((edu) => {
              const dateRange = formatDateRange(edu.start_date, edu.end_date);
              return (
                <li key={edu.education_id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="font-medium">{edu.institution_name}</span>
                    {dateRange && <span className="text-xs text-gray-500">{dateRange}</span>}
                  </div>
                  <p className="text-gray-700">
                    {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {experience.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Experience</SectionHeading>
          <ul className="mt-1 flex flex-col gap-2 text-sm">
            {experience.map((exp) => {
              const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
              return (
                <li key={exp.experience_id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="font-medium">{exp.job_title} · {exp.company_name}</span>
                    {dateRange && <span className="text-xs text-gray-500">{dateRange}</span>}
                  </div>
                  {exp.description && <p className="whitespace-pre-line text-gray-700">{exp.description}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Projects</SectionHeading>
          <ul className="mt-1 flex flex-col gap-2 text-sm">
            {projects.map((proj) => (
              <li key={proj.project_id} className="break-inside-avoid">
                <p className="font-medium">{proj.project_name}</p>
                {proj.technologies && <p className="text-xs text-gray-500">{proj.technologies}</p>}
                {proj.description && <p className="whitespace-pre-line text-gray-700">{proj.description}</p>}
                {proj.project_link && (
                  <a href={proj.project_link} className="break-all text-xs text-primary-600 underline">
                    {proj.project_link}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {skills.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Skills</SectionHeading>
          <p className="mt-1 text-sm text-gray-700">
            {skills.map((s) => (s.proficiency_level ? `${s.skill_name} (${s.proficiency_level})` : s.skill_name)).join(', ')}
          </p>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Certifications</SectionHeading>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {certifications.map((cert) => (
              <li key={cert.certification_id} className="break-inside-avoid">
                <span className="font-medium">{cert.certification_name}</span>
                {cert.issuing_organization ? ` — ${cert.issuing_organization}` : ''}
                {cert.issue_date ? ` (${formatDateRange(cert.issue_date)})` : ''}
                {cert.credential_url && (
                  <a href={cert.credential_url} className="block break-all text-xs text-primary-600 underline">
                    {cert.credential_url}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {achievements.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Achievements</SectionHeading>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {achievements.map((ach) => (
              <li key={ach.achievement_id} className="break-inside-avoid">
                <span className="font-medium">{ach.title}</span>
                {ach.description ? ` — ${ach.description}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
