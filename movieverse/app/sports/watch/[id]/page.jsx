import SportsPlayer from "@/content/sports/SportsPlayer"

const SportsWatch = async ({ params }) => {
  const { id } = await params

  return (
    <>
      <div className="w-full flex flex-col items-center z-10 relative main-responsive top-[106px]">
        <div className="w-full max-w-[96rem]">
          <SportsPlayer id={id} />
        </div>
      </div>

      <div className="fixed w-[138.33px] h-[82.25px] left-[1%] top-[2%] bg-[#92b7fc8f] blur-[200px]" />
      <div className="absolute max-[737px]:fixed w-[500px] h-[370.13px] right-[50%] bottom-[-25%] bg-[#576683b4] blur-[215.03px] translate-x-[70%] z-0 rounded-b-[30%]" />
    </>
  )
}

export default SportsWatch
