'use client';

import { useActionState } from 'react';
import type { FormState } from './actions';

type Field = { name: string; label: string; type: string; autoComplete: string };

export function AuthForm(props: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(props.action, {});
  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {state.error ? <div className="error" role="alert">{state.error}</div> : null}
      {props.fields.map((f) => (
        <label key={f.name} className="field">
          {f.label}
          <input name={f.name} type={f.type} autoComplete={f.autoComplete} required />
        </label>
      ))}
      <button className="btn btn-accent" type="submit" disabled={pending}>
        {pending ? 'Подождите…' : props.submitLabel}
      </button>
    </form>
  );
}
