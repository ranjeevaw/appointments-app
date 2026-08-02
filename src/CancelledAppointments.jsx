import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";


function InfoItem({ icon, label, value }) {

    return (
        <div
            style={{
                background: "#f8f9fa",
                borderRadius: "12px",
                padding: "15px",
                marginBottom: "12px",
                border: "1px solid #e9ecef"
            }}
        >

            <div
                style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    fontWeight: "600",
                    marginBottom: "5px"
                }}
            >
                {icon} {label}
            </div>


            <div
                style={{
                    fontSize: "16px",
                    color: "#212529",
                    wordBreak: "break-word"
                }}
            >
                {value || "-"}
            </div>


        </div>
    );
}



export default function CancelledAppointment() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {

        loadAppointment();

    }, []);



    const loadAppointment = async () => {

        const ref = doc(db, "appointments", id);
        const snap = await getDoc(ref);


        if (snap.exists()) {

            setAppointment({
                id: snap.id,
                ...snap.data()
            });

        }


        setLoading(false);

    };



    const restoreAppointment = async () => {

        if (!window.confirm("Restore this appointment?")) {
            return;
        }


        await updateDoc(
            doc(db, "appointments", id),
            {
                deleted: false
            }
        );


        alert("Appointment restored.");


        navigate("/alms-calendar");

    };



    if (loading) {

        return (
            <div
                style={{
                    width: "100%",
                    textAlign: "center",
                    paddingTop: "50px"
                }}
            >
                Loading appointment...
            </div>
        );

    }



    if (!appointment) {

        return (
            <div
                style={{
                    width: "100%",
                    textAlign: "center",
                    paddingTop: "50px"
                }}
            >
                Appointment not found.
            </div>
        );

    }



    return (

        <div
            style={{
                width: "100%",
                minHeight: "80vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "30px 15px",
                boxSizing: "border-box"
            }}
        >


            <div
                style={{
                    width: "100%",
                    maxWidth: "650px",
                    background: "#ffffff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    textAlign: "left"
                }}
            >


                {/* Header */}

                <div
                    style={{
                        background: "linear-gradient(135deg,#b71c1c,#e53935)",
                        color: "white",
                        textAlign: "center",
                        padding: "25px"
                    }}
                >

                    <h2
                        style={{
                            margin: 0,
                            fontSize: "28px"
                        }}
                    >
                        ❌ Cancelled Appointment
                    </h2>


                    <div
                        style={{
                            marginTop: "8px",
                            opacity: 0.9
                        }}
                    >
                        Appointment Details
                    </div>


                </div>



                {/* Body */}

                <div
                    style={{
                        padding: "25px"
                    }}
                >


                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: "20px"
                        }}
                    >

                        <span
                            style={{
                                background: "#dc3545",
                                color: "white",
                                padding: "8px 25px",
                                borderRadius: "30px",
                                fontWeight: "bold",
                                fontSize: "14px"
                            }}
                        >
                            CANCELLED
                        </span>

                    </div>



                    <InfoItem
                        icon="👤"
                        label="Name"
                        value={appointment.name}
                    />


                    <InfoItem
                        icon="📅"
                        label="Date"
                        value={appointment.apt_date}
                    />


                    <InfoItem
                        icon="⏰"
                        label="Time"
                        value={appointment.apt_time}
                    />


                    <InfoItem
                        icon="🙏"
                        label="Purpose"
                        value={appointment.purpose}
                    />


                    <InfoItem
                        icon="🏠"
                        label="Address"
                        value={appointment.address}
                    />


                    <InfoItem
                        icon="📞"
                        label="Contact"
                        value={appointment.contact_number}
                    />


                    <InfoItem
                        icon="📝"
                        label="Details"
                        value={appointment.details}
                    />


                </div>



                {/* Footer */}

                <div
                    style={{
                        textAlign: "center",
                        padding: "0 25px 30px"
                    }}
                >


                    <button
                        onClick={restoreAppointment}
                        style={{
                            background: "#198754",
                            color: "white",
                            border: "none",
                            borderRadius: "30px",
                            padding: "12px 30px",
                            fontSize: "16px",
                            marginRight: "15px",
                            cursor: "pointer"
                        }}
                    >
                        ♻ Restore
                    </button>



                    <button
                        onClick={() => navigate("/alms-calendar")}
                        style={{
                            background: "white",
                            color: "#0d6efd",
                            border: "2px solid #0d6efd",
                            borderRadius: "30px",
                            padding: "12px 30px",
                            fontSize: "16px",
                            cursor: "pointer"
                        }}
                    >
                        ← Calendar
                    </button>


                </div>


            </div>


        </div>

    );

}