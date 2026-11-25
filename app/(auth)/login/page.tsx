import { LoginForm } from "./login-form";

// 🩹 2026-10-20: server component só pra ler a env var sem expor nada ao
// client - o botão "Entrar com Google" só aparece quando o deploy configurou
// GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET (ver lib/auth.ts), senão some sem
// quebrar nada (continua só Credentials, como sempre foi).
export default function LoginPage() {
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return <LoginForm hasGoogle={hasGoogle} />;
}
