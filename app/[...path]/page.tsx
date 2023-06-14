"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import { usePathname } from "next/navigation";
import { ItemData, convertDateFormat, formatIntegerWithSpaces, getDirectoryContents } from "@/internals/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Column {
  header: HTMLTableCellElement;
  size: string;
}

const min = 150;
const columnTypeToRatioMap: { [key: string]: number } = {
  numeric: 1,
  "text-short": 1.67,
  "text-long": 3.33,
};

// given an element, find the parent td element and then return the contents of the 2nd td child
function grabBytesDataFromDOM(span: HTMLSpanElement) {
  const td = span.parentElement?.parentElement?.parentElement?.children[1];
  if (!td) return null;
  return td.textContent;
}
// same thing as grabBytesDataFromDOM but returns the modified date instead
function grabModifiedDateFromDOM(span: HTMLSpanElement) {
  const td = span.parentElement?.parentElement?.parentElement?.children[2];
  if (!td) return null;
  return td.textContent;
}

// [ '.jpg', '.png', '.url', '.gif', '.jpeg', '.JPG' ]
const typeToIconMap: { [key: string]: string } = {
  directory: "folder",
  jpg: "jpg",
  png: "png",
  url: "url",
  gif: "gif",
  jpeg: "jpg",
  JPG: "jpg",
};

function TypedIcon({ type }: { type: string }) {
  return <Image src={`/images/icons/${typeToIconMap[type] || "defaultfile"}-icon.svg`} width="16" height="16" alt="Test Icon" />;
}

function CorrectLink({ item, currentPath }: { item: ItemData; currentPath: string }) {
  const router = useRouter();
  if (item.type === "directory") {
    return (
      <>
        <button
          onDoubleClick={() => router.push(currentPath + `/${item.name}`)}
          onKeyUp={(e) => {
            // if key is enter or numpad enter
            if (e.key === "Enter" || e.key === "NumpadEnter") {
              router.push(currentPath + `/${item.name}`);
            }
          }}
        >
          <TypedIcon type={item.type} />
          <span>{item.name}</span>
        </button>
      </>
    );
  } else if (item.type === "url") {
    return (
      <>
        <button
          onDoubleClick={() => window.open(item.url)}
          onKeyUp={(e) => {
            // if key is enter or numpad enter
            if (e.key === "Enter" || e.key === "NumpadEnter") {
              window.open(item.url);
            }
          }}
        >
          <TypedIcon type={item.type} />
          <span>
            {item.name}.{item.type}
          </span>
        </button>
      </>
    );
  } else {
    return (
      <>
        <button
          onDoubleClick={() => window.open(`/images/_filespace${currentPath}/${item.name}.${item.type}`)}
          onKeyUp={(e) => {
            // if key is enter or numpad enter
            if (e.key === "Enter" || e.key === "NumpadEnter") {
              window.open(`/images/_filespace${currentPath}/${item.name}.${item.type}`);
            }
          }}
        >
          <TypedIcon type={item.type} />
          <span>
            {item.name}.{item.type}
          </span>
        </button>
      </>
    );
  }
}

export default function FolderPage() {
  const [currentlySelected, setCurrentlySelected] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    // https://adamlynch.com/flexible-data-tables-with-css-grid/
    const table = document.querySelector("table");
    if (!table) return;

    const columns: Column[] = [];
    let headerBeingResized: HTMLElement | null;

    const onMouseMove = (e: MouseEvent) =>
      requestAnimationFrame(() => {
        console.log("onMouseMove");

        const horizontalScrollOffset = document.documentElement.scrollLeft;
        const width = horizontalScrollOffset + e.clientX - headerBeingResized!.offsetLeft;

        const column = columns.find(({ header }) => header === headerBeingResized);
        if (column) {
          column.size = Math.max(min, width) + "px";
        }

        table.style.gridTemplateColumns = columns.map(({ size }) => size).join(" ");
      });

    const onMouseUp = () => {
      console.log("onMouseUp");

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (headerBeingResized) {
        headerBeingResized.classList.remove("header--being-resized");
      }
      headerBeingResized = null;
    };

    const initResize = ({ target }: MouseEvent) => {
      console.log("initResize");

      headerBeingResized = (target as HTMLSpanElement).parentNode as HTMLElement;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      if (headerBeingResized) {
        headerBeingResized.classList.add("header--being-resized");
      }
    };

    document.querySelectorAll("th").forEach((header) => {
      const max = columnTypeToRatioMap[header.dataset.type as string] + "fr";
      columns.push({
        header,
        size: `minmax(${min}px, ${max})`,
      });
      const resizeHandle = header.querySelector(".resize-handle") as HTMLElement;
      resizeHandle.addEventListener("mousedown", initResize);
    });

    // ===== SET LAST FOCUSED LINK
    const setLastFocusedLink = (e: Event) => {
      const target = e.target as HTMLButtonElement;
      // const button = target.closest("button");
      // console.log("SETTING LAST FOCUSED LINK", button);

      // remove "active-border" from all td a elements
      document.querySelectorAll("td button span").forEach((link) => {
        link.classList.remove(styles["active-border"]);
      });

      // add "active-border" to the clicked td a element
      target.classList.add(styles["active-border"]);

      setCurrentlySelected(target);
    };
    document.querySelectorAll("td button span").forEach((link) => {
      link.addEventListener("mousedown", setLastFocusedLink);
    });

    // ===== GRAB CURRENTLY SELECTED LINK

    // Clean up event listeners in the return function
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      columns.forEach(({ header }) => {
        const resizeHandle = header.querySelector(".resize-handle") as HTMLElement;
        resizeHandle.removeEventListener("mousedown", initResize);
      });

      document.querySelectorAll("td button span").forEach((link) => {
        link.removeEventListener("mousedown", setLastFocusedLink);
      });
    };
  }, []);

  const pathname = usePathname();
  console.log("CURRENT PATHNAME: ", pathname);
  // remove beginning slash
  const pathFixed = pathname.substring(1);

  const rootcontents = getDirectoryContents(pathFixed);
  console.log(rootcontents);

  // sort by directory first, then by name
  rootcontents.sort((a, b) => {
    if (a.type === "directory" && b.type !== "directory") {
      return -1;

      // if a is not a directory and b is a directory, return 1
    } else if (a.type !== "directory" && b.type === "directory") {
      return 1;

      // if a and b are both directories, sort by name
    } else if (a.type === "directory" && b.type === "directory") {
      return a.name.localeCompare(b.name);

      // if a and b are both not directories, sort by name
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <>
      <table className={`${styles.table} table`}>
        <thead>
          <tr>
            <th data-type="numeric">
              Name <span className={`resize-handle ${styles["resize-handle"]}`}></span>
            </th>
            <th data-type="text-short">
              Size <span className={`resize-handle ${styles["resize-handle"]}`}></span>
            </th>
            <th data-type="text-short">
              Modified <span className={`resize-handle ${styles["resize-handle"]}`}></span>
            </th>
            <th data-type="text-short">
              Created <span className={`resize-handle ${styles["resize-handle"]}`}></span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rootcontents.map((item, index) => (
            <tr key={index}>
              <td>
                <CorrectLink item={item} currentPath={pathname} />
              </td>
              <td>{item.type == "directory" ? "" : formatIntegerWithSpaces(item.size)}</td>
              <td>{convertDateFormat(item.modified)}</td>
              <td>{convertDateFormat(item.created)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <footer className={styles["footer-toolbar"]}>
        <span>
          {currentlySelected ? 1 : 0} / {rootcontents.length} object(s) selected
        </span>
        <span>{currentlySelected ? grabBytesDataFromDOM(currentlySelected) : ""}</span>
        <span>{currentlySelected ? grabBytesDataFromDOM(currentlySelected) : ""}</span>
        <span>{currentlySelected ? grabModifiedDateFromDOM(currentlySelected) : ""}</span>
      </footer>
    </>
  );
}
