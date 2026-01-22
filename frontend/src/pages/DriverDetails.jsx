import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import {
  User,
  Building2,
  IdCard,
  ClipboardList,
  Activity,
  FileText,
  Calendar,
  BadgeIndianRupee,
  Hash
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function DriverDetails() {
  const { driverId } = useParams();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [tCards, setTCards] = useState([]);

  /* ================= LOAD T-CARDS ================= */
  useEffect(() => {
    api.get(`/depot/driver/${driverId}/tcards`)
      .then(res => setTCards(res.data))
      .catch(() => setTCards([]));
  }, [driverId]);

  /* ================= LOAD DRIVER PROFILE ================= */
  useEffect(() => {
    api.get(`/depot/driver/${driverId}`).then(res => {
      setData(res.data);
      setLogs(res.data.logs || []);
      console.log(res.data.logs)
    });
  }, [driverId]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading driver details...
      </div>
    );
  }

  const profile = data.profile || {};
  const trainings = profile.trainings || {};
  const lrList = profile.lrDetails || [];

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Driver Complete Details
          </h2>
          <p className="text-sm text-gray-500">
            Full bio data, compliance & duty logs (Read-Only)
          </p>
        </div>

        {/* BASIC INFO */}
        <Section title="Basic Information" icon={<User />}>
          <InfoGrid>
            <InfoCard label="Driver Name" value={data.name} icon={<User />} />
            <InfoCard label="PF Number" value={data.pfNo} icon={<IdCard />} />
            <InfoCard label="Depot" value={data.depotName} icon={<Building2 />} />
          </InfoGrid>
        </Section>

        {/* BIO DATA */}
        <Section title="Complete Bio Data" icon={<ClipboardList />}>
          <InfoGrid>
            <InfoCard label="HRMS ID" value={profile.hrmsId || "-"} icon={<Hash />} />
            <InfoCard label="Designation" value={profile.designation || "-"} />
            <InfoCard label="Basic Pay" value={profile.basicPay || "-"} icon={<BadgeIndianRupee />} />
            <InfoCard
              label="Date of Appointment"
              value={profile.dateOfAppointment?.substring(0, 10) || "-"}
              icon={<Calendar />}
            />
            <InfoCard
              label="Date of Entry as TWD"
              value={profile.dateOfEntryAsTWD?.substring(0, 10) || "-"}
              icon={<Calendar />}
            />
          </InfoGrid>
        </Section>

        {/* ================= TRAINING TABLE ================= */}
        <Section title="Training / Health Details" icon={<Activity />}>
          <TableWrapper>
            <thead>
              <tr>
                <TableHead>Training Type</TableHead>
                <TableHead>Done Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Schedule</TableHead>
              </tr>
            </thead>
            <tbody>
              {["PME", "GRS_RC", "TR4", "OC"].map(type => (
                <tr key={type}>
                  <TableCell>{type}</TableCell>
                  <TableCell>{trainings[type]?.doneDate?.substring(0, 10) || "-"}</TableCell>
                  <TableCell>{trainings[type]?.dueDate?.substring(0, 10) || "-"}</TableCell>
                  <TableCell>{trainings[type]?.schedule || "-"}</TableCell>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        </Section>

        {/* ================= LR TABLE ================= */}
        <Section title="LR (Road Learning) Details" icon={<FileText />}>
          <TableWrapper>
            <thead>
              <tr>
                <TableHead>Section</TableHead>
                <TableHead>Done Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Schedule</TableHead>
              </tr>
            </thead>
            <tbody>
              {lrList.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No LR details available
                  </td>
                </tr>
              )}

              {lrList.map((lr, idx) => (
                <tr key={idx}>
                  <TableCell>{lr.section}</TableCell>
                  <TableCell>{lr.doneDate?.substring(0, 10)}</TableCell>
                  <TableCell>{lr.dueDate?.substring(0, 10)}</TableCell>
                  <TableCell>{lr.schedule}</TableCell>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        </Section>

        {/* ================= DAILY DUTY LOGS ================= */}
        <Section title="Daily Duty Logs" icon={<ClipboardList />}>
          <TableWrapper>
            <thead>
              <tr>
                <TableHead>Date</TableHead>
                <TableHead>Sign ON</TableHead>
                <TableHead>Sign OFF</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Breath Analyse</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Mileage</TableHead>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No duty logs available
                  </td>
                </tr>
              )}

              {logs.map(log => (
                <tr key={log._id}>
                  <TableCell>{log.logDate?.substring(0, 10)}</TableCell>
                  <TableCell>
                    {log.fromStation}
                    <br />
                    <span className="text-xs text-gray-500">
                      {new Date(log.signInTime).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {log.toStation}
                    <br />
                    <span className="text-xs text-gray-500">
                      {new Date(log.signOutTime).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell center>{log.km}</TableCell>
                  <TableCell center>{log.breathAnalyserDone?"YES":"NO"}</TableCell>
                  <TableCell center>{log.hours}</TableCell>
                  <TableCell center>{log.mileage}</TableCell>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        </Section>

        {/* ================= T-CARD ================= */}
        <Section title="T-Card Daily Checklist" icon={<ClipboardList />}>
          {tCards.length === 0 && (
            <p className="text-sm text-gray-500">No T-Card checklist submitted</p>
          )}

          {tCards.map(card => (
            <div key={card._id} className="border rounded-xl p-4 mb-6 bg-slate-50">
              <div className="flex justify-between mb-3 text-sm font-semibold">
                <span>Date: {card.date.substring(0, 10)}</span>
                <span>T-Car No: {card.tCarNo}</span>
              </div>

              {card.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-sm mb-2">
                  <span>{item.checked ? "✅" : "❌"}</span>
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-gray-500">
                      Remarks: {item.remarks || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </Section>

      </div>
    </div>
    <Footer/>
    </>
  );
}

/* ================= UI HELPERS ================= */

function Section({ title, icon, children }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-blue-700">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function TableWrapper({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-3 py-3 border-b text-left font-semibold bg-slate-100">
      {children}
    </th>
  );
}

function TableCell({ children, center }) {
  return (
    <td className={`px-3 py-2 border-b ${center ? "text-center" : ""}`}>
      {children}
    </td>
  );
}
