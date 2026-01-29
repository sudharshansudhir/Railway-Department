import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { FileText, Download, Eye, X, Loader2 } from "lucide-react";
import Footer from "../components/Footer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PDFJS_WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

export default function CircularList() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);

  // PDF viewer states
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

  /* =======================
     FETCH CIRCULARS
  ======================= */
  useEffect(() => {
    const fetchCirculars = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/circulars");
        setCirculars(res.data);
      } catch (err) {
        console.error("Failed to load circulars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCirculars();
  }, []);

  /* =======================
     OPEN PDF VIEWER
  ======================= */
  const openViewer = (circular) => {
    setSelectedCircular(circular);
    setPdfLoading(true);
    setPdfError(false);
  };

  /* =======================
     CLOSE PDF VIEWER
  ======================= */
  const closeViewer = () => {
    setSelectedCircular(null);
    setPdfLoading(true);
    setPdfError(false);
  };

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

          {/* LOADING STATE */}
          {loading && (
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-gray-500">Loading circulars...</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && circulars.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              No circulars available
            </div>
          )}

          {/* LIST */}
          <div className="space-y-4">
            {circulars.map((c) => (
              <div
                key={c._id}
                className="bg-white border rounded-xl p-4 shadow-sm
                           flex flex-col sm:flex-row
                           sm:items-center sm:justify-between gap-3"
              >
                {/* LEFT */}
                <div className="flex items-start gap-3">
                  <FileText
                    className="text-indigo-600 mt-1 shrink-0"
                    size={22}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{c.title}</p>
                    <p className="text-xs text-gray-500">
                      Posted on{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                      {c.originalFilename && (
                        <span className="ml-2 text-gray-400">
                          • {c.originalFilename}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* RIGHT - ACTION BUTTONS */}
                <div className="flex items-center gap-2">
                  {/* VIEW */}
                  <button
                    onClick={() => openViewer(c)}
                    className="inline-flex items-center justify-center gap-2
                               px-4 py-2 text-sm font-medium
                               text-indigo-600 border border-indigo-200
                               rounded-lg hover:bg-indigo-50 transition"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {/* DOWNLOAD */}
                  <a
                    href={`${import.meta.env.VITE_API_URI}/admin/circulars/${c._id}/pdf`}
                    download
                    className="inline-flex items-center justify-center gap-2
                               px-4 py-2 text-sm font-medium
                               text-gray-700 border border-gray-200
                               rounded-lg hover:bg-gray-50 transition"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =======================
          PDF VIEWER MODAL
      ======================= */}
      {selectedCircular && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-lg overflow-hidden">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-medium text-gray-800">
                {selectedCircular.title}
              </p>
              <button onClick={closeViewer}>
                <X />
              </button>
            </div>

            {/* PDF CONTENT */}
            <div className="h-full">
              <Worker workerUrl={PDFJS_WORKER_URL}>
                {pdfError ? (
                  <div className="h-full flex items-center justify-center text-red-500">
                    Failed to load PDF
                  </div>
                ) : (
                  <Viewer
                    fileUrl={selectedCircular.pdfUrl}
                    withCredentials={false}
                    defaultScale={SpecialZoomLevel.PageFit}
                    onDocumentLoad={() => setPdfLoading(false)}
                    onDocumentLoadFail={() => {
                      setPdfLoading(false);
                      setPdfError(true);
                    }}
                  />
                )}
              </Worker>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
