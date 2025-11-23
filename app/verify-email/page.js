import VerifyEmailClient from "./VerifyEmailClient";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage({ searchParams }) {
  const tokenParam = searchParams?.token;
  const token = typeof tokenParam === "string" ? tokenParam : null;

  return <VerifyEmailClient token={token} />;
}