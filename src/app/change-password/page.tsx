import { requireClient } from '@/lib/auth/session';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/password';
import { changePassword } from '../login/actions';
import { AuthForm } from '../login/AuthForm';
import { AuthShell } from '../login/AuthShell';

export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage() {
  const client = await requireClient({ allowTempPassword: true });
  return (
    <AuthShell
      title="Придумайте пароль"
      subtitle={client.mustChangePassword ? `Временный пароль больше не понадобится. Минимум ${MIN_PASSWORD_LENGTH} символов.` : `Минимум ${MIN_PASSWORD_LENGTH} символов.`}
    >
      <AuthForm
        action={changePassword}
        submitLabel="Сохранить"
        fields={[
          { name: 'password', label: 'Новый пароль', type: 'password', autoComplete: 'new-password' },
          { name: 'repeat', label: 'Повторите пароль', type: 'password', autoComplete: 'new-password' },
        ]}
      />
    </AuthShell>
  );
}
