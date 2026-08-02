import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/alms-calendar");

    } catch (err) {
      console.error(err);

      switch (err.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        default:
          setError(err.message);
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "60px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h2>Admin Login</h2>

      <input
        type="email"
        placeholder="Email"
        style={{
          width: "100%",
          marginBottom: 10,
          padding: 8,
        }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        style={{
          width: "100%",
          marginBottom: 10,
          padding: 8,
        }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            login();
          }
        }}
      />

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={login}
        style={{
          width: "100%",
          padding: 10,
        }}
      >
        Login
      </button>
    </div>
  );
}
