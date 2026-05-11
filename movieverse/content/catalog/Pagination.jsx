"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import ReactPaginate from 'react-paginate';

const Pagination = ({ pageInfo }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [page, setPage] = useState(pageInfo?.currentPage);

  // Derive the base route (e.g. /catalog from /catalog or /catalog/3)
  const baseRoute = "/" + pathname.split("/").filter(Boolean)[0]

  useEffect(() => {
    const navigateToPage = (pageNum) => {
      // Keep existing filter params (q, type, isAdult) but drop any stale page param
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.delete("page");
      const query = updatedParams.toString();
      router.push(`${baseRoute}/${pageNum}${query ? `?${query}` : ""}`)
    };

    const currentPage = pageInfo?.currentPage ?? 1;
    if (page !== currentPage) {
      navigateToPage(page);
    }
  }, [page]);

  const itemClass = "h-9 w-9 flex items-center justify-center rounded-md bg-[#242735] font-['poppins'] text-[15px] text-slate-200 cursor-pointer";

  return (
    <div className="w-full flex items-center justify-center">
      <ReactPaginate
        breakLabel="..."
        nextLabel={<FaArrowRight />}
        onPageChange={(selectedPage) => setPage(selectedPage.selected + 1)}
        pageRangeDisplayed={5}
        containerClassName="flex items-center gap-[4px] flex-wrap"
        pageLinkClassName={itemClass}
        breakClassName={itemClass}
        nextClassName={itemClass}
        previousClassName={itemClass}
        activeLinkClassName="bg-[#48455f]"
        pageCount={pageInfo?.lastPage}
        previousLabel={<FaArrowLeft />}
        renderOnZeroPageCount={null}
      />
    </div>
  );
}

export default Pagination;
