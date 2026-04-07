import { Apple, Play } from "lucide-react";
import {
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
  InstagramIcon,
} from "@/components/icons";

const column1Links = [
  "All Access",
  "Sales",
  "Most Popular",
  "Apps",
  "Free Downloads",
  "Learning Paths",
  "Educators",
  "Blog",
  "Private Lessons",
];

const column2Links = [
  "Guitar Chord Charts",
  "Guitar Tuner",
  "Metronome",
  "Guitar Chord Finder",
  "Practice Guide",
  "Jam Tracks",
  "Guitar Scales",
  "Chord Library",
];

const column3Links = [
  "About",
  "Affiliates",
  "Partnerships",
  "Press",
  "Team",
  "TrueFire Studios",
  "JamPlay",
  "ArtistWorks",
];

const column4Links = [
  "Gift Certificates",
  "Refer a Friend",
  "JamPlay Archive",
  "DVD Assets",
  "Audio Lessons",
  "Cookie Preferences",
  "Teach",
  "Contact",
];

const bottomLinks = ["Terms", "Privacy", "Help", "Guides", "FAQ", "Rescue"];

function FooterColumn({
  title,
  links,
}: {
  title?: string;
  links: string[];
}) {
  return (
    <div className="w-[200px]">
      {title && (
        <h5 className="mb-4 text-[14px] font-bold text-white">{title}</h5>
      )}
      <ul className="space-y-0">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-[14px] leading-8 text-white/50 no-underline transition-colors hover:text-[#E8621A]"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A]" style={{ borderTop: "1px solid #333" }}>
      <div className="mx-auto max-w-[1200px] px-4 pt-12 pb-6">
        {/* Main Content */}
        <div className="flex justify-between">
          {/* Link Columns */}
          <div className="flex gap-4">
            <FooterColumn links={column1Links} />
            <FooterColumn title="Tools" links={column2Links} />
            <FooterColumn title="Company" links={column3Links} />
            <FooterColumn title="More" links={column4Links} />
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-end">
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                className="text-white/50 transition-colors hover:text-[#E8621A]"
              >
                <FacebookIcon className="h-8 w-8" />
              </a>
              <a
                href="#"
                className="text-white/50 transition-colors hover:text-[#E8621A]"
              >
                <TwitterIcon className="h-8 w-8" />
              </a>
              <a
                href="#"
                className="text-white/50 transition-colors hover:text-[#E8621A]"
              >
                <YoutubeIcon className="h-8 w-8" />
              </a>
              <a
                href="#"
                className="text-white/50 transition-colors hover:text-[#E8621A]"
              >
                <InstagramIcon className="h-8 w-8" />
              </a>
            </div>

            {/* Store Buttons */}
            <div className="mt-6 flex w-[240px] flex-col gap-3">
              <a
                href="#"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 px-8 py-3 text-white/70 transition-colors hover:border-[#E8621A] hover:text-[#E8621A]"
              >
                <Apple className="h-5 w-5" />
                <span>App Store</span>
              </a>
              <a
                href="#"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 px-8 py-3 text-white/70 transition-colors hover:border-[#E8621A] hover:text-[#E8621A]"
              >
                <Play className="h-5 w-5" />
                <span>Play Store</span>
              </a>
            </div>

            {/* Tagline */}
            <p className="mt-4 text-[12px] tracking-wide text-[#E8621A] uppercase">
              PRACTICE SMART. PLAY HARD.&trade;
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-8 flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid #333" }}
        >
          <span className="text-[12px] text-white/30">
            &copy; 1998-2025 TrueFire, Inc. All Rights Reserved.
          </span>
          <span className="text-[12px] text-white/30">
            Need help? Call 1-800-222-3366
          </span>
          <div className="flex gap-4">
            {bottomLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-[12px] text-white/50 no-underline transition-colors hover:text-[#E8621A]"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
