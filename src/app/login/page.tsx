import { redirect } from 'next/navigation';
import { getSessionClient } from '@/lib/auth/session';
import { login } from './actions';
import { AuthForm } from './AuthForm';
import { AuthShell } from './AuthShell';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await getSessionClient()) redirect('/');
  return (
    <AuthShell title="Личный кабинет" subtitle="Логин и временный пароль пришли вам в письме от «Русского Севера».">
      <AuthForm
        action={login}
        submitLabel="Войти"
        fields={[
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'username' },
          { name: 'password', label: 'Пароль', type: 'password', autoComplete: 'current-password' },
        ]}
      />
      <p className="muted small" style={{ margin: 0 }}>Нет письма или забыли пароль? Напишите вашему менеджеру, он отправит приглашение повторно.</p>
    </AuthShell>
  );
}
