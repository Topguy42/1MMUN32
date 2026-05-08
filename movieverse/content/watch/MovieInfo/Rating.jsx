import { IoStar } from "react-icons/io5"

const Star = ({ fill }) => (
  <span className="relative inline-block text-[27px]" style={{ color: '#6a727f' }}>
    <IoStar />
    {fill > 0 && (
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fill * 100}%`, color: 'var(--accent)' }}
        aria-hidden="true"
      >
        <IoStar />
      </span>
    )}
  </span>
)

const Rating = ({ info }) => {
  const starValue = (info?.vote_average || 0) / 2;

  return (
    <div className="flex items-center mt-2 relative max-[1240px]:hidden">
      <div className="bg-[#22212c] border border-[#39374b] rounded-2xl h-max p-4 flex flex-col items-center justify-center w-max relative z-10">
        <div className="flex gap-2 items-baseline">
          <span className="text-[var(--accent)] text-2xl font-semibold">{info?.vote_average?.toFixed(1)}/10</span>
          <span className="text-[#717480] text-sm font-semibold">{info?.popularity} reviews</span>
        </div>

        <div className="flex items-center bg-[#333145] gap-2 rounded-lg px-4 py-1 mt-4">
          {[0, 1, 2, 3, 4].map(i => (
            <Star key={i} fill={Math.min(1, Math.max(0, starValue - i))} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Rating
