import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { FileText, Download } from "lucide-react";
import Footer from "../components/Footer";

export default function CircularList() {
  const [circulars, setCirculars] = useState([]);

  useEffect(() => {
    api.get("/admin/circulars").then(res => setCirculars(res.data));
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              Official Circulars
            </h2>
            <p className="text-sm text-gray-500">
              Latest circulars issued by the administration
            </p>
          </div>

          {/* EMPTY STATE */}
          {circulars.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No circulars available
            </div>
          )}

          {/* LIST */}
          <div className="space-y-4">
            {circulars.map(c => (
              <div
                key={c._id}
                className="bg-white border rounded-xl p-4 shadow-sm
                           flex flex-col sm:flex-row
                           sm:items-center sm:justify-between gap-3"
              >
                {/* LEFT */}
                <div className="flex items-start gap-3">
                  <FileText className="text-indigo-600 mt-1" size={22} />
                  <div>
                    <p className="font-medium text-gray-800">
                      {c.title}
                    </p>
                    {c.createdAt && (
                      <p className="text-xs text-gray-500">
                        Posted on{" "}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <a
                  href={c.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2
                             px-4 py-2 text-sm font-medium
                             text-indigo-600 border border-indigo-200
                             rounded-lg hover:bg-indigo-50 transition"
                >
                  <Download size={16} />
                  View / Download
                </a>
              </div>
            ))}
          </div>

        </div>
      </div>
      <Footer/>
    </>
  );
}
