import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/complete-profile"
      />
    </div>
  );
}
