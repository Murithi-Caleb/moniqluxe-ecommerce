import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Create an account | Moniq☆Luxe",
  description: "Create your Moniq☆Luxe account.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
