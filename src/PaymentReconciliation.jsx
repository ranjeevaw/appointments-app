import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "./firebase";

export default function PaymentReconciliation() {
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          paymentsSnapshot,
          appointmentsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "payments")),
          getDocs(collection(db, "appointments")),
        ]);

        const paymentData =
          paymentsSnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

        const appointmentData =
          appointmentsSnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

        setPayments(paymentData);
        setAppointments(appointmentData);
      } catch (err) {
        console.error(
          "Error loading payment reconciliation data:",
          err
        );

        setError(
          "Unable to load payment reconciliation data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getMatchingAppointment = (payment) => {
    if (!payment.paymentSessionId) {
      return null;
    }

    return (
      appointments.find(
        (appointment) =>
          appointment.paymentSessionId ===
          payment.paymentSessionId
      ) || null
    );
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    try {
      const date =
        value?.toDate
          ? value.toDate()
          : new Date(value);

      return date.toLocaleString("en-AU");
    } catch {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1>Payment Reconciliation</h1>
        <p>Loading payment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>Payment Reconciliation</h1>
        <p>{error}</p>
      </div>
    );
  }

  const sortedPayments = [...payments].sort(
    (a, b) => {
      const aDate =
        a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);

      const bDate =
        b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);

      return bDate - aDate;
    }
  );

  return (
    <div className="page">
      <h1>Payment Reconciliation</h1>

      <p>
        Payments received through Stripe and whether
        an appointment was created successfully.
      </p>

      {sortedPayments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Payment Status</th>
                <th style={thStyle}>Appointment</th>
                <th style={thStyle}>Payment Session</th>
              </tr>
            </thead>

            <tbody>
              {sortedPayments.map((payment) => {
                const appointment =
                  getMatchingAppointment(payment);

                const appointmentExists =
                  !!appointment;

                return (
                  <tr key={payment.id}>
                    <td style={tdStyle}>
                      {formatDate(
                        payment.createdAt ||
                          payment.paymentCreated
                      )}
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {payment.customerName ||
                          "-"}
                      </strong>

                      <br />

                      <span>
                        {payment.customerEmail ||
                          "-"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      $
                      {Number(
                        payment.paymentAmount || 0
                      ).toFixed(2)}
                    </td>

                    <td style={tdStyle}>
                      {payment.stripePaymentStatus ||
                        payment.checkoutStatus ||
                        "-"}
                    </td>

                    <td style={tdStyle}>
                      {appointmentExists ? (
                        <span>
                          ✅ Created
                          <br />
                          <small>
                            {appointment.id}
                          </small>
                        </span>
                      ) : (
                        <span>
                          ⚠️ Not Created
                        </span>
                      )}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: "300px",
                        wordBreak: "break-all",
                      }}
                    >
                      {payment.paymentSessionId ||
                        payment.id ||
                        "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
  background: "#f5f5f5",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  verticalAlign: "top",
};
