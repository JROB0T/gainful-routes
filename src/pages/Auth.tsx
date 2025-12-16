import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, ArrowLeft, Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Google icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Validation schemas
const emailSchema = z.string().email("Please enter a valid email address").max(255, "Email is too long");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username is too long")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

// User-friendly error messages for common Supabase errors
const mapAuthError = (error: string): string => {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Invalid email or password. Please try again.",
    "Email not confirmed": "Please check your email and confirm your account before signing in.",
    "User already registered": "An account with this email already exists. Please sign in instead.",
    "Password should be at least 6 characters": "Password must be at least 8 characters with uppercase, lowercase, and a number.",
    "Email rate limit exceeded": "Too many attempts. Please wait a few minutes before trying again.",
    "Signup disabled": "New account registration is currently disabled.",
  };
  
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return "An unexpected error occurred. Please try again.";
};

type AuthMode = "login" | "signup" | "forgot-password";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    username?: string;
  }>({});
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    if (mode === "signup") {
      const usernameResult = usernameSchema.safeParse(username);
      if (!usernameResult.success) {
        newErrors.username = usernameResult.error.errors[0].message;
      }

      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (mode === "login") {
      if (!password) {
        newErrors.password = "Password is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendWelcomeEmail = async (accessToken: string, userName: string) => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userName }),
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
      // Non-blocking - don't fail signup if email fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    // Helper for auth with retry on timeout
    const authWithRetry = async (retryCount = 0): Promise<any> => {
      const controller = new AbortController();
      const timeout = retryCount === 0 ? 15000 : 25000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        let result;
        if (mode === "login") {
          result = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
        } else if (mode === "signup") {
          result = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                username: username.trim(),
                full_name: username.trim(),
              },
            },
          });
        }
        clearTimeout(timeoutId);
        return result;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err?.name === 'AbortError' && retryCount < 1) {
          toast.info("Connection slow, retrying...", { duration: 3000 });
          return authWithRetry(retryCount + 1);
        }
        throw err;
      }
    };

    try {
      const { data: authData, error } = await authWithRetry();
      if (error) throw error;
      
      if (mode === "login") {
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else if (mode === "signup") {
        toast.success("Account created successfully!");
        
        // Send welcome email in background
        if (authData?.session?.access_token) {
          sendWelcomeEmail(authData.session.access_token, username.trim());
        }
        
        navigate("/get-started");
      }
    } catch (error: any) {
      const message = error?.name === 'AbortError' 
        ? "Connection timed out. Please check your network and try again."
        : (error?.message || "An error occurred");
      toast.error(mapAuthError(message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetEmailSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 overflow-x-hidden max-w-[100vw]">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">CareerMovr</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-display font-bold text-center mb-2 text-foreground">
            {mode === "login" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot-password" && "Reset your password"}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            {mode === "login" && "Sign in to access your dashboard"}
            {mode === "signup" && "Start discovering your opportunities"}
            {mode === "forgot-password" && "We'll send you a reset link"}
          </p>

          {/* Forgot Password Form */}
          {mode === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {resetEmailSent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-foreground font-medium mb-2">Check your email</p>
                  <p className="text-muted-foreground text-sm">
                    We've sent a password reset link to {email}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Login/Signup Form */}
          {(mode === "login" || mode === "signup") && (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (errors.username) setErrors({ ...errors, username: undefined });
                        }}
                        className={`pl-10 ${errors.username ? "border-destructive" : ""}`}
                        required={mode === "signup"}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-sm text-destructive">{errors.username}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Letters, numbers, and underscores only
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                  {mode === "signup" && (
                    <p className="text-xs text-muted-foreground">
                      8+ characters with uppercase, lowercase, and a number
                    </p>
                  )}
                </div>

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                        }}
                        className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                        required
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot-password")}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Please wait..."
                    : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleIcon />
                <span className="ml-2">Continue with Google</span>
              </Button>

              {/* Toggle */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                  className="text-primary font-medium hover:underline"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
