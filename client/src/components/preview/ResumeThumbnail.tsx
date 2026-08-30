import React, { useLayoutEffect, useRef, useState } from 'react';
import { ResumeDraft } from '../../contexts/ResumeBuilderContext';
import { resolveTemplate } from '../../templates';

const RESUME_PAGE_WIDTH = 816;
const RESUME_PAGE_HEIGHT = 1056;

const EMPTY_DRAFT: ResumeDraft = {
  resume: {},
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
};

/** Shared document aspect ratio used by all miniature resume surfaces. */
export const RESUME_PAGE_ASPECT_CLASS = 'aspect-[816/1056]';

interface ResumeThumbnailProps {
  templateName: string | null | undefined;
  /** Data to render inside the real template. Gallery/marketing previews pass
   *  sampleResumeData; dashboard previews pass the user's real resume data. */
  draft?: ResumeDraft;
  className?: string;
}

/**
 * Render the real resume template at document coordinates and scale it into
 * the available miniature frame.
 *
 * The important detail is that the scale is constrained by BOTH width and
 * content height. Earlier versions only scaled by width and clipped any
 * resume whose rendered content exceeded one 816×1056 page. That made
 * dashboard cards look like they contained only a name/email even though the
 * real resume had education, experience and projects.
 *
 * The outer frame keeps a stable paper ratio and the thumbnail always fills
 * its available width. Content is measured only to detect an overlong render;
 * instead of shrinking horizontally (which would leave an empty right side),
 * the miniature keeps the document width and lets the paper frame represent
 * the visible document area. No fixed 640px source width is used.
 *
 * Two separate concerns are measured independently, and deliberately never
 * feed into each other:
 *   - `scale` (fills the card horizontally) depends only on the frame's
 *     width, via a ResizeObserver on `frame`.
 *   - `contentDensity` (shrinks long content so it still fits one page)
 *     depends only on the page's *natural* (density = 1) content height,
 *     measured once per template/data change.
 * An earlier version observed the `page` element with the same
 * ResizeObserver used for width, then fed the measured height back into
 * `contentDensity`, which itself changes the page's rendered width/height —
 * i.e. it observed the very element it was mutating. Because text reflow
 * isn't perfectly proportional to width, that produced two (or more) states
 * that never agreed, so the observer kept firing indefinitely: a genuine
 * infinite re-render loop that pegs the CPU and makes the surrounding page
 * (e.g. a dashboard with several thumbnails, each running its own copy of
 * this loop) appear to hang instead of load. Keeping the two measurements on
 * separate, non-overlapping inputs makes each one settle after a single
 * pass.
 */
export function ResumeThumbnail({ templateName, draft, className = '' }: ResumeThumbnailProps) {
  const TemplateComponent = resolveTemplate(templateName);
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [contentDensity, setContentDensity] = useState(1);

  // Width-driven scale: observes ONLY the frame (the card's own box, whose
  // size is controlled by CSS layout/aspect-ratio, not by anything this
  // component sets), so there is no feedback path back into this observer.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateScale = () => {
      const frameWidth = frame.clientWidth;
      setScale(frameWidth > 0 ? frameWidth / RESUME_PAGE_WIDTH : 0);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  // Content-density: measured once per template/data change, at the page's
  // natural (density = 1) height — never re-measured off of a size this
  // effect itself changes, so it can't oscillate. A resume that's still too
  // tall after one pass stays slightly dense rather than looping forever;
  // that's a reasonable trade-off for a miniature preview.
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    setContentDensity(1);

    const measure = () => {
      const naturalHeight = page.scrollHeight;
      if (naturalHeight <= 0) return;
      const nextDensity = Math.min(1, RESUME_PAGE_HEIGHT / naturalHeight);
      // Avoid a redundant state update (and thus a redundant re-render) when
      // the natural height already fits or the change is negligible.
      setContentDensity((prev) => (Math.abs(prev - nextDensity) < 0.005 ? prev : nextDensity));
    };

    // Measure after the density=1 reset above has actually painted, and once
    // more on the next frame in case font loading changed the height.
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      measure();
      raf2 = window.requestAnimationFrame(measure);
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [templateName, draft]);

  return (
    <div
      ref={frameRef}
      className={`resume-thumb-frame relative overflow-hidden bg-white ${className}`}
      style={{ aspectRatio: `${RESUME_PAGE_WIDTH} / ${RESUME_PAGE_HEIGHT}` }}
    >
      <div
        ref={pageRef}
        className="resume-thumb-page pointer-events-none absolute left-0 top-0 select-none bg-white"
        aria-hidden="true"
        style={{
          width: RESUME_PAGE_WIDTH,
          minHeight: RESUME_PAGE_HEIGHT,
          height: 'auto',
          padding: 32,
          boxSizing: 'border-box',
          transform: `scale(${scale || 0})`,
          transformOrigin: 'top left',
          visibility: scale > 0 ? 'visible' : 'hidden',
        }}
      >
        <div
          className="resume-thumb-content"
          style={{
            width: `${100 / contentDensity}%`,
            transform: `scale(${contentDensity})`,
            transformOrigin: 'top left',
          }}
        >
          <TemplateComponent draft={draft ?? EMPTY_DRAFT} />
        </div>
      </div>
    </div>
  );
}
