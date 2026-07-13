import { useEffect, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  AlertTriangle,
  Send
} from "lucide-react";

const towerCars = [
  "RU 927/017",
  "SR 220035",
  "SR 210018",
  "SR 960025",
  "SR 23025",
  "SR 240063",
  "RU 06878",
  "SR 230022",
  "SR 210067",
  "RU 01896",
  "RU 176019",
  "SR 230059",
  "RU 9516",
  "RU 9514",
  "RU 9496",
  "RU 950021",
  "LR",
  "TRAINING"
];

const abnormalityTypes = [
  "Track Side Abnormality",
  "Visibility of Signal",
  "Foreign Material on Track",
  "Trespassing Human",
  "Trespassing Cattle",
  "Others"
];

export default function DriverAbnormality() {

  const [towerCarNo, setTowerCarNo] = useState("");

  const [history, setHistory] = useState([]);

  const [remarks, setRemarks] = useState({

    "Track Side Abnormality": "",

    "Visibility of Signal": "",

    "Foreign Material on Track": "",

    "Trespassing Human": "",

    "Trespassing Cattle": "",

    "Others": ""

  });

  const loadHistory = async () => {

    try {

      const res = await api.get("/abnormalities/my");

      setHistory(res.data);

    }

    catch (err) {

      console.log(err);

    }

  };

  useEffect(() => {

    loadHistory();

  }, []);

  const submit = async () => {

    if (!towerCarNo) {

      Swal.fire(
        "Missing",
        "Select Tower Car",
        "warning"
      );

      return;

    }

    const abnormalities = abnormalityTypes.map(type => ({

      type,

      remarks: remarks[type]

    }));

    try {

      await api.post("/abnormalities", {

        towerCarNo,

        abnormalities

      });

      Swal.fire(

        "Success",

        "Report Submitted",

        "success"

      );

      setTowerCarNo("");

      setRemarks({

        "Track Side Abnormality": "",

        "Visibility of Signal": "",

        "Foreign Material on Track": "",

        "Trespassing Human": "",

        "Trespassing Cattle": "",

        "Others": ""

      });

      loadHistory();

    }

    catch (err) {

      Swal.fire(

        "Error",

        err.response?.data?.msg ||

        "Unable to submit",

        "error"

      );

    }

  };

  return (

    <>

      <Navbar/>

      <div className="min-h-screen bg-slate-100 p-6">

        <div className="max-w-5xl mx-auto space-y-6">

          <div className="flex items-center gap-3">

            <AlertTriangle
              className="text-red-600"
            />

            <div>

              <h2 className="text-2xl font-bold">

                Track Abnormality Report

              </h2>

              <p className="text-gray-500">

                Submit all abnormalities observed during duty

              </p>

            </div>

          </div>

          <div className="bg-white rounded-xl shadow p-6 space-y-6">

            <div>

              <label className="font-medium">

                Tower Car Number

              </label>

              <select

                value={towerCarNo}

                onChange={(e)=>setTowerCarNo(e.target.value)}

                className="w-full border rounded-lg mt-2 px-4 py-2"

              >

                <option value="">

                  Select Tower Car

                </option>

                {

                  towerCars.map(car=>(

                    <option

                      key={car}

                      value={car}

                    >

                      {car}

                    </option>

                  ))

                }

              </select>

            </div>

            {

              abnormalityTypes.map(type=>(

                <div

                  key={type}

                  className="border rounded-xl p-4"

                >

                  <h3 className="font-semibold text-red-600">

                    {type}

                  </h3>

                  <textarea

                    rows={3}

                    value={remarks[type]}

                    onChange={(e)=>

                      setRemarks({

                        ...remarks,

                        [type]:e.target.value

                      })

                    }

                    placeholder="Enter remarks"

                    className="mt-3 w-full border rounded-lg px-4 py-2"

                  />

                </div>

              ))

            }

            <button

              onClick={submit}

              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"

            >

              <Send size={18}/>

              Submit Report

            </button>

          </div>

          {/* HISTORY */}

          <div className="bg-white rounded-xl shadow overflow-hidden">

            <div className="px-5 py-4 border-b">

              <h3 className="font-bold">

                Previous Reports

              </h3>

            </div>

            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="px-4 py-3 text-left">

                    Date

                  </th>

                  <th className="px-4 py-3 text-left">

                    Tower Car

                  </th>

                  <th className="px-4 py-3 text-left">

                    Status

                  </th>

                </tr>

              </thead>

              <tbody>

                {

                  history.length===0 &&

                  <tr>

                    <td

                      colSpan={3}

                      className="text-center py-6"

                    >

                      No Reports

                    </td>

                  </tr>

                }

                {

                  history.map(report=>(

                    <tr

                      key={report._id}

                      className="border-t"

                    >

                      <td className="px-4 py-3">

                        {

                          new Date(report.createdAt)

                          .toLocaleDateString()

                        }

                      </td>

                      <td className="px-4 py-3">

                        {report.towerCarNo}

                      </td>

                      <td className="px-4 py-3">

                        <span className={`px-3 py-1 rounded-full text-xs

                        ${

                          report.status==="Pending"

                          ?

                          "bg-red-100 text-red-700"

                          :

                          "bg-green-100 text-green-700"

                        }

                        `}>

                          {report.status}

                        </span>

                      </td>

                    </tr>

                  ))

                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

      <Footer/>

    </>

  );

}