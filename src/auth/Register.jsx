import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState("OTP"); // OTP | VERIFY
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- Send OTP ---------- */
  const sendOtp = async () => {
    if (!email || !name) {
      setError("Name and email are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/send-otp", { email });
      setStep("VERIFY");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Verify & Register ---------- */
  const verify = async () => {
    if (!otp || !password) {
      setError("OTP and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/verify-otp-register", {
        email,
        name,
        otp,
        password,
      });

      alert("Registered successfully 🎉");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm">

        <h2 className="text-2xl font-semibold text-center text-white mb-4">
          Register
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center mb-3">
            {error}
          </p>
        )}

        {step === "OTP" && (
          <div className="space-y-3">
            <input
              className="w-full bg-gray-800 text-white rounded px-3 py-2
                         placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              className="w-full bg-gray-800 text-white rounded px-3 py-2
                         placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === "VERIFY" && (
          <div className="space-y-3">
            <input
              className="w-full bg-gray-800 text-white rounded px-3 py-2
                         placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
              placeholder="OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />

            <input
              type="password"
              className="w-full bg-gray-800 text-white rounded px-3 py-2
                         placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              onClick={verify}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Register"}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
