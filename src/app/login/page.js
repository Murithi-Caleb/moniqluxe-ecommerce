import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Log in | Moniq☆Luxe",
  description: "Log in to your Moniq☆Luxe account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
