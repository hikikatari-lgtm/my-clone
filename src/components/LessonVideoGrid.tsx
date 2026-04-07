import type { LessonVideo } from "@/lib/notion";

interface LessonVideoGridProps {
  title: string;
  videos: LessonVideo[];
}

function RatingStars({ rating }: { rating: string }) {
  if (!rating) return null;
  const stars = rating.length;
  return (
    <span className="text-sm text-yellow-500">
      {rating}
    </span>
  );
}

function TopicBadge({ topic }: { topic: string }) {
  const colorMap: Record<string, string> = {
    "コード理論": "bg-blue-100 text-blue-800",
    "アレンジ": "bg-green-100 text-green-800",
    "テクニック": "bg-orange-100 text-orange-800",
    "耳コピ": "bg-purple-100 text-purple-800",
    "アドリブ": "bg-red-100 text-red-800",
    "リズム": "bg-yellow-100 text-yellow-800",
    "音楽理論": "bg-gray-100 text-gray-800",
    "ジャズ": "bg-amber-100 text-amber-800",
    "ゴスペル": "bg-pink-100 text-pink-800",
    "R&B": "bg-indigo-100 text-indigo-800",
  };
  const colors = colorMap[topic] || "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>
      {topic}
    </span>
  );
}

function InstrumentIcon({ instrument }: { instrument: string }) {
  const iconMap: Record<string, string> = {
    "ピアノ": "🎹",
    "ギター": "🎸",
    "ベース": "🎸",
  };
  return <span className="text-lg">{iconMap[instrument] || "🎵"}</span>;
}

function VideoTypeLabel({ type }: { type: string }) {
  if (!type) return null;
  const colorMap: Record<string, string> = {
    "解説": "bg-purple-600",
    "演奏": "bg-yellow-600",
    "レッスン": "bg-red-600",
    "その他": "bg-gray-500",
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold text-white ${colorMap[type] || "bg-gray-500"}`}>
      {type}
    </span>
  );
}

function LessonVideoCard({ video }: { video: LessonVideo }) {
  const hasUrl = video.url.length > 0;
  const linkUrl = hasUrl ? video.url : video.notionUrl;

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Top bar with instrument color */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#1A1A1A] to-[#333] px-4 py-2">
        {video.instrument && <InstrumentIcon instrument={video.instrument} />}
        {video.videoType && <VideoTypeLabel type={video.videoType} />}
        {video.rating && <RatingStars rating={video.rating} />}
        {video.proficiency && (
          <span className="ml-auto text-xs text-white/70">{video.proficiency}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] font-bold text-[#222] group-hover:text-[#E8621A]">
          {video.title}
        </h3>

        {video.channel && (
          <p className="mt-1 text-xs text-[#999]">{video.channel}</p>
        )}

        {/* Topics */}
        {video.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {video.topics.map((t) => (
              <TopicBadge key={t} topic={t} />
            ))}
          </div>
        )}

        {/* Summary */}
        {video.summary && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#888]">
            {video.summary}
          </p>
        )}
      </div>
    </a>
  );
}

export function LessonVideoGrid({ title, videos }: LessonVideoGridProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[28px] font-bold text-[#222]">{title}</h2>
        <span className="text-sm text-[#666]">{videos.length} 本</span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <LessonVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
