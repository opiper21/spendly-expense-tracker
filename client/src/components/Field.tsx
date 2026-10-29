import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15";

export default function Field({ id, label, type, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          {...props}
          className={`${inputClass} ${isPassword ? "pr-11" : ""}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}