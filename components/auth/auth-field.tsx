// Form field wrapper: label (optionally with a right-aligned link) + control
// + inline error. Server-safe; the control itself comes from the caller.
export function AuthField({
  label,
  htmlFor,
  labelRight,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  /** Optional element rendered at the right end of the label row. */
  labelRight?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-field">
      <div className="auth-label-row">
        <label htmlFor={htmlFor}>{label}</label>
        {labelRight}
      </div>
      {children}
      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
