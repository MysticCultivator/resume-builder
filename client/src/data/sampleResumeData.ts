import { ResumeDraft } from '../contexts/ResumeBuilderContext';

/**
 * A single, richly-filled, fictional resume used ONLY to render template
 * previews (gallery cards, dashboard "new resume" flow, landing hero).
 *
 * This must never be used to seed a real resume: `CreateResume` sends only
 * `{ title, template_id }` to the API (see TemplateGalleryPage), so nothing
 * here ever reaches `resumeService.create`/`update` or any autosave path.
 * Every template renders this same normalized `ResumeDraft` shape and
 * naturally shows/hides sections the way it already does for real data —
 * no template-specific sample content exists anywhere else.
 *
 * All ids are negative to make it obvious at a glance (e.g. in dev tools)
 * that a record did not come from the database.
 */
export const sampleResumeData: ResumeDraft = {
  resume: {
    resume_id: -1,
    full_name: 'Alex Morgan',
    title: 'Product Designer Resume',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 014-2048',
    location: 'New York, NY',
    summary:
      'Product designer with 6+ years shaping web and mobile experiences for growing teams. Focused on turning ' +
      'ambiguous problems into simple, well-tested interfaces, and on pairing closely with engineering to ship them.',
  },
  education: [
    {
      education_id: -1,
      resume_id: -1,
      institution_name: 'University of Michigan',
      degree: 'B.F.A.',
      field_of_study: 'Graphic Design',
      start_date: '2014-09-01',
      end_date: '2018-05-01',
      gpa: '3.7',
      order_index: 0,
      education_level: 'degree',
    },
    {
      education_id: -2,
      resume_id: -1,
      institution_name: 'General Assembly',
      degree: 'Certificate',
      field_of_study: 'User Experience Design',
      start_date: '2018-06-01',
      end_date: '2018-09-01',
      gpa: null,
      order_index: 1,
      education_level: 'higher_secondary',
    },
  ],
  experience: [
    {
      experience_id: -1,
      resume_id: -1,
      company_name: 'Northwind Analytics',
      job_title: 'Senior Product Designer',
      start_date: '2022-03-01',
      end_date: null,
      is_current: true,
      description:
        'Lead design for the reporting and dashboards product used by 40k+ weekly active users.\n' +
        'Cut new-user time-to-first-report from 9 minutes to under 3 by redesigning the setup flow.\n' +
        'Built and maintain the team\u2019s shared component library alongside two frontend engineers.\n' +
        'Run quarterly usability studies that directly shape the roadmap.',
      order_index: 0,
    },
    {
      experience_id: -2,
      resume_id: -1,
      company_name: 'Bramble & Co.',
      job_title: 'Product Designer',
      start_date: '2019-07-01',
      end_date: '2022-02-01',
      is_current: false,
      description:
        'Designed core checkout and account flows for a mid-market e-commerce platform.\n' +
        'Partnered with PM and engineering to launch a redesigned mobile app, raising checkout conversion 12%.\n' +
        'Introduced a lightweight design-review process adopted across three product teams.',
      order_index: 1,
    },
    {
      experience_id: -3,
      resume_id: -1,
      company_name: 'Studio Larkspur',
      job_title: 'Junior Designer',
      start_date: '2018-09-01',
      end_date: '2019-06-01',
      is_current: false,
      description:
        'Produced marketing and product visuals for a roster of early-stage startup clients.\n' +
        'Assisted senior designers with wireframes and interactive prototypes for client pitches.',
      order_index: 2,
    },
  ],
  projects: [
    {
      project_id: -1,
      resume_id: -1,
      project_name: 'Fieldnote',
      description: 'A minimal note-taking app for researchers, with tagging and offline-first sync.',
      project_link: 'https://example.com/projects/fieldnote',
      technologies: 'Figma, React, IndexedDB',
      order_index: 0,
    },
    {
      project_id: -2,
      resume_id: -1,
      project_name: 'Design tokens starter kit',
      description: 'An open-source starter kit for syncing Figma variables to a Tailwind config.',
      project_link: 'https://example.com/projects/tokens-starter',
      technologies: 'Figma API, TypeScript',
      order_index: 1,
    },
    {
      project_id: -3,
      resume_id: -1,
      project_name: 'Commuter transit map redesign',
      description: 'A personal redesign of a regional transit map, focused on legibility at small sizes.',
      project_link: null,
      technologies: 'Illustrator',
      order_index: 2,
    },
  ],
  skills: [
    { skill_id: -1, resume_id: -1, skill_name: 'Product Design', category: 'technical', proficiency_level: 'expert' },
    { skill_id: -2, resume_id: -1, skill_name: 'Figma', category: 'technical', proficiency_level: 'expert' },
    { skill_id: -3, resume_id: -1, skill_name: 'Design Systems', category: 'technical', proficiency_level: 'advanced' },
    { skill_id: -4, resume_id: -1, skill_name: 'Prototyping', category: 'technical', proficiency_level: 'advanced' },
    { skill_id: -5, resume_id: -1, skill_name: 'User Research', category: 'technical', proficiency_level: 'advanced' },
    { skill_id: -6, resume_id: -1, skill_name: 'HTML/CSS', category: 'technical', proficiency_level: 'intermediate' },
    { skill_id: -7, resume_id: -1, skill_name: 'Accessibility', category: 'technical', proficiency_level: 'advanced' },
    { skill_id: -8, resume_id: -1, skill_name: 'Cross-functional Collaboration', category: 'soft', proficiency_level: null },
    { skill_id: -9, resume_id: -1, skill_name: 'Design Critique', category: 'soft', proficiency_level: null },
    { skill_id: -10, resume_id: -1, skill_name: 'Stakeholder Communication', category: 'soft', proficiency_level: null },
  ],
  certifications: [
    {
      certification_id: -1,
      resume_id: -1,
      certification_name: 'Certified Usability Analyst',
      issuing_organization: 'Human Factors International',
      issue_date: '2021-04-01',
      credential_id: null,
      credential_url: null,
      order_index: 0,
    },
    {
      certification_id: -2,
      resume_id: -1,
      certification_name: 'Accessibility Fundamentals',
      issuing_organization: 'Deque University',
      issue_date: '2023-01-01',
      credential_id: null,
      credential_url: null,
      order_index: 1,
    },
  ],
  achievements: [
    {
      achievement_id: -1,
      resume_id: -1,
      title: 'Speaker, Design Systems Meetup NYC',
      description: 'Gave a talk on scaling shared component libraries across product teams.',
      achieved_date: '2023-10-01',
      order_index: 0,
    },
    {
      achievement_id: -2,
      resume_id: -1,
      title: 'Internal "Design Impact" Award',
      description: 'Recognized for the reporting-flow redesign that reduced setup time company-wide.',
      achieved_date: '2024-02-01',
      order_index: 1,
    },
  ],
};
