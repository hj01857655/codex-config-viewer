import React from "react";

export type BadgeTone = "added" | "deprecated" | "removed" | "changed";

export type Badge = {
  label: string;
  tone: BadgeTone;
};

type SectionCardProps = {
  id?: string;
  title: string;
  description?: string;
  badges?: Badge[];
  children: React.ReactNode;
};

type FieldProps = {
  label: string;
  hint?: string;
  badges?: Badge[];
  children: React.ReactNode;
};

type StringListEditorProps = {
  label: string;
  hint?: string;
  badges?: Badge[];
  values: string[];
  onChange: (values: string[]) => void;
  addLabel: string;
  removeLabel: string;
  emptyLabel: string;
  placeholder?: string;
};

type KeyValueListEditorProps = {
  label: string;
  hint?: string;
  badges?: Badge[];
  values: Array<{ key: string; value: string }>;
  onChange: (values: Array<{ key: string; value: string }>) => void;
  addLabel: string;
  removeLabel: string;
  emptyLabel: string;
  keyLabel: string;
  valueLabel: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
};

export const inputClassName =
  "w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--foreground)] shadow-[var(--shadow-control)] outline-none transition hover:border-[var(--accent)]/30 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 placeholder:text-[var(--foreground-muted)] disabled:cursor-not-allowed disabled:opacity-60";

export const textareaClassName = `${inputClassName} min-h-32 resize-y`;

export const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-medium !text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 active:translate-y-px active:shadow-none";

export const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] px-3 py-2 text-sm font-semibold !text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--accent-strong)] hover:shadow-[var(--shadow-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 active:translate-y-px active:shadow-[var(--shadow-button-active)] disabled:cursor-not-allowed disabled:bg-[var(--accent)]/50";

export const surfaceCardClassName =
  "rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm";

export const surfaceInsetClassName =
  "rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-strong)]";

export const surfaceSoftClassName =
  "rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-soft)]";

export const emptyStateClassName =
  "rounded-[var(--radius-control)] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--foreground-muted)]";

export const formSectionHeaderClassName =
  "rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3";

export const formBadgeClassName =
  "inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground-muted)]";

export const checkboxCardClassName =
  "flex items-start gap-3 rounded-[var(--radius-control)] border px-4 py-3";
export const hintPillClassName =
  "inline-block max-w-full rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-mono leading-5 text-[var(--foreground-muted)] whitespace-pre-wrap break-words";

function badgeToneClassName(tone: BadgeTone) {
  switch (tone) {
    case "added":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
    case "deprecated":
      return "border-amber-200/80 bg-amber-50 text-amber-700";
    case "removed":
      return "border-rose-200/80 bg-rose-50 text-rose-700";
    case "changed":
      return "border-sky-200/80 bg-sky-50 text-sky-700";
    default:
      return "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground-muted)]";
  }
}

function BadgeRow({ badges }: { badges?: Badge[] }) {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" aria-hidden="true">
      {badges.map((badge, index) => (
        <span
          key={`${badge.label}-${index}`}
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${badgeToneClassName(
            badge.tone,
          )}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export function SectionCard({ id, title, description, badges, children }: SectionCardProps) {
  return (
    <section
      id={id}
      className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] backdrop-blur transition hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-card-hover)] before:absolute before:left-0 before:top-6 before:bottom-6 before:w-1 before:rounded-full before:bg-[var(--accent)]/20"
    >
      <div className="pointer-events-none absolute right-6 top-6 h-16 w-16 rounded-full bg-[var(--accent)]/15 blur-2xl" />
      <div className="relative z-10 mb-5 space-y-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <BadgeRow badges={badges} />
        </div>
        {description ? (
          <p className="text-sm text-[var(--foreground-muted)]">{description}</p>
        ) : null}
      </div>
      <div className="relative z-10 space-y-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, badges, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
          <BadgeRow badges={badges} />
        </div>
        {hint ? (
          <div>
            <span className={hintPillClassName}>{hint}</span>
          </div>
        ) : null}
      </div>
      {children}
    </label>
  );
}

export function StringListEditor({
  label,
  hint,
  badges,
  values,
  onChange,
  addLabel,
  removeLabel,
  emptyLabel,
  placeholder,
}: StringListEditorProps) {
  return (
    <Field label={label} hint={hint} badges={badges}>
      <div className="space-y-2">
        {values.length === 0 ? <div className={emptyStateClassName}>{emptyLabel}</div> : null}
        {values.map((value, index) => (
          <div key={`list-value-${index}`} className="flex gap-2">
            <input
              className={inputClassName}
              value={value}
              placeholder={placeholder}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className={secondaryButtonClassName}
              onClick={() => onChange(values.filter((_, currentIndex) => currentIndex !== index))}
            >
              {removeLabel}
            </button>
          </div>
        ))}
        <button
          type="button"
          className={secondaryButtonClassName}
          onClick={() => onChange([...values, ""])}
        >
          {addLabel}
        </button>
      </div>
    </Field>
  );
}

export function KeyValueListEditor({
  label,
  hint,
  badges,
  values,
  onChange,
  addLabel,
  removeLabel,
  emptyLabel,
  keyLabel,
  valueLabel,
  keyPlaceholder,
  valuePlaceholder,
}: KeyValueListEditorProps) {
  return (
    <Field label={label} hint={hint} badges={badges}>
      <div className="space-y-2">
        {values.length === 0 ? <div className={emptyStateClassName}>{emptyLabel}</div> : null}
        {values.map((item, index) => (
          <div key={`pair-${index}`} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input
              aria-label={keyLabel}
              className={inputClassName}
              value={item.key}
              placeholder={keyPlaceholder}
              onChange={(event) => {
                const next = [...values];
                next[index] = { ...item, key: event.target.value };
                onChange(next);
              }}
            />
            <input
              aria-label={valueLabel}
              className={inputClassName}
              value={item.value}
              placeholder={valuePlaceholder}
              onChange={(event) => {
                const next = [...values];
                next[index] = { ...item, value: event.target.value };
                onChange(next);
              }}
            />
            <button
              type="button"
              className={secondaryButtonClassName}
              onClick={() => onChange(values.filter((_, currentIndex) => currentIndex !== index))}
            >
              {removeLabel}
            </button>
          </div>
        ))}
        <button
          type="button"
          className={secondaryButtonClassName}
          onClick={() => onChange([...values, { key: "", value: "" }])}
        >
          {addLabel}
        </button>
      </div>
    </Field>
  );
}
