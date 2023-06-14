import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { getDirectoryContents } from "@/internals/utils";

export default function Home() {
  const rootcontents = getDirectoryContents("");
  // console.log(rootcontents);
  return (
    <div>
      {/* <Link href="/mingus">quake3-latest-pk3s | folder | etc</Link> */}
      {rootcontents.map((item) => {
        if (item.type === "directory") {
          return (
            <div key={item.name} style={{ backgroundColor: "green" }}>
              <Link href={`/${item.name}`}>FOLDER: {item.name}</Link>
            </div>
          );
        } else {
          return (
            <div key={item.name}>
              <a href={`/${item.name}.${item.type}`}>
                {item.name}.{item.type}
              </a>
            </div>
          );
        }
      })}
    </div>
  );
}
