import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { db } from "./firebase";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

export default function AdminDelete() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_USER = "admin";
  const ADMIN_PASSWORD = "iruehquh9817987";

  const handleDelete = async () => {
    setError("");

    if (
      username !== ADMIN_USER ||
      password !== ADMIN_PASSWORD
    ) {
      setError("Invalid username or password");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateDoc(doc(db, "appointments", id), {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: username,
        updated: new Date(),
      });

      alert("Appointment cancelled successfully");

      navigate("/alms-calendar");
    } catch (err) {
      console.error(err);
      setError("Failed to cancel appointment");
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h2>Admin Appointment Cancellation</h2>

      <p>
        This action will mark the appointment as
        cancelled but will not remove it from the
        database.
      </p>

      {error && (
        <div
          style={{
            backgroundColor: "#ffe5e5",
            color: "#c62828",
            border: "1px solid #ef9a9a",
            padding: 12,
            marginBottom: 15,
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: 15 }}>
        <label>Username</label>
        <br />
        <input
          style={{
            width: "100%",
            padding: 8,
          }}
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>Password</label>
        <br />
        <input
          type="password"
          style={{
            width: "100%",
            padding: 8,
          }}
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
        }}
      >
        <button onClick={handleDelete}>
          Cancel Appointment
        </button>

        <button
          onClick={() => navigate("/alms-calendar")}
        >
          Back
        </button>
      </div>
    </div>
  );
}
