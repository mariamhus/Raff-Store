import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
  className?: string;
}

export function Field({ id, label, error, children, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined })}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
