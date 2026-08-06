import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthPage.module.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = "Passwort muss mindestens 8 Zeichen lang sein";
    }

    if (password !== passwordRepeat) {
      errors.passwordRepeat = "Passwörter stimmen nicht überein";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      await register(email, password);
      navigate("/wardrobe");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registrierung fehlgeschlagen"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.appName}>Hollywood Closet</h1>
        <p className={styles.subtitle}>Erstelle dein Konto</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-email">
              E-Mail
            </label>
            <input
              id="register-email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-password">
              Passwort
            </label>
            <input
              id="register-password"
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <span style={{ color: "var(--color-error)", fontSize: 13 }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-password-repeat">
              Passwort wiederholen
            </label>
            <input
              id="register-password-repeat"
              className={`${styles.input} ${fieldErrors.passwordRepeat ? styles.inputError : ""}`}
              type="password"
              value={passwordRepeat}
              onChange={(e) => {
                setPasswordRepeat(e.target.value);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.passwordRepeat;
                  return next;
                });
              }}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            {fieldErrors.passwordRepeat && (
              <span style={{ color: "var(--color-error)", fontSize: 13 }}>
                {fieldErrors.passwordRepeat}
              </span>
            )}
          </div>

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? "Registrierung läuft …" : "Registrieren"}
          </button>
        </form>

        <p className={styles.switchLink}>
          Bereits registriert? <Link to="/login">Jetzt anmelden</Link>
        </p>
      </div>
    </div>
  );
}
