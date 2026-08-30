import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { Resume, ResumeInput, ResumeCustomization } from '../types/resume';
import { Education, EducationInput } from '../types/education';
import { Experience, ExperienceInput } from '../types/experience';
import { Project, ProjectInput } from '../types/project';
import { Skill, SkillInput } from '../types/skill';
import { Certification, CertificationInput } from '../types/certification';
import { Achievement, AchievementInput } from '../types/achievement';
import { Template } from '../types/template';
import { resumeService } from '../services/resumeService';
import { educationService } from '../services/educationService';
import { experienceService } from '../services/experienceService';
import { projectService } from '../services/projectService';
import { skillService } from '../services/skillService';
import { certificationService } from '../services/certificationService';
import { achievementService } from '../services/achievementService';
import { templateService } from '../services/templateService';

/** Shape consumed by the preview/PDF renderers — unchanged from Part 1. */
export interface ResumeDraft {
  resume: Partial<Resume>;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ResumeBuilderContextValue {
  resumeId: number;
  draft: ResumeDraft;
  template: Template | null;
  templates: Template[];
  loading: boolean;
  loadError: string | null;
  saveStatus: SaveStatus;

  updatePersonalField: (field: keyof ResumeInput, value: string) => void;
  savePersonalNow: () => Promise<void>;
  selectTemplate: (templateId: number | null) => Promise<void>;
  updateCustomization: (customization: ResumeCustomization) => Promise<void>;
  /** Flushes any pending/in-flight saves (personal fields, template,
   *  customization) and only then triggers the browser print dialog — see
   *  "Save/Print uses stale data" fix below. */
  saveAndPrint: () => Promise<void>;

  addEducation: (data: EducationInput) => Promise<void>;
  updateEducationEntry: (id: number, data: Partial<EducationInput>) => Promise<void>;
  removeEducation: (id: number) => Promise<void>;

  addExperience: (data: ExperienceInput) => Promise<void>;
  updateExperienceEntry: (id: number, data: Partial<ExperienceInput>) => Promise<void>;
  removeExperience: (id: number) => Promise<void>;

  addProject: (data: ProjectInput) => Promise<void>;
  updateProjectEntry: (id: number, data: Partial<ProjectInput>) => Promise<void>;
  removeProject: (id: number) => Promise<void>;

  addSkill: (data: SkillInput) => Promise<void>;
  updateSkillEntry: (id: number, data: Partial<SkillInput>) => Promise<void>;
  removeSkill: (id: number) => Promise<void>;

  addCertification: (data: CertificationInput) => Promise<void>;
  updateCertificationEntry: (id: number, data: Partial<CertificationInput>) => Promise<void>;
  removeCertification: (id: number) => Promise<void>;

  addAchievement: (data: AchievementInput) => Promise<void>;
  updateAchievementEntry: (id: number, data: Partial<AchievementInput>) => Promise<void>;
  removeAchievement: (id: number) => Promise<void>;
}

const ResumeBuilderContext = createContext<ResumeBuilderContextValue | undefined>(undefined);

const AUTOSAVE_DELAY_MS = 800;
// Customization changes (font size / spacing / accent color) previously sent
// an immediate API request per click. Clicking through several options
// quickly (e.g. Blue then Green) fired overlapping requests that could
// resolve out of order, letting a stale response overwrite a newer
// selection (Part 4 §9). A short debounce coalesces rapid changes into one
// request, and the sequence guard in updateCustomization below additionally
// ignores any response that's no longer the latest one requested.
const CUSTOMIZATION_DEBOUNCE_MS = 400;

/**
 * Loads a real resume (by id) from the backend on mount and keeps every
 * section in sync with PostgreSQL through the Part 2 API — nothing here is
 * held only in browser memory. Personal-info text fields autosave with a
 * short debounce (plus a manual Save button); every add/edit/delete on a
 * structured section (education, experience, ...) is persisted immediately
 * via its dedicated endpoint, and local state is then replaced with exactly
 * what the server returned (never a fake client-generated id).
 */
export function ResumeBuilderProvider({ resumeId, children }: { resumeId: number; children: ReactNode }) {
  const [resume, setResume] = useState<Partial<Resume>>({});
  const [template, setTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const pendingPatchRef = useRef<ResumeInput>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customizationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customizationSeqRef = useRef(0);
  const customizationOpPendingRef = useRef(false);

  // Counts in-flight persistence work (the personal-field autosave, template
  // selection, and customization save) so saveAndPrint (below) can tell
  // whether it's safe to open the print dialog yet, without depending on
  // `saveStatus` — which is fine for display but, being a plain state value,
  // is stale inside a long-running async closure and can't be polled.
  const pendingOpsRef = useRef(0);
  function beginOp() {
    pendingOpsRef.current += 1;
  }
  function endOp() {
    pendingOpsRef.current = Math.max(0, pendingOpsRef.current - 1);
  }
  // Capped so a single hung request (dropped connection, etc.) can't leave
  // the Print button unresponsive forever — after ~5s it proceeds anyway
  // rather than trapping the user, printing whatever the last-known local
  // state is (still far better than the pre-fix behavior of not waiting at
  // all).
  async function waitForPendingSaves() {
    const start = Date.now();
    while (pendingOpsRef.current > 0 && Date.now() - start < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }

  // Initial load: the full resume + every section, plus the template gallery
  // (needed so selectTemplate can resolve a Template object for the preview).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([resumeService.getFull(resumeId), templateService.list()])
      .then(([full, allTemplates]) => {
        if (cancelled) return;
        setResume(full.resume);
        setTemplate(full.template);
        setEducation(full.education);
        setExperience(full.experience);
        setProjects(full.projects);
        setSkills(full.skills);
        setCertifications(full.certifications);
        setAchievements(full.achievements);
        setTemplates(allTemplates);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load resume');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  // Fields that are optional server-side but validated when present (e.g.
  // `email` must be a valid email format). Clearing the field in the UI
  // produces an empty string, which is a valid "no value" from the user's
  // point of view but fails that validation if sent literally — so these
  // are omitted from the outgoing patch entirely when empty, matching how
  // "optional" is meant to behave. `title` is intentionally excluded: it's
  // required, so an empty title should still be sent and surface its own
  // save error rather than being silently dropped.
  const OPTIONAL_TEXT_FIELDS: (keyof ResumeInput)[] = ['full_name', 'email', 'phone', 'location', 'summary'];

  const flushPersonalSave = useCallback(async () => {
    if (Object.keys(pendingPatchRef.current).length === 0) return;
    const patch: ResumeInput = { ...pendingPatchRef.current };
    pendingPatchRef.current = {};
    for (const field of OPTIONAL_TEXT_FIELDS) {
      if (patch[field] === '') delete patch[field];
    }
    setSaveStatus('saving');
    beginOp();
    try {
      await resumeService.update(resumeId, patch);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    } finally {
      endOp();
    }
  }, [resumeId]);

  function updatePersonalField(field: keyof ResumeInput, value: string) {
    setResume((prev) => ({ ...prev, [field]: value }));
    pendingPatchRef.current = { ...pendingPatchRef.current, [field]: value };

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      void flushPersonalSave();
    }, AUTOSAVE_DELAY_MS);
  }

  async function savePersonalNow() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    await flushPersonalSave();
  }

  // Applies the new template to local state immediately (optimistic, same
  // pattern as updateCustomization below) instead of waiting on the network
  // round trip. Previously `template` only updated inside the `.then()`, so
  // switching templates and immediately hitting Save/Print (or Download PDF)
  // before that request resolved rendered the OLD template — the root cause
  // of the Editor's stale Save/Print output. `templates` already carries
  // everything the preview/print/PDF renderers need (see types/template.ts),
  // so there's nothing to lose by not waiting for the server's copy back.
  const previousTemplateRef = useRef<Template | null>(null);
  async function selectTemplate(templateId: number | null) {
    previousTemplateRef.current = template;
    const nextTemplate = templateId ? templates.find((t) => t.template_id === templateId) ?? null : null;
    setTemplate(nextTemplate);
    setResume((prev) => ({ ...prev, template_id: templateId }));
    setSaveStatus('saving');
    beginOp();
    try {
      const { resume: updated } = await resumeService.update(resumeId, { template_id: templateId ?? undefined });
      setResume(updated);
      setSaveStatus('saved');
    } catch {
      // Roll back the optimistic update so the UI (and any print/PDF taken
      // right after the failure) doesn't claim a template that was never
      // actually saved.
      setTemplate(previousTemplateRef.current);
      setResume((prev) => ({ ...prev, template_id: previousTemplateRef.current?.template_id ?? null }));
      setSaveStatus('error');
      throw new Error('Failed to update template');
    } finally {
      endOp();
    }
  }

  // Updates layout customization (font size / spacing / accent color).
  // Applied to local state immediately so the live preview updates without
  // waiting on the network (Part 4 §10), then persisted with a short
  // debounce. `seq` is captured at call time and compared against the
  // shared ref when the (debounced) request resolves, so a response for an
  // earlier selection can never clobber a newer one even if requests
  // somehow resolve out of order (Part 4 §9).
  async function updateCustomization(customization: ResumeCustomization) {
    setResume((prev) => ({ ...prev, customization }));
    setSaveStatus('saving');

    const seq = ++customizationSeqRef.current;
    if (customizationDebounceRef.current) {
      clearTimeout(customizationDebounceRef.current);
      // The timer just cancelled had already counted itself as a pending
      // op (see below) but, being cancelled, will now never fire and never
      // reach its own endOp() — release that slot here or waitForPendingSaves
      // (used by saveAndPrint) would wait on a request that's never coming.
      if (customizationOpPendingRef.current) {
        endOp();
        customizationOpPendingRef.current = false;
      }
    }

    // Counted as pending from the moment it's queued (not just once the
    // debounce timer fires) so saveAndPrint, called during the debounce
    // window, correctly waits for this request rather than racing it.
    beginOp();
    customizationOpPendingRef.current = true;
    return new Promise<void>((resolve, reject) => {
      customizationDebounceRef.current = setTimeout(() => {
        customizationOpPendingRef.current = false;
        resumeService
          .update(resumeId, { customization })
          .then(({ resume: updated }) => {
            if (seq !== customizationSeqRef.current) return; // superseded — drop this stale response
            setResume(updated);
            setSaveStatus('saved');
            resolve();
          })
          .catch(() => {
            if (seq !== customizationSeqRef.current) return;
            setSaveStatus('error');
            reject(new Error('Failed to update customization'));
          })
          .finally(() => endOp());
      }, CUSTOMIZATION_DEBOUNCE_MS);
    });
  }

  // ---- Education -----------------------------------------------------
  async function addEducation(data: EducationInput) {
    const { education: created } = await educationService.create(resumeId, data);
    setEducation((prev) => [...prev, created]);
  }
  async function updateEducationEntry(id: number, data: Partial<EducationInput>) {
    const { education: updated } = await educationService.update(id, data);
    setEducation((prev) => prev.map((e) => (e.education_id === id ? updated : e)));
  }
  async function removeEducation(id: number) {
    await educationService.remove(id);
    setEducation((prev) => prev.filter((e) => e.education_id !== id));
  }

  // ---- Experience ------------------------------------------------------
  async function addExperience(data: ExperienceInput) {
    const { experience: created } = await experienceService.create(resumeId, data);
    setExperience((prev) => [...prev, created]);
  }
  async function updateExperienceEntry(id: number, data: Partial<ExperienceInput>) {
    const { experience: updated } = await experienceService.update(id, data);
    setExperience((prev) => prev.map((e) => (e.experience_id === id ? updated : e)));
  }
  async function removeExperience(id: number) {
    await experienceService.remove(id);
    setExperience((prev) => prev.filter((e) => e.experience_id !== id));
  }

  // ---- Projects ----------------------------------------------------------
  async function addProject(data: ProjectInput) {
    const { project: created } = await projectService.create(resumeId, data);
    setProjects((prev) => [...prev, created]);
  }
  async function updateProjectEntry(id: number, data: Partial<ProjectInput>) {
    const { project: updated } = await projectService.update(id, data);
    setProjects((prev) => prev.map((p) => (p.project_id === id ? updated : p)));
  }
  async function removeProject(id: number) {
    await projectService.remove(id);
    setProjects((prev) => prev.filter((p) => p.project_id !== id));
  }

  // ---- Skills --------------------------------------------------------------
  async function addSkill(data: SkillInput) {
    const { skill: created } = await skillService.create(resumeId, data);
    setSkills((prev) => [...prev, created]);
  }
  async function updateSkillEntry(id: number, data: Partial<SkillInput>) {
    const { skill: updated } = await skillService.update(id, data);
    setSkills((prev) => prev.map((s) => (s.skill_id === id ? updated : s)));
  }
  async function removeSkill(id: number) {
    await skillService.remove(id);
    setSkills((prev) => prev.filter((s) => s.skill_id !== id));
  }

  // ---- Certifications --------------------------------------------------------
  async function addCertification(data: CertificationInput) {
    const { certification: created } = await certificationService.create(resumeId, data);
    setCertifications((prev) => [...prev, created]);
  }
  async function updateCertificationEntry(id: number, data: Partial<CertificationInput>) {
    const { certification: updated } = await certificationService.update(id, data);
    setCertifications((prev) => prev.map((c) => (c.certification_id === id ? updated : c)));
  }
  async function removeCertification(id: number) {
    await certificationService.remove(id);
    setCertifications((prev) => prev.filter((c) => c.certification_id !== id));
  }

  // ---- Achievements ------------------------------------------------------------
  async function addAchievement(data: AchievementInput) {
    const { achievement: created } = await achievementService.create(resumeId, data);
    setAchievements((prev) => [...prev, created]);
  }
  async function updateAchievementEntry(id: number, data: Partial<AchievementInput>) {
    const { achievement: updated } = await achievementService.update(id, data);
    setAchievements((prev) => prev.map((a) => (a.achievement_id === id ? updated : a)));
  }
  async function removeAchievement(id: number) {
    await achievementService.remove(id);
    setAchievements((prev) => prev.filter((a) => a.achievement_id !== id));
  }

  // Editor "Save/Print" sequence (see fix notes above the print button in
  // ResumeBuilderPage.tsx): flush the debounced personal-field autosave,
  // then wait for any other in-flight save (template, customization) to
  // settle, so the print/PDF renderers — which already read live from
  // `draft`/`template` state — are guaranteed to be showing the same data
  // that's been persisted, not a version that's still mid-save. Only then
  // open the browser print dialog.
  async function saveAndPrint() {
    await savePersonalNow();
    await waitForPendingSaves();
    window.print();
  }

  const draft: ResumeDraft = { resume, education, experience, projects, skills, certifications, achievements };

  return (
    <ResumeBuilderContext.Provider
      value={{
        resumeId,
        draft,
        template,
        templates,
        loading,
        loadError,
        saveStatus,
        updatePersonalField,
        savePersonalNow,
        selectTemplate,
        updateCustomization,
        saveAndPrint,
        addEducation,
        updateEducationEntry,
        removeEducation,
        addExperience,
        updateExperienceEntry,
        removeExperience,
        addProject,
        updateProjectEntry,
        removeProject,
        addSkill,
        updateSkillEntry,
        removeSkill,
        addCertification,
        updateCertificationEntry,
        removeCertification,
        addAchievement,
        updateAchievementEntry,
        removeAchievement,
      }}
    >
      {children}
    </ResumeBuilderContext.Provider>
  );
}

export function useResumeBuilder(): ResumeBuilderContextValue {
  const ctx = useContext(ResumeBuilderContext);
  if (!ctx) throw new Error('useResumeBuilder must be used within a ResumeBuilderProvider');
  return ctx;
}
