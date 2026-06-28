import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "@/utils/apiClient";
import { useAppStore } from "@/store/appStore";
import { EnvelopeSimple, Lock, Eye, EyeSlash } from "@phosphor-icons/react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAppStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const { data } = await authApi.post(endpoint, form);
      setToken(data.token);
      setUser(data.user);
      navigate("/");
      toast.success(`Добро пожаловать, ${data.user.name}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(124,106,247,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(34,211,238,0.08) 0%, transparent 50%), #07070d",
      }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #7c6af7, transparent)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{
            background: "radial-gradient(circle, #22d3ee, transparent)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: "linear-gradient(135deg,#7c6af7,#a99ff8)",
              boxShadow: "0 8px 32px rgba(124,106,247,0.5)",
            }}
          >
            ⚖️
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">lifeWorkBalances</h1>
            <p className="text-sm mt-0.5" style={{ color: "#5a5a80" }}>
              Персональный ИИ-ассистент
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div
          className="flex rounded-xl p-1 mb-6 gap-1"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                mode === m
                  ? {
                      background:
                        "linear-gradient(135deg,rgba(124,106,247,0.3),rgba(124,106,247,0.15))",
                      color: "#a99ff8",
                      border: "1px solid rgba(124,106,247,0.4)",
                    }
                  : { color: "#5a5a80" }
              }
            >
              {m === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#9090b8" }}
              >
                Имя
              </label>
              <input
                className="input-glass"
                placeholder="Ваше имя"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#9090b8" }}
            >
              Email
            </label>
            <div className="relative">
              <EnvelopeSimple
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "#5a5a80" }}
              />
              <input
                className="input-glass pl-10"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#9090b8" }}
            >
              Пароль
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "#5a5a80" }}
              />
              <input
                className="input-glass pl-10 pr-10"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "#5a5a80" }}
              >
                {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-neon mt-2 py-3 w-full text-base"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Загрузка...
              </span>
            ) : mode === "login" ? (
              "Войти"
            ) : (
              "Создать аккаунт"
            )}
          </button>
        </form>

        {/* Demo hint */}
        <p className="text-center text-xs mt-5" style={{ color: "#3a3a5c" }}>
          Демо: demo@lwb.app / demo1234
        </p>
      </motion.div>
    </div>
  );
}
