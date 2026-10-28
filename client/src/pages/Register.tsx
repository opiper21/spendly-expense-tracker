import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import AuthLayout from "../components/AuthLayout";
import DemoButton from "../components/DemoButton";
import Field from "../components/Field";
import { useAuth } from "../context/authContext";

export default function Register() {
  const { user, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="It only takes a minute to get started.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />

        <Field
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <Field
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden text-sm text-expense"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent py-3 font-semibold text-accent-ink transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </motion.button>
      </form>

      <DemoButton />

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}