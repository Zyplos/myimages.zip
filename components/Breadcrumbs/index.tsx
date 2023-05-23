"use client";

import styles from "./Breadcrumbs.module.scss";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const items = ["C:\\Users\\zyplos\\Downloads\\myimages.zip\\"];
  pathname.split("/").forEach((item) => {
    if (item !== "") {
      items.push(item + "\\");
    }
  });

  return (
    <div className={styles["breadcrumbs-wrapper"]}>
      <div className={styles["up-button-wrapper"]}>
        <button className={styles["up-button"]}>
          <Image src="/images/icons/test-icon.svg" width="16" height="16" alt="Test Icon" />
        </button>
      </div>
      <div className={styles["breadcrumbs-list-wrapper"]}>
        <Image src="/images/icons/test-icon.svg" width="18" height="18" alt="Test Icon" />
        <div className={styles["breadcrumbs-list"]}>
          {items.map((item, index) => (
            <button key={index}>{item}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
