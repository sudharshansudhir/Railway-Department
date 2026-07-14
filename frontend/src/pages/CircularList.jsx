import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import { FileText, Download, Eye, X, Loader2 } from "lucide-react";
import Footer from "../components/Footer";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PDFJS_WORKER_URL = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

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
      <div className="rail-page">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <BackButton />
                <div>
                  <h2 className="rail-page-title">Official Circulars</h2>
                  <p className="rail-page-subtitle">Latest circulars issued by the administration</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#D1D5DB] bg-[#E8EEF5] px-4 py-3 text-sm text-[#0B3C5D]">
              <p className="font-semibold">Public notices</p>
              <p className="text-[#1F6F8B]">Review and download circulars</p>
            </div>
          </div>

          {loading && (
            <div className="rail-card flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#0B3C5D]" />
              <p className="text-[#6B7280]">Loading circulars...</p>
            </div>
          )}

          {!loading && circulars.length === 0 && (
            <div className="rail-card flex flex-col items-center justify-center p-8 text-center text-[#6B7280]">
              <FileText className="mb-3 h-12 w-12 text-[#D1D5DB]" />
              <p className="font-semibold text-[#1F2937]">No circulars available</p>
              <p className="mt-1 text-sm">New official notices will appear here.</p>
            </div>
          )}

          <div className="space-y-4">
            {circulars.map(c => (
              <div key={c._id} className="rail-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EEF5] text-[#0B3C5D]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2937]">{c.title}</p>
                    <p className="text-sm text-[#6B7280]">
                      Posted on {new Date(c.createdAt).toLocaleDateString()}
                      {c.originalFilename && <span className="ml-2">• {c.originalFilename}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => openViewer(c)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-semibold text-[#0B3C5D] transition hover:bg-[#E8EEF5]">
                    <Eye size={16} /> View
                  </button>
                  <a href={`${import.meta.env.VITE_API_URI}/admin/circulars/${c._id}/pdf`} download className="inline-flex items-center justify-center rounded-xl border border-[#D1D5DB] bg-white p-2.5 text-[#1F2937] transition hover:bg-[#E8EEF5]">
                    <Download size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedCircular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div className="h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D1D5DB] p-4">
              <p className="font-semibold text-[#1F2937]">{selectedCircular.title}</p>
              <button onClick={closeViewer} className="rounded-full p-2 text-[#1F2937] transition hover:bg-[#E8EEF5]">
                <X />
              </button>
            </div>
            <div className="h-[calc(100%-64px)]">
              <Worker workerUrl={PDFJS_WORKER_URL}>
                {pdfError ? (
                  <div className="flex h-full items-center justify-center text-[#C8102E]">Failed to load PDF</div>
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
