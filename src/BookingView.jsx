import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function BookingView() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);

    useEffect(() => {

        const load = async () => {

            const snap = await getDoc(
                doc(db,"appointments",id)
            );

            if(snap.exists()){
                setAppointment(snap.data());
            }
        };

        load();

    },[]);

    if(!appointment){
        return <div>Loading...</div>;
    }

    return (
        <div
            style={{
                maxWidth:700,
                margin:"20px auto",
                padding:20
            }}
        >

         {/* ✅ GO BACK BUTTON */}
              <button
                onClick={() => navigate(-1)}
                style={{
                  marginBottom: 20,
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#f5f5f5",
                }}
              >
                ← Go Back
              </button>

            <h2>Booking Details</h2>
{appointment.deleted && (
  <div
    style={{
      background: "#ffebee",
      color: "#c62828",
      border: "1px solid #ef9a9a",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "20px",
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    ⚠️ This booking has been cancelled.
  </div>
)}
            <p>
                <b>Purpose</b><br/>
                {appointment.purpose}
            </p>

            <p>
                <b>Date</b><br/>
                {appointment.apt_date}
            </p>

            <p>
                <b>Time</b><br/>
                {appointment.apt_time}
            </p>

            <p>
                <b>Duration</b><br/>
                {appointment.duration} minutes
            </p>

            <div style={{ marginBottom: "15px" }}>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: appointment.deleted ? "#c62828" : "#2e7d32",
                  fontWeight: "bold",
                }}
              >
                {appointment.deleted ? "Cancelled" : "Active"}
              </span>
            </div>

        </div>
    );

}