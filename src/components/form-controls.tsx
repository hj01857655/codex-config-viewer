import React from "react";

type SectionCardProps = {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

type FieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

type StringListEditorProps = {
  label: string;
  hint?: string;
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
  "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20";

export const textareaClassName = `${inputClassName} min-h-28 resize-y`;

export const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/10";

export const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50";

export function SectionCard({ id, title, description, children }: SectionCardProps) {
  return (
    <section
      id={id}
      className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_20px_80px_-40px_rgba(34,197,94,0.35)] backdrop-blur"
    >
      <div className="mb-5 space-y-1">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <div>
        <div className="text-sm font-medium text-slate-200">{label}</div>
        {hint ? <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p> : null}
      </div>
      {children}
    </label>
  );
}

export function StringListEditor({
  label,
  hint,
  values,
  onChange,
  addLabel,
  removeLabel,
  emptyLabel,
  placeholder,
}: StringListEditorProps) {
  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {values.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-slate-500">
            {emptyLabel}
          </div>
        ) : null}
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
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {values.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-slate-500">
            {emptyLabel}
          </div>
        ) : null}
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
