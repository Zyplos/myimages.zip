"use client";

import styles from "./Breadcrumbs.module.scss";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  console.log("BREADCRUMBS CURRENT pathname", pathname);

  const items = ["C:\\Users\\offic\\Downloads\\myimages.zip\\"];
  pathname.split("/").forEach((item) => {
    if (item !== "") {
      items.push(item + "\\");
    }
  });
  // for each item, create a link that goes up one level
  const Links = items.map((item, index) => {
    const upLevelLink = pathname.split("/").slice(1).slice(0, index).join("/");
    return (
      <Link key={index} href={"/" + upLevelLink}>
        {item}
      </Link>
    );
  });

  // remove last path segment to go up one level
  const upLevelLink = pathname.split("/").slice(1).slice(0, -1).join("/");
  const isIndex = pathname == "/";

  return (
    <div className={styles["breadcrumbs-wrapper"]}>
      <div className={styles["up-button-wrapper"]}>
        <Link className={styles["up-button"]} href={"/" + upLevelLink}>
          <Image src="/images/icons/levelup-icon.svg" width="18" height="18" alt="Test Icon" />
        </Link>
      </div>
      <div className={styles["breadcrumbs-list-wrapper"]}>
        <Image src={`/images/icons/${isIndex ? "zipfile" : "folder"}-icon.svg`} width="18" height="18" alt="Test Icon" />
        <div className={styles["breadcrumbs-list"]}>{Links}</div>
      </div>
    </div>
  );
}
