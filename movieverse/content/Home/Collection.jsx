import FeaturedCard from "@/components/Cards/featuredCard/FeaturedCard"
import { FaArrowRight } from "react-icons/fa6";

const Collection = () => {
  const data = [
    {
      text: "The best of Action",
      image: [
        "https://media.themoviedb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        "https://media.themoviedb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
        "https://media.themoviedb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg",
      ]
    },
    {
      text: "The best of Romance",
      image: [
        "https://media.themoviedb.org/t/p/w500/qom1SZSENdmHFNZBXbtfRtKCGx8.jpg",
        "https://media.themoviedb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        "https://media.themoviedb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      ]
    },
    {
      text: "The best of Thriller",
      image: [
        "https://media.themoviedb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
        "https://media.themoviedb.org/t/p/w500/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg",
        "https://media.themoviedb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      ]
    }
  ]
  return (
    <div className="w-full max-w-[96rem] relative mx-5">
      <div className="flex justify-between">
        <h1 className="text-[#f6f4f4ea] font-medium text-2xl font-['poppins'] max-[450px]:text-[1.2rem]">| Featured Collections</h1>

        <div className="text-[#ffffffbd] flex items-center gap-1 cursor-pointer hover:text-slate-500 transition">See All <FaArrowRight /></div>
      </div>

      <div className="mt-8 mb-52 grid grid-cols-[repeat(auto-fit,minmax(345px,1fr))] gap-3">
        {data.map((item, index) => <FeaturedCard key={index} data={item} />)}
      </div>


    </div>
  )
}

export default Collection