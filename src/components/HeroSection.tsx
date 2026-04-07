export function HeroSection() {
  return (
    <section
      className="relative w-full bg-[#222]"
      style={{ minHeight: 431 }}
    >
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/home/joshua-ellish-splash.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full flex-col justify-center px-4" style={{ maxWidth: 1200, minHeight: 431 }}>
        <h1 className="text-[2.5rem] font-bold leading-tight text-white">
          廣嶋茂樹のピアノ・ギター教室
        </h1>

        <p className="mt-5 text-xl leading-relaxed text-white/90">
          800人以上の生徒が学んだ音楽レッスン
        </p>

        {/* CTA button */}
        <div className="mt-8">
          <a
            href="#"
            className="inline-block rounded-full bg-[#E8621A] px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-[#d4570f] hover:shadow-xl"
          >
            無料体験レッスンを申し込む
          </a>
        </div>
      </div>
    </section>
  );
}
