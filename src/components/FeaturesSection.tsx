import Image from 'next/image';

// Public SVGs → /public/Images/Features
const features = [
  { title: 'Ad‑Free', src: '/Images/Features/ad-free.svg' },
  { title: 'Secure & Reliable', src: '/Images/Features/secure.svg' },
  { title: 'No Signup', src: '/Images/Features/no-signup.svg' },
  { title: 'Open Source', src: '/Images/Features/open-source.svg' },
  {
    title: 'Completely Private',
    src: '/Images/Features/private.svg',
  },
  { title: 'Fast & Convenient', src: '/Images/Features/fast.svg' },
  { title: 'Easy to Use', src: '/Images/Features/easy.svg' },
  { title: '100% Free', src: '/Images/Features/free.svg' },
  {
    title: 'Design For Everyone',
    src: '/Images/Features/for-everyone.svg',
  },
] as const;

type Feature = (typeof features)[number];

/*
  Desktop (≥1280px): 5 icons top row, 4 bottom row staggered between → 9‑column grid.
  Below xl: fall back to ordinary wrapping grid, but shrink icons so they fit neatly.
*/
const xlColStarts = [
  'xl:col-start-1', // 0
  'xl:col-start-3', // 1
  'xl:col-start-5', // 2
  'xl:col-start-7', // 3
  'xl:col-start-9', // 4
  'xl:col-start-2', // 5
  'xl:col-start-4', // 6
  'xl:col-start-6', // 7
  'xl:col-start-8', // 8
];

export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-16">
      <ul className="grid grid-cols-3 gap-x-12 gap-y-12 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-9 xl:gap-x-0 xl:gap-y-12">
        {features.map(({ title, src }: Feature, idx) => (
          <li
            key={title}
            className={`flex flex-col items-center justify-center ${xlColStarts[idx]}`}
          >
            <Image
              src={src}
              alt=""
              width={256}
              height={256}
              className="xs:w-24 block h-auto w-20 select-none sm:w-28 md:w-32 xl:w-[128px]"
            />
            <span className="font-fredoka-one text-center text-sm text-white">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
