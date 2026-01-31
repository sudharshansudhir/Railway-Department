import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import {
  LogIn,
  LogOut,
  Clock,
  Route,
  Gauge,
  MapPin,
  Hash,
  CheckCircle
} from "lucide-react";
import Footer from "../components/Footer";

export default function DailyActivity() {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [twNumber, setTwNumber] = useState("");
  const [km, setKm] = useState("");
  const [breathAnalyserinitial, setBreathAnalyserinitial] = useState(false);
  const [breathAnalyserDone, setBreathAnalyserDone] = useState(false);

  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signInTime, setSignInTime] = useState(null);
const [hours, setHours] = useState(0);


  /* ================= DERIVED ================= */
const mileage = Number(hours || 0) * 20 + Number(km || 0);


  /* ================= LOCATION ================= */
  const getLocationName = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject();

      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();

        resolve(
          data.address?.railway ||
          data.address?.station ||
          data.display_name
        );
      });
    });
  };

  /* ================= CHECK ACTIVE DUTY ================= */
useEffect(() => {
  api.get("/driver/active-duty").then(async res => {
    if (res.data.active) {
      setSignedIn(true);
      setFromStation(res.data.fromStation);
      setTwNumber(res.data.twNumber);
      setBreathAnalyserDone(res.data.breathAnalyserDone);
      setSignInTime(res.data.signInTime); // 👈 IMPORTANT
    } else {
      const loc = await getLocationName();
      setFromStation(loc);
    }
  });
}, []);

useEffect(() => {
  if (!signInTime || !signedIn) return;

  const interval = setInterval(() => {
    const now = new Date();
    const start = new Date(signInTime);

    const diffMs = now - start;
    const hrs = diffMs / (1000 * 60 * 60);

    setHours(Number(hrs.toFixed(2)));
  }, 60000); // update every 1 min

  return () => clearInterval(interval);
}, [signInTime, signedIn]);

  /* ================= SIGN IN ================= */
  const signIn = async () => {
    if (!twNumber) {
      Swal.fire("Missing Data", "Tower Car Number required", "warning");
      return;
    }

    try {
      setLoading(true);
      await api.post("/driver/signin", {
        fromStation,
        twNumber,
        breathAnalyserinitial
      });

      setSignedIn(true);

      Swal.fire({
        icon: "success",
        title: "Signed ON",
        text: "Duty started successfully",
        timer: 1400,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire("Error", e.response?.data?.msg || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SIGN OUT ================= */
  const signOut = async () => {
    if (!km || !breathAnalyserDone) {
      Swal.fire("Missing Data", "KM required", "warning");
      return;
    }

    try {
      setLoading(true);

      const loc = await getLocationName();
      setToStation(loc);

      await api.post("/driver/signout", {
        toStation: loc,
        km,
        breathAnalyserDone
      });

      Swal.fire({
        icon: "success",
        title: "Duty Completed",
        text: "Mileage recorded successfully",
        timer: 1600,
        showConfirmButton: false
      });

      // RESET
      setSignedIn(false);
      setTwNumber("");
      setKm("");
      setBreathAnalyserDone(false);

      const freshLoc = await getLocationName();
      setFromStation(freshLoc);

    } catch (e) {
      console.log(e)
      Swal.fire("Error", e.response?.data?.msg || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* HEADER */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Mileage & Duty Log
            </h2>
            <p className="text-sm text-gray-500">
              Tower Wagon Driver Daily Activity
            </p>
          </div>

          {/* SIGN ON CARD */}
          <SectionCard
            title="Sign ON"
            icon={<LogIn />}
            status={signedIn ? "Completed" : "Pending"}
            statusColor={signedIn ? "green" : "yellow"}
          >
            <ReadOnlyInput
              label="From Station"
              icon={<MapPin />}
              value={fromStation}
            />

            <Input
              label="Tower Car Number"
              icon={<Hash />}
              value={twNumber}
              onChange={setTwNumber}
              disabled={signedIn}
            />
<label className="flex items-center gap-3 mt-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={breathAnalyserinitial}
                // disabled={signedIn}
                onChange={e => setBreathAnalyserinitial(!breathAnalyserinitial)}
              />
              Breath Analyser Test Done
            </label>
         
            <ActionButton
              label={signedIn ? "Signed ON" : "Sign ON"}
              icon={<CheckCircle />}
              onClick={signIn}
              loading={loading}
              disabled={signedIn}
              color="green"
            />
          </SectionCard>

          {/* SIGN OFF CARD */}
          <SectionCard
            title="Sign OFF"
            icon={<LogOut />}
            status={signedIn ? "Pending" : "Disabled"}
            statusColor={signedIn ? "red" : "gray"}
          >
            <ReadOnlyInput
              label="To Station (Auto detected)"
              icon={<MapPin />}
              value={toStation}
            />

          
            <Input
              label="Kilometers"
              icon={<Route />}
              value={km}
              onChange={setKm}
              disabled={!signedIn}
            />
               <label className="flex items-center gap-3 mt-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={breathAnalyserDone}
                // disabled={signedIn}
                onChange={e => setBreathAnalyserDone(!breathAnalyserDone)}
              />
              Breath Analyser Test Done
            </label>


            {/* MILEAGE */}
            <div className="mt-4 flex items-center gap-4 bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
              <Gauge className="text-indigo-700" />
              <div>
                <p className="text-xs text-gray-500">
                  Calculated Mileage (Hrs × 20 + KM)
                </p>
                <p className="text-2xl font-bold text-indigo-700">
                  {mileage}
                </p>
              </div>
            </div>

            <ActionButton
              label="Sign OFF"
              icon={<LogOut />}
              onClick={signOut}
              loading={loading}
              disabled={!signedIn}
              color="red"
            />
          </SectionCard>

        </div>
      </div>
      <Footer/>
    </>
  );
}

/* ================= UI COMPONENTS ================= */

function SectionCard({ title, icon, status, statusColor, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 font-semibold text-lg">
          {icon}
          {title}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold
            bg-${statusColor}-100 text-${statusColor}-700`}
        >
          {status}
        </span>
      </div>
      {children}
    </div>
  );
}

function Input({ label, icon, value, onChange, disabled }) {
  return (
    <div className="mb-3">
      <label className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">
          {icon}
        </span>
        <input
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg disabled:bg-gray-100"
        />
      </div>
    </div>
  );
}

function ReadOnlyInput({ label, icon, value }) {
  return (
    <div className="mb-3">
      <label className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">
          {icon}
        </span>
        <input
          value={value}
          readOnly
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100"
        />
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick, loading, disabled, color }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full mt-5 py-2.5 rounded-xl font-semibold text-white flex
        items-center justify-center gap-2 transition
        ${color === "red" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        ${(disabled || loading) && "opacity-60 cursor-not-allowed"}`}
    >
      {loading ? "Processing..." : label}
      {icon}
    </button>
  );
}
