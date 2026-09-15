import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { db } from "./firebase";

import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";


export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

const [user, authLoading] = useAuthState(auth);

const isNew = !id;
const isAdmin = !!user;

useEffect(() => {
    if (authLoading) return;

    if (!isNew && !isAdmin) {
        navigate("/alms-calendar");
    }
}, [authLoading, isAdmin, isNew, navigate]);

  const [searchParams] = useSearchParams();
const paymentId = searchParams.get("paymentId");
const paymentSessionId = searchParams.get("paymentSessionId");
const paymentAmount = searchParams.get("amount");

const [error, setError] = useState("");
  //const isNew = !id;

const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

const [appointment, setAppointment] = useState({
  name: "",
  purpose: "",
  address: "",
  email: "",
  apt_date: searchParams.get("date") || "",
  apt_time: searchParams.get("time") || "",
  duration: 30,
  details: "",
  contact_number: "",
});

const purposeOptions = [
  "Morning Alms - හීල් දානය",
  "Lunch Alms - දවල් දානය",
  "Evening Alms - ගිලන්පස",
  "Appointments",
  "Invitations for පිරිත් and බණ",
];

const purposeTimeMap = {
  "Morning Alms - හීල් දානය": "06:30",
  "Lunch Alms - දවල් දානය": "12:00",
  "Evening Alms - ගිලන්පස": "18:00",
   // No fixed time for these
   "Appointments": "",
   "Invitations for පිරිත් and බණ": "",
};

useEffect(() => {
  if (!isNew) {
    loadAppointment();
    return;
  }

  const hasPayment =
    paymentId &&
    paymentSessionId &&
    paymentAmount;

  if (hasPayment) {
    const savedAppointment =
      sessionStorage.getItem("pendingAppointment");

    if (!savedAppointment) {
      setError(
        "Your appointment details could not be restored."
      );
      setLoading(false);
      return;
    }

    try {
      const parsedAppointment =
        JSON.parse(savedAppointment);

      setAppointment(parsedAppointment);
    } catch (err) {
      console.error(
        "Failed to restore pending appointment:",
        err
      );

      setError(
        "Unable to restore your appointment details."
      );
      setLoading(false);
    }

    setLoading(false);
  } else {
    setLoading(false);
  }
}, [
  id,
  isNew,
  paymentId,
  paymentSessionId,
  paymentAmount,
]);

useEffect(() => {
  if (
    !isNew ||
    !paymentId ||
    !paymentSessionId ||
    !paymentAmount
  ) {
    return;
  }

  const completedKey =
    `paidAppointmentCompleted_${paymentSessionId}`;

  if (sessionStorage.getItem(completedKey)) {
    return;
  }

  completePaidAppointment();
}, [
  isNew,
  paymentId,
  paymentSessionId,
  paymentAmount,
]);

const loadAppointment = async () => {
  try {
    const ref = doc(db, "appointments", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Appointment not found");
      navigate("/alms-calendar");
      return;
    }

    if (snap.data().deleted === true) {
      alert("This appointment has been deleted.");
      navigate("/alms-calendar");
      return;
    }

    setAppointment((prev) => ({
      ...prev,
      ...snap.data(),
    }));
  } catch (err) {
    console.error(err);
    alert("Failed to load appointment");
  } finally {
    setLoading(false);
  }
};

const handleChange = (field, value) => {
  setError("");

  setAppointment((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const validateAppointment = async () => {
  const q = query(
    collection(db, "appointments"),
    where("apt_date", "==", appointment.apt_date)
  );

  const snapshot = await getDocs(q);

  // Ignore deleted appointments and the current document when editing
  const existingAppointments = snapshot.docs.filter((docSnap) => {
    const data = docSnap.data();

    if (data.deleted === true) {
      return false;
    }

    if (!isNew && docSnap.id === id) {
      return false;
    }

    return true;
  });

  // -------------------------------------------------------
  // Rule 1:
  // Only one Morning/Lunch/Evening Alms per day
  // -------------------------------------------------------

  const isAlms =
    appointment.purpose === "Morning Alms - හීල් දානය" ||
    appointment.purpose === "Lunch Alms - දවල් දානය" ||
    appointment.purpose === "Evening Alms - ගිලන්පස";

  if (isAlms) {
    const samePurposeExists = existingAppointments.some(
      (docSnap) =>
        docSnap.data().purpose === appointment.purpose
    );

    if (samePurposeExists) {
      return {
        valid: false,
        message: `${appointment.purpose} has already been booked for ${appointment.apt_date}.`,
      };
    }
  }

  // -------------------------------------------------------
  // Rule 2:
  // No booking may be within 30 minutes of another booking
  // -------------------------------------------------------

if (appointment.apt_time) {
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

const getBookingWindow = (purpose, time, duration = 30) => {
  switch (purpose) {
    case "Morning Alms - හීල් දානය":
      return {
        start: toMinutes("06:30"),
        end: toMinutes("07:30"),
      };

    case "Lunch Alms - දවල් දානය":
      return {
        start: toMinutes("11:30"),
        end: toMinutes("12:30"),
      };

    case "Evening Alms - ගිලන්පස":
      return {
        start: toMinutes("17:30"),
        end: toMinutes("18:30"),
      };

    default: {
      const start = toMinutes(time);
      return {
        start,
        end: start + duration,
      };
    }
  }
};

const newWindow = getBookingWindow(
  appointment.purpose,
  appointment.apt_time,
  appointment.duration
);

  const clash = existingAppointments.find((docSnap) => {
    const data = docSnap.data();

    if (!data.apt_time) {
      return false;
    }

const existingWindow = getBookingWindow(
  data.purpose,
  data.apt_time,
  data.duration
);

    const BUFFER = 30; // minutes

    return (
      newWindow.start < (existingWindow.end + BUFFER) &&
      newWindow.end > (existingWindow.start - BUFFER)
    );
  });

  if (clash) {
    return {
      valid: false,
      message:
        `This booking clashes with an existing ${clash.data().purpose} ` +
        `scheduled at ${clash.data().apt_time}. Please choose another time.`,
    };
  }
}

  return {
    valid: true,
    message: "",
  };
};

const validateRequiredFields = () => {
  if (!appointment.name.trim()) {
    return "Name is required";
  }

  if (!appointment.purpose.trim()) {
    return "Purpose is required";
  }

  if (!appointment.contact_number.trim()) {
    return "Contact number is required";
  }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(appointment.email)) {
  return "Please enter a valid email address";
}

  if (!appointment.address.trim()) {
    return "Address is required";
  }

  if (!appointment.details.trim()) {
    return "Please provide details of the alms offering and merit transfer intentions";
  }

  return null;
};

const sendAppointmentEmail = async (action) => {
  try {
      setSaving(true);
    await emailjs.send(
      "service_xtf9mt7",
      "template_ultwh8g",
      {
        action,
        name: appointment.name,
        email: appointment.email,
        purpose: appointment.purpose,
        apt_date: appointment.apt_date,
        apt_time: appointment.apt_time,
        address: appointment.address,
        contact_number: appointment.contact_number,
        details: appointment.details,
      },
      "8G68XWPnW2CkhVGMW"
    );
  } catch (err) {
      setSaving(false);
    //alert("Email sending failed. Please call and inform us. Details are there in the Contact us page! Thank you");
    console.error("Email failed:", err);
  }
};

const saveAppointment = async () => {
  const validationError = validateRequiredFields();

  if (validationError) {
    setError(validationError);
    return;
  }

  setError("");

const validation = await validateAppointment();

if (!validation.valid) {
  setError(validation.message);
  return;
}

  setError("");

  try {
    if (isNew) {
      await addDoc(collection(db, "appointments"), {
        ...appointment,
        deleted: false,
        deletedAt: null,
        deletedBy: null,
        created: new Date(),
        updated: new Date(),
      });

alert("Appointment created successfully");

// Send email in background
sendAppointmentEmail("Created");

    } else {
      await updateDoc(doc(db, "appointments", id), {
        ...appointment,
        updated: new Date(),
      });

alert("Appointment updated successfully");

// Send email in background
sendAppointmentEmail("Updated");
    }

    navigate("/alms-calendar");
  } catch (err) {
    console.error(err);
    alert("Failed to save appointment");
  }
};

const completePaidAppointment = async () => {
  if (!paymentId || !paymentSessionId || !paymentAmount) {
    return;
  }

const verifyPaymentResponse = await fetch(
  "https://us-central1-englishdhammaorg.cloudfunctions.net/verifyPaymentForAppointment" +
    `?session_id=${encodeURIComponent(paymentSessionId)}`
);

const verifiedPayment = await verifyPaymentResponse.json();

if (!verifyPaymentResponse.ok) {
  throw new Error(
    verifiedPayment.error ||
      "Unable to verify your payment."
  );
}

if (
  !verifiedPayment.paymentId ||
  !verifiedPayment.paymentSessionId ||
  typeof verifiedPayment.paymentAmount !== "number"
) {
  throw new Error(
    "Invalid payment verification information."
  );
}

  const savedAppointment = sessionStorage.getItem(
    "pendingAppointment"
  );

  if (!savedAppointment) {
    setError(
      "Your appointment details could not be restored."
    );
    return;
  }

  try {
    setSaving(true);
    setError("");

    const parsedAppointment = JSON.parse(savedAppointment);

    // Validate the restored appointment details
    if (!parsedAppointment.name?.trim()) {
      throw new Error("Name is required.");
    }

    if (!parsedAppointment.purpose?.trim()) {
      throw new Error("Purpose is required.");
    }

    if (!parsedAppointment.contact_number?.trim()) {
      throw new Error("Contact number is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(parsedAppointment.email || "")) {
      throw new Error("Please enter a valid email address.");
    }

    if (!parsedAppointment.address?.trim()) {
      throw new Error("Address is required.");
    }

    if (!parsedAppointment.details?.trim()) {
      throw new Error(
        "Please provide details of the alms offering and merit transfer intentions."
      );
    }

    // Make sure the appointment is still available
    const q = query(
      collection(db, "appointments"),
      where("apt_date", "==", parsedAppointment.apt_date)
    );

    const snapshot = await getDocs(q);

    const existingAppointments = snapshot.docs.filter(
      (docSnap) => {
        const data = docSnap.data();
        return data.deleted !== true;
      }
    );

    // One Morning/Lunch/Evening Alms per day
    const isAlms =
      parsedAppointment.purpose ===
        "Morning Alms - හීල් දානය" ||
      parsedAppointment.purpose ===
        "Lunch Alms - දවල් දානය" ||
      parsedAppointment.purpose ===
        "Evening Alms - ගිලන්පස";

    if (isAlms) {
      const samePurposeExists =
        existingAppointments.some(
          (docSnap) =>
            docSnap.data().purpose ===
            parsedAppointment.purpose
        );

      if (samePurposeExists) {
        throw new Error(
          `${parsedAppointment.purpose} has already been booked for ${parsedAppointment.apt_date}.`
        );
      }
    }

    // Check booking time clash
    if (parsedAppointment.apt_time) {
      const toMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };

      const getBookingWindow = (
        purpose,
        time,
        duration = 30
      ) => {
        switch (purpose) {
          case "Morning Alms - හීල් දානය":
            return {
              start: toMinutes("06:30"),
              end: toMinutes("07:30"),
            };

          case "Lunch Alms - දවල් දානය":
            return {
              start: toMinutes("11:30"),
              end: toMinutes("12:30"),
            };

          case "Evening Alms - ගිලන්පස":
            return {
              start: toMinutes("17:30"),
              end: toMinutes("18:30"),
            };

          default: {
            const start = toMinutes(time);

            return {
              start,
              end: start + duration,
            };
          }
        }
      };

      const newWindow = getBookingWindow(
        parsedAppointment.purpose,
        parsedAppointment.apt_time,
        parsedAppointment.duration
      );

      const BUFFER = 30;

      const clash = existingAppointments.find(
        (docSnap) => {
          const data = docSnap.data();

          if (!data.apt_time) {
            return false;
          }

          const existingWindow =
            getBookingWindow(
              data.purpose,
              data.apt_time,
              data.duration
            );

          return (
            newWindow.start <
              existingWindow.end + BUFFER &&
            newWindow.end >
              existingWindow.start - BUFFER
          );
        }
      );

      if (clash) {
        throw new Error(
          `This booking clashes with an existing ${clash.data().purpose} scheduled at ${clash.data().apt_time}. Please choose another time.`
        );
      }
    }

// Prevent the same Stripe payment from creating
// more than one appointment.
const paymentQuery = query(
  collection(db, "appointments"),
  where("paymentSessionId", "==", paymentSessionId)
);

const paymentSnapshot = await getDocs(paymentQuery);

if (!paymentSnapshot.empty) {
  sessionStorage.removeItem("pendingAppointment");

  alert(
    "This payment has already been used for an appointment."
  );

  navigate("/alms-calendar");
  return;
}

    // Create the appointment only after successful payment
    await addDoc(collection(db, "appointments"), {
      ...parsedAppointment,

      deleted: false,
      deletedAt: null,
      deletedBy: null,

      created: new Date(),
      updated: new Date(),

        paymentId: verifiedPayment.paymentId,
        paymentSessionId: verifiedPayment.paymentSessionId,
        paymentAmount: verifiedPayment.paymentAmount,
    });

sessionStorage.setItem(
  `paidAppointmentCompleted_${paymentSessionId}`,
  "true"
);

    // Remove temporary appointment data
    sessionStorage.removeItem("pendingAppointment");

    // Email customer
    await emailjs.send(
      "service_xtf9mt7",
      "template_ultwh8g",
      {
        action: "Created",
        name: parsedAppointment.name,
        email: parsedAppointment.email,
        purpose: parsedAppointment.purpose,
        apt_date: parsedAppointment.apt_date,
        apt_time: parsedAppointment.apt_time,
        address: parsedAppointment.address,
        contact_number:
          parsedAppointment.contact_number,
        details: parsedAppointment.details,
      },
      "8G68XWPnW2CkhVGMW"
    );

    alert(
      "Payment successful and appointment created successfully."
    );

    navigate("/alms-calendar");
  } catch (err) {
    console.error(
      "Failed to create paid appointment:",
      err
    );

    setError(
      err.message ||
        "Payment was successful, but we could not create the appointment. Please contact us."
    );
  } finally {
    setSaving(false);
  }
};

const continueToPayment = async () => {
  const validationError = validateRequiredFields();

  if (validationError) {
    setError(validationError);
    return;
  }

  setError("");

  const validation = await validateAppointment();

  if (!validation.valid) {
    setError(validation.message);
    return;
  }

  setError("");

  // Temporarily save appointment details while customer completes payment
  sessionStorage.setItem(
    "pendingAppointment",
    JSON.stringify(appointment)
  );

  window.location.href =
    "https://ranjeevaw.github.io/payment-app";
};

  const deleteAppointment = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) return;

    try {
await updateDoc(doc(db, "appointments", id), {
  deleted: true,
  deletedAt: new Date(),
  deletedBy: "admin",
});

      alert("Appointment deleted");

      navigate("/alms-calendar");
    } catch (err) {
      console.error(err);
      alert("Failed to delete appointment");
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
        {saving && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(255,255,255,0.90)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 99999,
              backdropFilter: "blur(2px)"
            }}
          >

            <div
              style={{
                width: "70px",
                height: "70px",
                border: "8px solid #e0e0e0",
                borderTop: "8px solid #8b0000",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}
            />

            <h2
              style={{
                marginTop: "30px",
                color: "#8b0000"
              }}
            >
              Creating Appointment
            </h2>

            <p
              style={{
                fontSize: "18px",
                textAlign: "center",
                maxWidth: "420px"
              }}
            >
              Please wait while your booking is being created.
            </p>

            <p
              style={{
                color: "#666"
              }}
            >
              Please don't refresh or close this page.
            </p>

          </div>
        )}
      <h2>
        {isNew
          ? "New Appointment"
          : "Edit Appointment"}
      </h2>

      <div style={{ marginBottom: 15 }}>
        <label>Name</label>
        <br />
        <input
          style={{ width: "100%", padding: 8 }}
          value={appointment.name}
          onChange={(e) =>
            handleChange("name", e.target.value)
          }
        />
      </div>

<div style={{ marginBottom: 15 }}>
  <label>Purpose</label>
  <br />
  <select
    style={{
      width: "100%",
      padding: 8,
      fontSize: "16px",
    }}
    value={appointment.purpose}

onChange={(e) => {
  const selectedPurpose = e.target.value;

  setAppointment((prev) => ({
    ...prev,
    purpose: selectedPurpose,
    apt_time: purposeTimeMap[selectedPurpose] || "",
  }));
}}

  >
    <option value="">-- Select Purpose --</option>

    {purposeOptions.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
</div>

      <div style={{ marginBottom: 15 }}>
        <label>Address</label>
        <br />
        <input
          style={{ width: "100%", padding: 8 }}
          value={appointment.address}
          onChange={(e) =>
            handleChange("address", e.target.value)
          }
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>Contact Number</label>
        <br />
        <input
          style={{ width: "100%", padding: 8 }}
          value={appointment.contact_number}
          onChange={(e) =>
            handleChange(
              "contact_number",
              e.target.value
            )
          }
        />
      </div>

<div style={{ marginBottom: 15 }}>
  <label>Email Address</label>
  <br />
  <input
    type="email"
    style={{ width: "100%", padding: 8 }}
    value={appointment.email}
    onChange={(e) =>
      handleChange("email", e.target.value)
    }
  />
</div>

      <div style={{ marginBottom: 15 }}>
        <label>Date</label>
        <br />
        <input
          type="date"
          style={{ padding: 8 }}
          value={appointment.apt_date}
          onChange={(e) =>
            handleChange("apt_date", e.target.value)
          }
        />
      </div>

<div style={{ marginBottom: 15 }}>
  <label>Time</label>
  <br />
  <input
    type="time"
    style={{ padding: 8 }}
    value={appointment.apt_time}
    onChange={(e) => handleChange("apt_time", e.target.value)}
    readOnly={
      appointment.purpose === "Morning Alms - හීල් දානය" ||
      appointment.purpose === "Lunch Alms - දවල් දානය" ||
      appointment.purpose === "Evening Alms - ගිලන්පස"
    }
    placeholder="Enter a time if applicable"
    step="300"
  />
</div>

{(appointment.purpose === "Appointments" ||
  appointment.purpose === "Invitations for පිරිත් and බණ") && (
  <div style={{ marginBottom: 15 }}>
    <label>Duration</label>
    <br />
    <select
      style={{ padding: 8 }}
      value={appointment.duration}
      onChange={(e) =>
        handleChange("duration", Number(e.target.value))
      }
    >
      <option value={30}>30 minutes</option>
      <option value={60}>1 hour</option>
      <option value={90}>1 hour 30 minutes</option>
      <option value={120}>2 hours</option>
      <option value={150}>2 hours 30 minutes</option>
      <option value={180}>3 hours</option>
      <option value={210}>3 hours 30 minutes</option>
      <option value={240}>4 hours</option>
      <option value={270}>4 hours 30 minutes</option>
      <option value={300}>5 hours</option>
      <option value={330}>5 hours 30 minutes</option>
      <option value={360}>6 hours</option>
      <option value={390}>6 hours 30 minutes</option>
      <option value={420}>7 hours</option>
      <option value={450}>7 hours 30 minutes</option>
      <option value={480}>8 hours</option>
      <option value={510}>8 hours 30 minutes</option>
      <option value={540}>9 hours</option>
    </select>
  </div>
)}

      <div style={{ marginBottom: 15 }}>
        <label>Details</label>
        <br />
<textarea
  rows={6}
  style={{ width: "100%", padding: 8 }}
  placeholder="Please provide details such as the purpose of this alms offering and the person(s) to whom merits may be transferred."
  value={appointment.details}
  onChange={(e) =>
    handleChange("details", e.target.value)
  }
/>
      </div>

{error && (
  <div
    style={{
      backgroundColor: "#ffe5e5",
      color: "#c62828",
      border: "1px solid #ef9a9a",
      borderRadius: "4px",
      padding: "12px",
      marginBottom: "15px",
      fontWeight: "bold",
    }}
  >
    {error}
  </div>
)}


      <div style={{ display: "flex", gap: 10 }}>

        {isNew ? (
          <button onClick={continueToPayment}>
            Continue to Payment
          </button>
        ) : (
          <button
              onClick={saveAppointment}
              disabled={saving}
          >
              {saving ? "Creating..." : "Save"}
          </button>
        )}

        <button onClick={() => navigate("/alms-calendar")}>
          Cancel
        </button>

        {!isNew && isAdmin && (
<button
  onClick={() =>
    navigate(`/admin/delete/${id}`)
  }
>
  Delete
</button>
        )}
      </div>
    </div>
  );
}
