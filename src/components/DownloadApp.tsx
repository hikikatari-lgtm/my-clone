import { Apple, Play, Monitor } from "lucide-react";

export function DownloadApp() {
  return (
    <section
      className="bg-white"
      style={{ padding: "60px 0", borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5" }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-12 px-4">
        {/* Left Column */}
        <div className="shrink-0">
          <img
            src="/images/apps/app-feature2.png"
            alt="TrueFire App"
            className="max-w-[500px]"
          />
        </div>

        {/* Right Column */}
        <div>
          <h2 className="text-[28px] font-bold text-[#1A1A1A]">
            Download The App
          </h2>
          <p className="my-4 text-[16px] text-[#666]">
            Access courses via the TrueFire app for Windows, Mac, iOS, and
            Android.
          </p>

          <h4 className="mt-6 text-[16px] font-bold text-[#1A1A1A]">
            Download for Mobile Devices &amp; Tablets:
          </h4>
          <div className="mt-3 flex gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-6 py-3 text-white transition-opacity hover:opacity-90">
              <Apple className="h-5 w-5" />
              <span>App Store</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-6 py-3 text-white transition-opacity hover:opacity-90">
              <Play className="h-5 w-5" />
              <span>Google Play</span>
            </button>
          </div>

          <h4 className="mt-6 text-[16px] font-bold text-[#1A1A1A]">
            Download for Desktop Computers &amp; Laptops:
          </h4>
          <div className="mt-3 flex gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-6 py-3 text-white transition-opacity hover:opacity-90">
              <Monitor className="h-5 w-5" />
              <span>Windows</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-6 py-3 text-white transition-opacity hover:opacity-90">
              <Apple className="h-5 w-5" />
              <span>Mac</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
