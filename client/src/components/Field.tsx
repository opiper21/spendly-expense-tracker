import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export default function Field({ id, label, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
      />
    </div>
  );
}