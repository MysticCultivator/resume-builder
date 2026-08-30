import React from 'react';
import { ResumeDraft } from '../contexts/ResumeBuilderContext';

/**
 * A second visual layout consuming the same ResumeDraft shape as
 * ClassicTemplate (see Part 1 §5.10). Leads with a bold name/contact band
 * and uses left-rule section headers for stronger visual hierarchy.
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
    <h2 className="border-l-4 border-primary-600 pl-2 text-xs font-bold uppercase tracking-[0.15em] text-gray-800">
      {children}
    </h2>
  );
}

export function ModernTemplate({ draft }: { draft: ResumeDraft }) {
  const { resume, education, experience, projects, skills, certifications, achievements } = draft;

  const contactParts = [resume.email, resume.phone, resume.location].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-5 break-words font-sans text-gray-900">
      <header className="-mx-6 -mt-6 flex flex-col gap-1 bg-gray-900 px-6 py-5 text-white print:bg-gray-900">
        <h1 className="text-3xl font-extrabold tracking-tight">{resume.full_name || 'Your Name'}</h1>
        {contactParts.length > 0 && (
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-300">
            {contactParts.map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </p>
        )}
        {resume.summary && (
          <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-gray-100">{resume.summary}</p>
        )}
      </header>

      {experience.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Experience</SectionHeading>
          <ul className="mt-2 flex flex-col gap-3 text-sm">
            {experience.map((exp) => {
              const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
              return (
                <li key={exp.experience_id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="font-semibold text-gray-900">{exp.job_title}</span>
                    {dateRange && <span className="text-xs font-medium text-gray-500">{dateRange}</span>}
                  </div>
                  <p className="text-sm font-medium text-primary-700">{exp.company_name}</p>
                  {exp.description && (
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">{exp.description}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Projects</SectionHeading>
          <ul className="mt-2 flex flex-col gap-3 text-sm">
            {projects.map((proj) => (
              <li key={proj.project_id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="font-semibold text-gray-900">{proj.project_name}</span>
                  {proj.project_link && (
                    <a
                      href={proj.project_link}
                      className="max-w-[60%] truncate break-all text-xs font-medium text-primary-600 underline"
                    >
                      {proj.project_link}
                    </a>
                  )}
                </div>
                {proj.technologies && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {proj.technologies
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700"
                        >
                          {tech}
                        </span>
                      ))}
                  </div>
                )}
                {proj.description && (
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">{proj.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {education.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Education</SectionHeading>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {education.map((edu) => {
              const dateRange = formatDateRange(edu.start_date, edu.end_date);
              return (
                <li key={edu.education_id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="font-semibold text-gray-900">{edu.institution_name}</span>
                    {dateRange && <span className="text-xs font-medium text-gray-500">{dateRange}</span>}
                  </div>
                  <p className="text-sm text-gray-700">
                    {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {skills.length > 0 && (
        <section className="break-inside-avoid">
          <SectionHeading>Skills</SectionHeading>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s.skill_id}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800"
              >
                {s.skill_name}
                {s.proficiency_level ? ` · ${s.proficiency_level}` : ''}
              </span>
            ))}
          </div>
        </section>
      )}

      {(certifications.length > 0 || achievements.length > 0) && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {certifications.length > 0 && (
            <section className="break-inside-avoid">
              <SectionHeading>Certifications</SectionHeading>
              <ul className="mt-2 flex flex-col gap-2 text-sm">
                {certifications.map((cert) => (
                  <li key={cert.certification_id} className="break-inside-avoid">
                    <p className="font-semibold text-gray-900">{cert.certification_name}</p>
                    <p className="text-xs text-gray-600">
                      {[cert.issuing_organization, formatDateRange(cert.issue_date)].filter(Boolean).join(' · ')}
                    </p>
                    {cert.credential_url && (
                      <a href={cert.credential_url} className="break-all text-xs text-primary-600 underline">
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
              <ul className="mt-2 flex flex-col gap-2 text-sm">
                {achievements.map((ach) => (
                  <li key={ach.achievement_id} className="break-inside-avoid">
                    <p className="font-semibold text-gray-900">{ach.title}</p>
                    {ach.description && <p className="text-sm text-gray-700">{ach.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
