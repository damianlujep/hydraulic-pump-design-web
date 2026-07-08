import { LoginForm } from "./LoginForm";

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) => {
  const { redirect } = await searchParams;
  return <LoginForm redirect={redirect} />;
};

export default LoginPage;
