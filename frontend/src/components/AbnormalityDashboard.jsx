import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function AbnormalityDashboard({ depot = "" }) {

  const role = localStorage.getItem("role");

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(null);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [actionTaken, setActionTaken] = useState({});

  const loadReports = async () => {

    try {

      setLoading(true);

      const url = depot
        ? `/abnormalities?depot=${depot}`
        : "/abnormalities";

      const res = await api.get(url);

      setReports(res.data);

    }

    catch (err) {

      Swal.fire(

        "Error",

        err.response?.data?.msg ||

        "Unable to load abnormalities",

        "error"

      );

    }

    finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadReports();

  }, [depot]);

  const filtered = useMemo(() => {

    return reports.filter(report => {

      const searchMatch =

        report.driverName
          .toLowerCase()
          .includes(search.toLowerCase())

        ||

        report.pfNo
          .toLowerCase()
          .includes(search.toLowerCase());

      const statusMatch =

        status === "" ||

        report.status === status;

      return searchMatch && statusMatch;

    });

  }, [reports, search, status]);

  const totalReports = reports.length;

  const pendingReports =

    reports.filter(

      r => r.status === "Pending"

    ).length;

  const completedReports =

    reports.filter(

      r => r.status === "Action Taken"

    ).length;

  const totalDrivers =

    new Set(

      reports.map(r => r.driverId)

    ).size;

      return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center gap-3">

        <AlertTriangle
          className="text-red-600"
          size={28}
        />

        <div>

          <h2 className="text-2xl font-bold">

            Track Abnormalities

          </h2>

          <p className="text-gray-500">

            Last 30 Days

          </p>

        </div>

      </div>

      {/* Summary */}

      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <SummaryCard
          icon={<AlertTriangle />}
          title="Total"
          value={totalReports}
        />

        <SummaryCard
          icon={<Clock />}
          title="Pending"
          value={pendingReports}
        />

        <SummaryCard
          icon={<CheckCircle />}
          title="Action Taken"
          value={completedReports}
        />

        <SummaryCard
          icon={<User />}
          title="Drivers"
          value={totalDrivers}
        />

      </div> */}

      {/* Filters */}

      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input

            placeholder="Search Driver"

            value={search}

            onChange={(e)=>
              setSearch(e.target.value)
            }

            className="border rounded-lg pl-10 pr-4 py-2"

          />

        </div>

        <select

          value={status}

          onChange={(e)=>
            setStatus(e.target.value)
          }

          className="border rounded-lg px-3 py-2"

        >

          <option value="">

            All Status

          </option>

          <option value="Pending">

            Pending

          </option>

          <option value="Action Taken">

            Action Taken

          </option>

        </select>

      </div>
            {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="min-w-full text-sm">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-4 py-3 text-left">
                Driver
              </th>

              <th className="px-4 py-3 text-left">
                Depot
              </th>

              <th className="px-4 py-3 text-left">
                Tower Car
              </th>

              <th className="px-4 py-3 text-left">
                Date
              </th>

              <th className="px-4 py-3 text-left">
                Status
              </th>

              <th className="px-4 py-3 text-center">
                View
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={6}
                  className="py-8 text-center"
                >

                  Loading...

                </td>

              </tr>

            )}

            {!loading && filtered.length === 0 && (

              <tr>

                <td
                  colSpan={6}
                  className="py-8 text-center text-gray-500"
                >

                  No Reports Found

                </td>

              </tr>

            )}

            {!loading && filtered.map(report => (

              <>
                <tr
                  key={report._id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-4 py-3">

                    {report.driverName}

                  </td>

                  <td className="px-4 py-3">

                    {report.depotName}

                  </td>

                  <td className="px-4 py-3">

                    {report.towerCarNo}

                  </td>

                  <td className="px-4 py-3">

                    {new Date(report.createdAt).toLocaleDateString()}

                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        report.status === "Pending"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >

                      {report.status}

                    </span>

                  </td>

                  <td className="px-4 py-3 text-center">

                    <button

                      onClick={() =>
                        setExpanded(
                          expanded === report._id
                            ? null
                            : report._id
                        )
                      }

                      className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"

                    >

                      {expanded === report._id

                        ? <ChevronUp size={16} />

                        : <ChevronDown size={16} />}

                      View

                    </button>

                  </td>

                </tr>

                {expanded === report._id && (

                  <tr>

                    <td
                      colSpan={6}
                      className="bg-slate-50 px-6 py-5"
                    >
                                              <div className="space-y-4">

                        <h3 className="text-lg font-bold text-red-600">
                          Report Details
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">

                          {report.abnormalities.map((item, index) => (

                            <div
                              key={index}
                              className="bg-white border rounded-xl p-4"
                            >

                              <h4 className="font-semibold text-indigo-700">
                                {item.type}
                              </h4>

                              <p className="mt-2 text-gray-700 whitespace-pre-wrap">

                                {item.remarks?.trim()
                                  ? item.remarks
                                  : "-"}

                              </p>

                            </div>

                          ))}

                        </div>

                        <div className="border-t pt-4">

                          <h4 className="font-semibold mb-2">

                            Action Taken

                          </h4>

                          {role === "DEPOT_MANAGER" ? (

                            report.status === "Pending" ? (

                              <>

                                <textarea

                                  rows={4}

                                  placeholder="Enter action taken..."

                                  value={
                                    actionTaken[report._id] || ""
                                  }

                                  onChange={(e)=>

                                    setActionTaken({

                                      ...actionTaken,

                                      [report._id]: e.target.value

                                    })

                                  }

                                  className="w-full border rounded-lg px-4 py-2"

                                />

                                <button

                                  className="mt-3 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"

                                  onClick={async () => {

                                    if (
                                      !(actionTaken[report._id] || "").trim()
                                    ) {

                                      return Swal.fire(
                                        "Required",
                                        "Enter Action Taken",
                                        "warning"
                                      );

                                    }

                                    try {

                                      await api.put(

                                        `/abnormalities/${report._id}/resolve`,

                                        {

                                          actionTaken:
                                            actionTaken[report._id]

                                        }

                                      );

                                      Swal.fire(

                                        "Success",

                                        "Marked as Action Taken",

                                        "success"

                                      );

                                      loadReports();

                                    }

                                    catch (err) {

                                      Swal.fire(

                                        "Error",

                                        err.response?.data?.msg ||

                                        "Unable to update",

                                        "error"

                                      );

                                    }

                                  }}

                                >

                                  Mark as Action Taken

                                </button>

                              </>

                            ) : (

                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">

                                {report.actionTaken || "-"}

                              </div>

                            )

                          ) : (

                            <div className="bg-slate-100 rounded-lg p-4">

                              {report.actionTaken || "Pending"}

                            </div>

                          )}

                        </div>

                      </div>

                    </td>

                  </tr>

                )}

              </>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

function SummaryCard({ icon, title, value }) {

  return (

    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">

      <div className="p-3 rounded-full bg-red-50 text-red-600">

        {icon}

      </div>

      <div>

        <p className="text-xs text-gray-500">

          {title}

        </p>

        <p className="text-2xl font-bold">

          {value}

        </p>

      </div>

    </div>

  );

}