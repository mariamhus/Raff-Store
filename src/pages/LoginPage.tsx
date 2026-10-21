import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { Field } from "../components/Field";
import { ApiError } from "../lib/api";
import { errorText } from "../lib/validation";
import { useAuth } from "../stores/auth";
import { useToasts } from "../stores/toasts";

const loginSchema = z.object({
  username: z.string().trim().min(1, "validation.required"),
  password: z.string().min(1, "validation.required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO = { username: "emilys", password: "emilyspass" };

function safeRedirect(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useAuth((state) => state.user);
  const login = useAuth((state) => state.login);
  const show = useToasts((state) => state.show);
  const [failure, setFailure] = useState<"invalid" | "network" | null>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);
  const redirect = safeRedirect(params.get("redirect"));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { username: "", password: "" } });

  useEffect(() => {
    if (failure) alertRef.current?.focus();
  }, [failure]);

  useEffect(() => {
    document.title = `${t("auth.title")} | ${t("brand")}`;
  }, [t]);

  if (user && !isSubmitting) return <Navigate to={redirect} replace />;

  return (
    <div className="mx-auto max-w-md px-4 pt-12 sm:pt-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("auth.title")}</h1>
      <p className="mt-2 text-muted">{t("auth.subtitle")}</p>

      <div className="mt-6 rounded-2xl bg-tile p-4">
        <p className="flex items-center gap-2 font-semibold">
          <KeyRound aria-hidden="true" className="size-4.5" />
          {t("auth.demoTitle")}
        </p>
        <p className="mt-1 text-sm text-muted">{t("auth.demoText")}</p>
        <p className="mt-2 font-mono text-sm" dir="ltr">
          {DEMO.username} / {DEMO.password}
        </p>
        <button
          type="button"
          onClick={() => {
            setValue("username", DEMO.username, { shouldValidate: true });
            setValue("password", DEMO.password, { shouldValidate: true });
          }}
          className="button-secondary mt-3 h-9 px-4 text-sm"
        >
          {t("auth.fillDemo")}
        </button>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(async (values) => {
          setFailure(null);
          try {
            const signedIn = await login(values.username, values.password);
            show({ message: t("auth.welcome", { name: signedIn.firstName }) });
            navigate(redirect, { replace: true });
          } catch (error) {
            setFailure(error instanceof ApiError && error.status !== 0 ? "invalid" : "network");
          }
        })}
        className="mt-6 space-y-5"
      >
        {failure && (
          <p ref={alertRef} tabIndex={-1} role="alert" className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-danger">
            {t(failure === "invalid" ? "auth.invalid" : "auth.network")}
          </p>
        )}
        <Field id="username" label={t("auth.username")} error={errorText(t, errors.username?.message)}>
          {(props) => <input {...props} {...register("username")} autoComplete="username" dir="ltr" className="field mt-1 w-full" />}
        </Field>
        <Field id="password" label={t("auth.password")} error={errorText(t, errors.password?.message)}>
          {(props) => (
            <input {...props} {...register("password")} type="password" autoComplete="current-password" dir="ltr" className="field mt-1 w-full" />
          )}
        </Field>
        <button type="submit" disabled={isSubmitting} className="button-primary h-12 w-full">
          {isSubmitting && <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
          {isSubmitting ? t("auth.signingIn") : t("auth.submit")}
        </button>
      </form>
    </div>
  );
}
