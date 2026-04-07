"use client";

import { useState } from "react";
import { Star, TrendingUp, Trophy, ChevronRight } from "lucide-react";
const tabs = ["Skill Level", "By Genre", "By Instrument", "Learning Paths"] as const;
type Tab = (typeof tabs)[number];

const skillLevels = [
  {
    icon: Star,
    iconColor: "#E8621A",
    title: "Beginner",
    description:
      "Perfect for those just starting out. Learn the fundamentals and build a strong foundation.",
  },
  {
    icon: TrendingUp,
    iconColor: "#E8621A",
    title: "Intermediate",
    description:
      "Ready to level up? Enhance your skills with more complex techniques and concepts.",
  },
  {
    icon: Trophy,
    iconColor: "#E8621A",
    title: "Advanced",
    description:
      "Master advanced techniques and become an expert with our in-depth curriculum.",
  },
];

const genres = [
  "Rock",
  "Blues",
  "Jazz",
  "Country",
  "Fingerstyle",
  "Acoustic",
  "Bluegrass",
  "Funk",
];

const instruments = [
  { name: "Electric Guitar", image: "/images/home/electric.png" },
  { name: "Acoustic Guitar", image: "/images/home/acoustic.png" },
  { name: "Bass", image: "/images/home/bass.png" },
  { name: "Banjo", image: "/images/home/banjo.png" },
  { name: "Ukulele", image: "/images/home/ukulele.png" },
  { name: "Mandolin", image: "/images/home/mandolin.png" },
];

const learningPaths = [
  {
    title: "Blues Path",
    description: "Complete beginner to advanced Blues learning path",
  },
  {
    title: "Jazz Path",
    description: "Complete beginner to advanced Jazz learning path",
  },
  {
    title: "Acoustic Path",
    description: "Complete beginner to advanced Acoustic learning path",
  },
  {
    title: "Country Path",
    description: "Complete beginner to advanced Country learning path",
  },
  {
    title: "Rock Path",
    description: "Complete beginner to advanced Rock learning path",
  },
  {
    title: "Bass Path",
    description: "Complete beginner to advanced Bass learning path",
  },
];

function SkillLevelContent() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {skillLevels.map((level) => {
        const Icon = level.icon;
        return (
          <div
            key={level.title}
            className="rounded-xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
          >
            <Icon
              size={32}
              color={level.iconColor}
              className="mb-4"
            />
            <h3 className="mb-2 text-2xl font-bold text-[#222]">
              {level.title}
            </h3>
            <p className="mb-6 text-sm text-[#666]">{level.description}</p>
            <button className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 text-sm font-medium text-[#222] transition-colors hover:bg-gray-50">
              Explore Courses
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ByGenreContent() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {genres.map((genre) => (
        <div
          key={genre}
          className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        >
          <span className="mb-2 text-lg font-bold text-[#222]">{genre}</span>
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      ))}
    </div>
  );
}

function ByInstrumentContent() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {instruments.map((instrument) => (
        <div
          key={instrument.name}
          className="relative aspect-video overflow-hidden rounded-xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={instrument.image}
            alt={instrument.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <span className="absolute bottom-4 left-4 text-lg font-bold text-white">
            {instrument.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function LearningPathsContent() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {learningPaths.map((path) => (
        <div
          key={path.title}
          className="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        >
          <h3 className="mb-2 text-xl font-bold text-[#222]">{path.title}</h3>
          <p className="text-sm text-[#999]">{path.description}</p>
        </div>
      ))}
    </div>
  );
}

export function CourseFinderTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("Skill Level");

  return (
    <section className="bg-[#fafafa] py-[60px]">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="mb-3 text-center text-4xl font-bold text-[#222]">
          Find The Perfect Course For You
        </h2>
        <p className="mx-auto mb-10 max-w-[600px] text-center text-sm text-[#666]">
          Whether you&apos;re just starting out or looking to master advanced
          techniques, we have courses tailored to your skill level and musical
          interests.
        </p>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2.5 text-base font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#1A1A1A] text-white"
                  : "border border-[#ddd] bg-white text-[#222] hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Skill Level" && <SkillLevelContent />}
        {activeTab === "By Genre" && <ByGenreContent />}
        {activeTab === "By Instrument" && <ByInstrumentContent />}
        {activeTab === "Learning Paths" && <LearningPathsContent />}
      </div>
    </section>
  );
}
