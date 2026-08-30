import React, { ComponentType } from 'react';
import { Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeDraft } from '../../contexts/ResumeBuilderContext';
import { ResumeCustomization } from '../../types/resume';
import { FONT_SIZE_SCALE, SPACING_SCALE } from '../../utils/resumeCustomization';

/**
 * @react-pdf/renderer versions of the four visual designs in
 * ../../templates/ (ClassicTemplate, ModernTemplate, MinimalTemplate,
 * ElegantTemplate). Those are plain DOM/Tailwind components used for the
 * on-screen live preview and can't be rendered by @react-pdf/renderer
 * (no <div>/className), so each design is re-expressed here with
 * react-pdf's View/Text/StyleSheet primitives, following the same
 * per-template layout choices (single column vs. banded header vs.
 * centered serif, etc.) and consuming the same ResumeDraft shape.
 *
 * Each template component takes the resolved customization (font size /
 * spacing / accent color, see utils/resumeCustomization.ts) and returns a
 * single <Page> — swapping in for whichever template the resume has
 * selected (see pdfTemplateRegistry below).
 */

type PdfTemplateProps = { draft: ResumeDraft; customization: ResumeCustomization };
export type PdfTemplateComponent = ComponentType<PdfTemplateProps>;

function formatDateRange(start?: string | null, end?: string | null, isCurrent?: boolean): string {
  const fmt = (d: string) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };
  const startLabel = start ? fmt(start) : '';
  const endLabel = isCurrent ? 'Present' : end ? fmt(end) : '';
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  return startLabel || endLabel || '';
}

/* ------------------------------------------------------------------ */
/* Classic — single column, understated gray uppercase section labels  */
/* (mirrors templates/ClassicTemplate.tsx)                             */
/* ------------------------------------------------------------------ */

function buildClassicStyles(customization: ResumeCustomization) {
  const f = FONT_SIZE_SCALE[customization.fontSize];
  const s = SPACING_SCALE[customization.spacing];
  const accent = customization.accentColor;
  return StyleSheet.create({
    page: { padding: 32, fontSize: 11 * f, fontFamily: 'Helvetica' },
    header: { borderBottom: '1pt solid #d1d5db', paddingBottom: 8 * s, marginBottom: 8 * s },
    name: { fontSize: 20 * f, fontWeight: 700, marginBottom: 2 },
    contact: { fontSize: 10 * f, color: '#4b5563' },
    summary: { marginTop: 6 * s, fontSize: 10 * f, color: '#1f2937' },
    section: { marginBottom: 8 * s },
    sectionTitle: {
      fontSize: 9 * f,
      fontWeight: 700,
      marginBottom: 3 * s,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: accent,
    },
    entry: { marginBottom: 5 * s },
    entryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    entryTitle: { fontWeight: 700, fontSize: 11 * f },
    entryMeta: { fontSize: 9 * f, color: '#6b7280' },
    entryBody: { marginTop: 1, color: '#374151', fontSize: 10 * f },
    link: { fontSize: 9 * f, color: '#2563eb' },
  });
}

function ClassicPdfTemplate({ draft, customization }: PdfTemplateProps) {
  const { resume, education, experience, projects, skills, certifications, achievements } = draft;
  const styles = buildClassicStyles(customization);
  const contactLine = [resume.email, resume.phone, resume.location].filter(Boolean).join('  |  ');

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{resume.full_name || 'Your Name'}</Text>
        {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}
        {resume.summary ? <Text style={styles.summary}>{resume.summary}</Text> : null}
      </View>

      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu) => (
            <View key={edu.education_id} style={styles.entry}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryTitle}>{edu.institution_name}</Text>
                <Text style={styles.entryMeta}>{formatDateRange(edu.start_date, edu.end_date)}</Text>
              </View>
              <Text style={styles.entryBody}>
                {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                {edu.gpa ? `  ·  GPA ${edu.gpa}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp) => (
            <View key={exp.experience_id} style={styles.entry}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryTitle}>{exp.job_title} - {exp.company_name}</Text>
                <Text style={styles.entryMeta}>{formatDateRange(exp.start_date, exp.end_date, exp.is_current)}</Text>
              </View>
              {exp.description ? <Text style={styles.entryBody}>{exp.description}</Text> : null}
            </View>
          ))}
        </View>
      )}

      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((proj) => (
            <View key={proj.project_id} style={styles.entry}>
              <Text style={styles.entryTitle}>{proj.project_name}</Text>
              {proj.technologies ? <Text style={styles.entryMeta}>{proj.technologies}</Text> : null}
              {proj.description ? <Text style={styles.entryBody}>{proj.description}</Text> : null}
              {proj.project_link ? (
                <Link src={proj.project_link} style={styles.link}>
                  {proj.project_link}
                </Link>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.entryBody}>
            {skills.map((s) => (s.proficiency_level ? `${s.skill_name} (${s.proficiency_level})` : s.skill_name)).join(', ')}
          </Text>
        </View>
      )}

      {certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {certifications.map((cert) => (
            <Text key={cert.certification_id} style={styles.entry}>
              {cert.certification_name}
              {cert.issuing_organization ? ` - ${cert.issuing_organization}` : ''}
              {cert.issue_date ? ` (${formatDateRange(cert.issue_date)})` : ''}
            </Text>
          ))}
        </View>
      )}

      {achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.map((ach) => (
            <Text key={ach.achievement_id} style={styles.entry}>
              {ach.title}
              {ach.description ? ` - ${ach.description}` : ''}
            </Text>
          ))}
        </View>
      )}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Modern — dark banded header, left-rule accent headings              */
/* (mirrors templates/ModernTemplate.tsx)                              */
/* ------------------------------------------------------------------ */

function buildModernStyles(customization: ResumeCustomization) {
  const f = FONT_SIZE_SCALE[customization.fontSize];
  const s = SPACING_SCALE[customization.spacing];
  const accent = customization.accentColor;
  return StyleSheet.create({
    page: { fontSize: 11 * f, fontFamily: 'Helvetica' },
    header: { backgroundColor: '#111827', paddingHorizontal: 32, paddingVertical: 20 * s },
    name: { fontSize: 22 * f, fontWeight: 700, color: '#ffffff', marginBottom: 3 },
    contact: { fontSize: 9 * f, color: '#d1d5db' },
    summary: { marginTop: 6 * s, fontSize: 10 * f, color: '#f3f4f6' },
    body: { padding: 32, paddingTop: 16 * s },
    section: { marginBottom: 10 * s },
    sectionTitle: {
      fontSize: 9 * f,
      fontWeight: 700,
      marginBottom: 4 * s,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      color: '#1f2937',
      borderLeft: `3pt solid ${accent}`,
      paddingLeft: 6,
    },
    entry: { marginBottom: 6 * s },
    entryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    entryTitle: { fontWeight: 700, fontSize: 11 * f, color: '#111827' },
    entryCompany: { fontSize: 10 * f, color: accent, fontWeight: 700 },
    entryMeta: { fontSize: 9 * f, color: '#6b7280' },
    entryBody: { marginTop: 2, color: '#374151', fontSize: 10 * f },
    link: { fontSize: 9 * f, color: '#2563eb' },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 * s },
    pill: {
      fontSize: 8.5 * f,
      color: '#374151',
      backgroundColor: '#f3f4f6',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginRight: 4,
      marginBottom: 4,
    },
  });
}

function ModernPdfTemplate({ draft, customization }: PdfTemplateProps) {
  const { resume, education, experience, projects, skills, certifications, achievements } = draft;
  const styles = buildModernStyles(customization);
  const contactLine = [resume.email, resume.phone, resume.location].filter(Boolean).join('   ·   ');

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{resume.full_name || 'Your Name'}</Text>
        {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}
        {resume.summary ? <Text style={styles.summary}>{resume.summary}</Text> : null}
      </View>

      <View style={styles.body}>
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.experience_id} style={styles.entry}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{exp.job_title}</Text>
                  <Text style={styles.entryMeta}>{formatDateRange(exp.start_date, exp.end_date, exp.is_current)}</Text>
                </View>
                <Text style={styles.entryCompany}>{exp.company_name}</Text>
                {exp.description ? <Text style={styles.entryBody}>{exp.description}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.project_id} style={styles.entry}>
                <Text style={styles.entryTitle}>{proj.project_name}</Text>
                {proj.technologies ? (
                  <View style={styles.pillRow}>
                    {proj.technologies.split(',').map((t) => t.trim()).filter(Boolean).map((tech, i) => (
                      <Text key={i} style={styles.pill}>{tech}</Text>
                    ))}
                  </View>
                ) : null}
                {proj.description ? <Text style={styles.entryBody}>{proj.description}</Text> : null}
                {proj.project_link ? (
                  <Link src={proj.project_link} style={styles.link}>
                    {proj.project_link}
                  </Link>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.education_id} style={styles.entry}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{edu.institution_name}</Text>
                  <Text style={styles.entryMeta}>{formatDateRange(edu.start_date, edu.end_date)}</Text>
                </View>
                <Text style={styles.entryBody}>
                  {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                  {edu.gpa ? `  ·  GPA ${edu.gpa}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.pillRow}>
              {skills.map((s) => (
                <Text key={s.skill_id} style={styles.pill}>
                  {s.skill_name}
                  {s.proficiency_level ? ` · ${s.proficiency_level}` : ''}
                </Text>
              ))}
            </View>
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <Text key={cert.certification_id} style={styles.entry}>
                {cert.certification_name}
                {cert.issuing_organization ? ` - ${cert.issuing_organization}` : ''}
                {cert.issue_date ? ` (${formatDateRange(cert.issue_date)})` : ''}
              </Text>
            ))}
          </View>
        )}

        {achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {achievements.map((ach) => (
              <Text key={ach.achievement_id} style={styles.entry}>
                {ach.title}
                {ach.description ? ` - ${ach.description}` : ''}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Minimal — plain, print-safe, ATS-friendly, centered header only     */
/* (mirrors templates/MinimalTemplate.tsx)                             */
/* ------------------------------------------------------------------ */

function buildMinimalStyles(customization: ResumeCustomization) {
  const f = FONT_SIZE_SCALE[customization.fontSize];
  const s = SPACING_SCALE[customization.spacing];
  // Mirrors the same fix as templates/MinimalTemplate.tsx's SectionHeading:
  // this was the only place in the Minimal PDF that could carry an accent
  // color, and it was hard-coded to gray (`#9ca3af`) instead of reading
  // `customization.accentColor` — the PDF-renderer counterpart of the
  // "Minimal does not apply accent color" bug.
  const accent = customization.accentColor;
  return StyleSheet.create({
    page: { padding: 32, fontSize: 10 * f, fontFamily: 'Helvetica', color: '#111827' },
    header: { textAlign: 'center', marginBottom: 6 * s },
    name: { fontSize: 16 * f, fontWeight: 700, marginBottom: 1 },
    contact: { fontSize: 9 * f, color: '#374151' },
    summary: { fontSize: 10 * f, marginBottom: 6 * s },
    section: { marginBottom: 6 * s },
    sectionTitle: {
      fontSize: 9 * f,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderBottom: `0.75pt solid ${accent}`,
      paddingBottom: 2,
      marginBottom: 3 * s,
    },
    entry: { marginBottom: 4 * s },
    entryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    entryTitle: { fontWeight: 700, fontSize: 10 * f },
    entryMeta: { fontSize: 8.5 * f, color: '#4b5563' },
    entryBody: { color: '#1f2937', fontSize: 9.5 * f },
    link: { fontSize: 8.5 * f, color: '#374151' },
  });
}

function MinimalPdfTemplate({ draft, customization }: PdfTemplateProps) {
  const { resume, education, experience, projects, skills, certifications, achievements } = draft;
  const styles = buildMinimalStyles(customization);
  const contactLine = [resume.email, resume.phone, resume.location].filter(Boolean).join('  |  ');

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{resume.full_name || 'Your Name'}</Text>
        {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}
      </View>

      {resume.summary ? <Text style={styles.summary}>{resume.summary}</Text> : null}

      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp) => (
            <View key={exp.experience_id} style={styles.entry}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryTitle}>
                  {exp.job_title}
                  {exp.company_name ? `, ${exp.company_name}` : ''}
                </Text>
                <Text style={styles.entryMeta}>{formatDateRange(exp.start_date, exp.end_date, exp.is_current)}</Text>
              </View>
              {exp.description ? <Text style={styles.entryBody}>{exp.description}</Text> : null}
            </View>
          ))}
        </View>
      )}

      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu) => (
            <View key={edu.education_id} style={styles.entry}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryTitle}>{edu.institution_name}</Text>
                <Text style={styles.entryMeta}>{formatDateRange(edu.start_date, edu.end_date)}</Text>
              </View>
              <Text style={styles.entryBody}>
                {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                {edu.gpa ? ` — GPA ${edu.gpa}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((proj) => (
            <View key={proj.project_id} style={styles.entry}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryTitle}>{proj.project_name}</Text>
                {proj.technologies ? <Text style={styles.entryMeta}>{proj.technologies}</Text> : null}
              </View>
              {proj.description ? <Text style={styles.entryBody}>{proj.description}</Text> : null}
              {proj.project_link ? <Text style={styles.link}>{proj.project_link}</Text> : null}
            </View>
          ))}
        </View>
      )}

      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.entryBody}>
            {skills.map((s) => (s.proficiency_level ? `${s.skill_name} (${s.proficiency_level})` : s.skill_name)).join(', ')}
          </Text>
        </View>
      )}

      {certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {certifications.map((cert) => (
            <Text key={cert.certification_id} style={styles.entry}>
              {cert.certification_name}
              {cert.issuing_organization ? `, ${cert.issuing_organization}` : ''}
              {cert.issue_date ? ` — ${formatDateRange(cert.issue_date)}` : ''}
            </Text>
          ))}
        </View>
      )}

      {achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.map((ach) => (
            <Text key={ach.achievement_id} style={styles.entry}>
              {ach.title}
              {ach.description ? ` — ${ach.description}` : ''}
            </Text>
          ))}
        </View>
      )}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Elegant — centered, serif-led, double-rule section headers          */
/* (mirrors templates/ElegantTemplate.tsx)                             */
/* ------------------------------------------------------------------ */

function buildElegantStyles(customization: ResumeCustomization) {
  const f = FONT_SIZE_SCALE[customization.fontSize];
  const s = SPACING_SCALE[customization.spacing];
  const accent = customization.accentColor;
  return StyleSheet.create({
    page: { padding: 36, fontSize: 11 * f, fontFamily: 'Times-Roman', color: '#111827' },
    header: { alignItems: 'center', marginBottom: 10 * s },
    name: { fontSize: 24 * f, fontWeight: 700, letterSpacing: 1, marginBottom: 2, textAlign: 'center' },
    contact: { fontSize: 10 * f, color: '#4b5563', textAlign: 'center' },
    summary: { marginTop: 6 * s, fontSize: 10 * f, color: '#374151', textAlign: 'center' },
    section: { marginBottom: 10 * s },
    sectionTitle: {
      fontSize: 9 * f,
      fontWeight: 700,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 2,
      color: accent,
      borderTop: `0.75pt solid ${accent}`,
      borderBottom: `0.75pt solid ${accent}`,
      paddingVertical: 3,
      marginBottom: 6 * s,
    },
    entry: { marginBottom: 6 * s, alignItems: 'center' },
    entryTitle: { fontWeight: 700, fontSize: 11 * f, textAlign: 'center' },
    entryMeta: { fontSize: 9 * f, fontStyle: 'italic', color: '#6b7280', textAlign: 'center' },
    entryBody: { marginTop: 2, color: '#374151', fontSize: 10 * f, textAlign: 'center' },
    link: { fontSize: 9 * f, color: '#374151', textAlign: 'center' },
  });
}

function ElegantPdfTemplate({ draft, customization }: PdfTemplateProps) {
  const { resume, education, experience, projects, skills, certifications, achievements } = draft;
  const styles = buildElegantStyles(customization);
  const contactLine = [resume.email, resume.phone, resume.location].filter(Boolean).join('   ·   ');

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{resume.full_name || 'Your Name'}</Text>
        {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}
        {resume.summary ? <Text style={styles.summary}>{resume.summary}</Text> : null}
      </View>

      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp) => (
            <View key={exp.experience_id} style={styles.entry}>
              <Text style={styles.entryTitle}>
                {exp.job_title}
                {exp.company_name ? `, ${exp.company_name}` : ''}
              </Text>
              <Text style={styles.entryMeta}>{formatDateRange(exp.start_date, exp.end_date, exp.is_current)}</Text>
              {exp.description ? <Text style={styles.entryBody}>{exp.description}</Text> : null}
            </View>
          ))}
        </View>
      )}

      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu) => (
            <View key={edu.education_id} style={styles.entry}>
              <Text style={styles.entryTitle}>{edu.institution_name}</Text>
              <Text style={styles.entryBody}>
                {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                {edu.gpa ? `  ·  GPA ${edu.gpa}` : ''}
              </Text>
              <Text style={styles.entryMeta}>{formatDateRange(edu.start_date, edu.end_date)}</Text>
            </View>
          ))}
        </View>
      )}

      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((proj) => (
            <View key={proj.project_id} style={styles.entry}>
              <Text style={styles.entryTitle}>{proj.project_name}</Text>
              {proj.technologies ? <Text style={styles.entryMeta}>{proj.technologies}</Text> : null}
              {proj.description ? <Text style={styles.entryBody}>{proj.description}</Text> : null}
              {proj.project_link ? (
                <Link src={proj.project_link} style={styles.link}>
                  {proj.project_link}
                </Link>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.entryBody}>
            {skills.map((s) => (s.proficiency_level ? `${s.skill_name} (${s.proficiency_level})` : s.skill_name)).join('  ·  ')}
          </Text>
        </View>
      )}

      {certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {certifications.map((cert) => (
            <Text key={cert.certification_id} style={styles.entry}>
              {cert.certification_name}
              {cert.issuing_organization ? ` - ${cert.issuing_organization}` : ''}
              {cert.issue_date ? ` (${formatDateRange(cert.issue_date)})` : ''}
            </Text>
          ))}
        </View>
      )}

      {achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.map((ach) => (
            <Text key={ach.achievement_id} style={styles.entry}>
              {ach.title}
              {ach.description ? ` - ${ach.description}` : ''}
            </Text>
          ))}
        </View>
      )}
    </Page>
  );
}

/**
 * Maps a template's `template_name` (same key used by
 * ../../templates/index.ts for the live preview, sourced from the
 * `templates` table — see server/db/seed.sql) to its @react-pdf/renderer
 * component. Keeping this keyed the same way as the DOM registry means a
 * resume's saved template selection resolves to the same design in both
 * the on-screen preview and the downloaded PDF.
 */
export const PDF_TEMPLATE_REGISTRY: Record<string, PdfTemplateComponent> = {
  Classic: ClassicPdfTemplate,
  Modern: ModernPdfTemplate,
  Minimal: MinimalPdfTemplate,
  Elegant: ElegantPdfTemplate,
};

const DEFAULT_PDF_TEMPLATE: PdfTemplateComponent = ClassicPdfTemplate;

/** Resolves a template_name to its PDF component, falling back to Classic
 *  for an unrecognized or missing name (e.g. no template selected yet) —
 *  mirrors templates/index.ts's resolveTemplate() fallback behavior. */
export function resolvePdfTemplate(templateName: string | null | undefined): PdfTemplateComponent {
  if (!templateName) return DEFAULT_PDF_TEMPLATE;
  return PDF_TEMPLATE_REGISTRY[templateName] ?? DEFAULT_PDF_TEMPLATE;
}
