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
  Hash,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function DriverDetails() {
  const { driverId } = useParams();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);

  // T-Card state with date-based filtering (same as Admin)
  const [tcardSelectedDate, setTcardSelectedDate] = useState("");
  const [tcardAvailableDates, setTcardAvailableDates] = useState([]);
  const [tcardData, setTcardData] = useState([]);
  const [tcardLoading, setTcardLoading] = useState(false);
  const [tcardTotalCount, setTcardTotalCount] = useState(0);

  /* ================= LOAD T-CARD DATES ================= */
  const loadTCardDates = async () => {
    try {
      setTcardLoading(true);
      const res = await api.get(`/depot/driver/${driverId}/tcards`);
      const tcards = res.data || [];

      // Extract unique dates from T-Cards
      const dates = [...new Set(tcards.map(t => t.date?.substring(0, 10)))].filter(Boolean).sort().reverse();
      setTcardAvailableDates(dates);
      setTcardTotalCount(tcards.length);

      // Auto-select latest date if available
      if (dates.length > 0) {
        setTcardSelectedDate(dates[0]);
        // Filter T-Cards for the latest date
        const filtered = tcards.filter(t => t.date?.substring(0, 10) === dates[0]);
        setTcardData(filtered);
      }
    } catch (err) {
      console.error("Failed to load T-Cards:", err);
      setTcardData([]);
    } finally {
      setTcardLoading(false);
    }
  };

  /* ================= LOAD T-CARD BY DATE ================= */
  const loadTCardByDate = async (date) => {
    try {
      setTcardLoading(true);
      const res = await api.get(`/depot/driver/${driverId}/tcards`);
      const tcards = res.data || [];
      const filtered = tcards.filter(t => t.date?.substring(0, 10) === date);
      setTcardData(filtered);
    } catch (err) {
      console.error("Failed to load T-Card for date:", err);
    } finally {
      setTcardLoading(false);
    }
  };

  /* ================= DATE NAVIGATION ================= */
  const goToPreviousDate = () => {
    const currentIndex = tcardAvailableDates.indexOf(tcardSelectedDate);
    if (currentIndex < tcardAvailableDates.length - 1) {
      setTcardSelectedDate(tcardAvailableDates[currentIndex + 1]);
    }
  };

  const goToNextDate = () => {
    const currentIndex = tcardAvailableDates.indexOf(tcardSelectedDate);
    if (currentIndex > 0) {
      setTcardSelectedDate(tcardAvailableDates[currentIndex - 1]);
    }
  };

  useEffect(() => {
    loadTCardDates();
  }, [driverId]);

  useEffect(() => {
    if (tcardSelectedDate) {
      loadTCardByDate(tcardSelectedDate);
    }
  }, [tcardSelectedDate]);

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

        {/* ================= T-CARD WITH DATE NAVIGATION ================= */}
        <Section title="Tower Car Daily Checklist" icon={<ClipboardList />}>
          {/* Header with Date Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {tcardTotalCount > 0 && (
                <span className="text-sm text-gray-500">
                  ({tcardTotalCount} total records)
                </span>
              )}
            </div>

            {/* Date Navigation Controls */}
            {tcardAvailableDates.length > 0 && (
              <div className="flex items-center gap-2">
                {/* Previous Date Button */}
                <button
                  onClick={goToPreviousDate}
                  disabled={tcardAvailableDates.indexOf(tcardSelectedDate) >= tcardAvailableDates.length - 1 || tcardLoading}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Previous Date"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>

                {/* Date Picker */}
                <div className="relative">
                  <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input
                    type="date"
                    value={tcardSelectedDate}
                    onChange={(e) => setTcardSelectedDate(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none min-w-[160px]"
                  />
                </div>

                {/* Next Date Button */}
                <button
                  onClick={goToNextDate}
                  disabled={tcardAvailableDates.indexOf(tcardSelectedDate) <= 0 || tcardLoading}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Next Date"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {tcardLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-500">Loading checklist...</span>
            </div>
          )}

          {/* T-Card Content */}
          {!tcardLoading && tcardData.length > 0 && (
            <div className="space-y-4">
              {tcardData.map(card => (
                <div key={card._id} className="border rounded-xl p-4 bg-slate-50">
                  <div className="flex justify-between mb-3 text-sm font-semibold">
                    <span>Date: {card.date?.substring(0, 10)}</span>
                    <span>T-Car No: {card.tCarNo}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {card.items?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-white rounded-lg">
                        <span className={item.checked ? "text-emerald-500" : "text-red-500"}>
                          {item.checked ? "✓" : "✗"}
                        </span>
                        <div>
                          <p className={item.checked ? "text-gray-700" : "text-red-700 font-medium"}>
                            {item.description}
                          </p>
                          {item.remarks && (
                            <p className="text-xs text-gray-400">
                              Remarks: {item.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Data for Selected Date */}
          {!tcardLoading && tcardSelectedDate && tcardData.length === 0 && tcardAvailableDates.length > 0 && (
            <div className="text-center py-8 bg-slate-50 rounded-xl">
              <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No checklist found for selected date</p>
              <p className="text-sm text-gray-400 mt-1">
                Try selecting a different date
              </p>
            </div>
          )}

          {/* No T-Cards at All */}
          {!tcardLoading && tcardAvailableDates.length === 0 && (
            <p className="text-sm text-gray-500">No Tower Car checklist submitted</p>
          )}
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
