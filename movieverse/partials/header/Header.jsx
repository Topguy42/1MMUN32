import styles from "./header.module.css"
import Link from "next/link"
import Links from "./Links"
import Search from "./Search"
import Responsive from "./Responsive"


const Header = () => {
  return (
    <div className={styles.container} data-mv-header>
      <div className={styles.wrapper}>

        <div className={styles.left}>

          <Responsive />

          <Link href={"/"} className={`${styles.brand} flex items-center gap-2`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/foil.png" alt="tinf0il" width={32} height={32} className={styles.brandLogo} />
            <span className={styles.brandName}>tinf<em>0</em>il <span className={styles.brandSub}>TV</span></span>
          </Link>

          {/* links */}
          <Links />

        </div>

        <div className={`${styles.right} min-[1390px]:w-[24%]`}>
          <Search />
          {/* notification */}
          {/* <div className="text-2xl text-slate-200">
            <Bell />
          </div> */}


        </div>

      </div>
    </div>
  )
}

export default Header