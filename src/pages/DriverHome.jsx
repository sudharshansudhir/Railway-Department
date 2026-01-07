import Navbar from "../components/Navbar";
import BackgroundVideo from "../components/BackgroundVideo";

export default function DriverHome() {
  return (
    <div className="relative min-h-screen">
      <BackgroundVideo />
      <Navbar />

      <div className="relative z-10 flex items-center justify-center min-h-screen pt-20">
        <div className="bg-black/70 backdrop-blur p-10 rounded-xl text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="text-5xl mb-2">👤</div>
              <p className="font-semibold">Biodata</p>
            </div>
            <div>
              <div className="text-5xl mb-2">📝</div>
              <p className="font-semibold">Daily Entry</p>
            </div>
            <div>
              <div className="text-5xl mb-2">🩺</div>
              <p className="font-semibold">Checkups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
