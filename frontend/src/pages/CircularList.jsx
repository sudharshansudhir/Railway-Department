import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { FileText, Download, Eye, X, Loader2, ExternalLink } from "lucide-react";
import Footer from "../components/Footer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PDFJS_WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export default function CircularList() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);

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

  const openViewer = (circular) => {
    setSelectedCircular(circular);
    setPdfLoading(true);
    setPdfError(false);
  };

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
            {circulars.map(c => (
              <div
                key={c._id}
                className="bg-white border rounded-xl p-4 shadow-sm
                           flex flex-col sm:flex-row
                           sm:items-center sm:justify-between gap-3"
              >
                {/* LEFT */}
                <div className="flex items-start gap-3">
                  <FileText className="text-indigo-600 mt-1 shrink-0" size={22} />
                  <div>
                    <p className="font-medium text-gray-800">
                      {c.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Posted on {new Date(c.createdAt).toLocaleDateString()}
                      {c.originalFilename && (
                        <span className="ml-2 text-gray-400">• {c.originalFilename}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* RIGHT - Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openViewer(c)}
                    className="inline-flex items-center justify-center gap-2
                               px-4 py-2 text-sm font-medium
                               bg-indigo-600 text-white
                               rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <a
                    href={c.pdfUrl}
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

      {/* PDF Viewer Modal */}
      {selectedCircular && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-lg">{selectedCircular.title}</h3>
                <p className="text-indigo-200 text-sm">
                  Posted: {new Date(selectedCircular.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedCircular.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="Open in new tab"
                >
                  <ExternalLink size={20} />
                </a>
                <a
                  href={selectedCircular.pdfUrl}
                  download
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="Download"
                >
                  <Download size={20} />
                </a>
                <button
                  onClick={closeViewer}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-hidden relative">
              {pdfLoading && !pdfError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-3" />
                    <p className="text-gray-500">Loading PDF...</p>
                  </div>
                </div>
              )}

              {pdfError ? (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-gray-700 font-semibold mb-2">Preview Unavailable</h4>
                    <p className="text-gray-500 text-sm mb-4">
                      Unable to display PDF in browser. Please download or open externally.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <a
                        href={selectedCircular.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Open PDF
                      </a>
                      <a
                        href={selectedCircular.pdfUrl}
                        download
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition inline-flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <Worker workerUrl={PDFJS_WORKER_URL}>
                  <div className="h-full">
                    <Viewer
                      fileUrl={selectedCircular.pdfUrl}
                      defaultScale={SpecialZoomLevel.PageWidth}
                      onDocumentLoad={() => setPdfLoading(false)}
                      renderError={() => setPdfError(true)}
                    />
                  </div>
                </Worker>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer/>
    </>
  );
}
