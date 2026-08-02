import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    async function loadAppointments() {
      const snapshot = await getDocs(
        collection(db, "appointments")
      );

      snapshot.forEach((doc) => {
        console.log(doc.id, doc.data());
      });
    }

    loadAppointments();
  }, []);

  return <h1>Calendar App</h1>;
}

export default App;
