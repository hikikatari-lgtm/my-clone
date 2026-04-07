interface Course {
  id: string;
  title: string;
  author: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
}

interface CourseCardGridProps {
  title: string;
  courses: Course[];
}

function StarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="#e72208"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.image}
          alt={course.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="truncate text-[16px] font-bold text-[#222]">
          {course.title}
        </h3>
        <p className="text-[14px] italic text-[#666]">{course.author}</p>
        {course.isNew && (
          <p className="text-[14px] italic text-[#E8621A]">
            🔥 New Course!
          </p>
        )}
        {course.rating != null && course.reviewCount != null && (
          <div className="mt-1 flex items-center gap-1 text-[14px]">
            <StarIcon />
            <span>
              {course.rating} ({course.reviewCount} reviews)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CourseCardGrid({ title, courses }: CourseCardGridProps) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[28px] font-bold text-[#222]">{title}</h2>
        <button
          type="button"
          className="rounded-lg border border-[#222] px-4 py-2 text-[12px] font-bold uppercase tracking-wide"
        >
          VIEW ALL
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

export const hotNewCourses: Course[] = [
  { id: "2936", title: "Phrasing The Blues", author: "Mike Zito", image: "/images/courses/2936.jpg", isNew: true },
  { id: "2960", title: "Back to Basics: Scales", author: "Ariel Posen", image: "/images/courses/2960.jpg", rating: 5, reviewCount: 7 },
  { id: "2966", title: "RAW", author: "Eric Gales", image: "/images/courses/2966.jpg", rating: 5, reviewCount: 9 },
  { id: "2954", title: "Guitar Zen: Fingerstyle", author: "Eric Haugen", image: "/images/courses/2954.jpg", rating: 5, reviewCount: 4 },
  { id: "2934", title: "Fit Fingers", author: "Rob Swift", image: "/images/courses/2934.jpg", rating: 5, reviewCount: 3 },
  { id: "2962", title: "30 Blues Jam Rhythms You Must Know", author: "Mike Zito", image: "/images/courses/2962.jpg", rating: 5, reviewCount: 13 },
];

export const mostPopularCourses: Course[] = [
  { id: "1762", title: "Guitar Zen: CAGED", author: "Eric Haugen", image: "/images/courses/1762.jpg", rating: 5, reviewCount: 147 },
  { id: "1944", title: "Tone, Melody & Truth", author: "Eric Johnson", image: "/images/courses/1944.jpg", rating: 5, reviewCount: 29 },
  { id: "696", title: "Fingerstyle Milestones", author: "Tommy Emmanuel", image: "/images/courses/696.jpg", rating: 5, reviewCount: 101 },
  { id: "1385", title: "Blue Highways", author: "Josh Smith", image: "/images/courses/1385.jpg", rating: 5, reviewCount: 93 },
  { id: "1303", title: "Melodic Muse", author: "Andy Timmons", image: "/images/courses/1303.jpg", rating: 5, reviewCount: 66 },
  { id: "1505", title: "50 Jazz Guitar Licks", author: "Martin Taylor", image: "/images/courses/1505.jpg", rating: 5, reviewCount: 56 },
];

export const songLessonCourses: Course[] = [
  { id: "1907", title: "Song Lesson: Blue Sky", author: "Tyler Grant", image: "/images/courses/1907.jpg", rating: 5, reviewCount: 13 },
  { id: "2683", title: "Song Lesson: The Thrill is Gone", author: "Seth Rosenbloom", image: "/images/courses/2683.jpg", rating: 4.5, reviewCount: 23 },
  { id: "1954", title: "Song Lesson: Maggie May", author: "Tyler Grant", image: "/images/courses/1954.jpg", rating: 5, reviewCount: 2 },
  { id: "2727", title: "Song Lesson: Layla", author: "Lance Ruby", image: "/images/courses/2727.jpg", rating: 5, reviewCount: 5 },
  { id: "2853", title: "Song Lesson: You Should Probably Leave", author: "Tyler Grant", image: "/images/courses/2853.jpg", rating: 5, reviewCount: 3 },
  { id: "2741", title: "Song Lesson: Sex on Fire", author: "Jeffery Marshall", image: "/images/courses/2741.jpg", rating: 5, reviewCount: 4 },
];
