"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import { usePathname } from "next/navigation";
import { ItemData, convertDateFormat, formatIntegerWithSpaces, getDirectoryContents } from "@/internals/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/Loader";

interface Column {
  header: HTMLTableCellElement;
  size: string;
}

interface ColumnSizeData {
  header: string;
  size: string;
  type: "numeric" | "text-short" | "text-long";
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
  return td.textContent || "\u2800";
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
  const isIndex = currentPath == "/";
  const router = useRouter();
  // a TODO that would be nice if completed:
  // the onTouchStart's used to be onClick's but that wouldn't be reliable for things like tablets
  // but now scrolling is annoying on mobile
  // you can't use onClick because it needs to be on double click
  // so onTouchStart has to work but also allow scrolling

  if (item.type === "directory") {
    return (
      <>
        <button
          onDoubleClick={() => router.push((isIndex ? "" : currentPath) + `/${item.name}`)}
          onTouchStart={() => {
            // allow on click only on devices with a width of 800px or less
            // if (window.innerWidth > 800) return;
            router.push((isIndex ? "" : currentPath) + `/${item.name}`);
          }}
          onKeyUp={(e) => {
            // if key is enter or numpad enter
            if (e.key === "Enter" || e.key === "NumpadEnter") {
              router.push((isIndex ? "" : currentPath) + `/${item.name}`);
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
          onTouchStart={() => {
            // allow on click only on devices with a width of 800px or less
            // if (window.innerWidth > 800) return;
            window.open(item.url);
          }}
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
          onTouchStart={() => {
            // allow on click only on devices with a width of 800px or less
            // if (window.innerWidth > 800) return;
            window.open(`/images/_filespace${currentPath}/${item.name}.${item.type}`);
          }}
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

function getColumnSizesFromLocalStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem("columns") || "[]");
  } catch (error) {
    console.error("couldnt parse localstorage", error);
    return [];
  }
}

export default function FileExplorer() {
  const [currentlySelected, setCurrentlySelected] = useState<HTMLButtonElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // https://adamlynch.com/flexible-data-tables-with-css-grid/
    const table = document.querySelector("table");
    if (!table) return;

    let localColumnData = getColumnSizesFromLocalStorage();

    const columns: Column[] = [];
    let headerBeingResized: HTMLElement | null;

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      if (e instanceof TouchEvent) {
        e.preventDefault();
      }

      requestAnimationFrame(() => {
        console.log("onMouseMove");

        if (!headerBeingResized) return;

        const horizontalScrollOffset = document.documentElement.scrollLeft;

        let clientX;
        if (e instanceof MouseEvent) {
          clientX = e.clientX;
        } else {
          clientX = e.touches[0].clientX;
        }

        const width = horizontalScrollOffset + clientX - headerBeingResized!.offsetLeft;

        const column = columns.find(({ header }) => header === headerBeingResized);
        if (column) {
          column.size = Math.max(min, width) + "px";
        }

        try {
          // save columns data to localstorage, but only the size property
          localStorage.setItem("columns", JSON.stringify(columns.map(({ size }) => size)));
          console.log(
            "saved to localstorage",
            columns.map(({ size }) => size)
          );
        } catch (error) {
          console.error("couldnt save to localstorage", error);
        }

        const CONSTRUCTED_STYLE_STRING = columns.map(({ size }) => size).join(" ");
        console.log("CONSTRUCTED_STYLE_STRING", CONSTRUCTED_STYLE_STRING);
        table.style.gridTemplateColumns = CONSTRUCTED_STYLE_STRING;
      });
    };

    const onMouseUp = () => {
      console.log("onMouseUp");

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      // DEV TOUCH EVENTS
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);

      if (headerBeingResized) {
        headerBeingResized.classList.remove("header--being-resized");
      }
      headerBeingResized = null;
    };

    const initResize = ({ target }: MouseEvent | TouchEvent) => {
      console.log("initResize");

      headerBeingResized = (target as HTMLSpanElement).parentNode as HTMLElement;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      // DEV TOUCH EVENTS
      window.addEventListener("touchmove", onMouseMove);
      window.addEventListener("touchend", onMouseUp);

      if (headerBeingResized) {
        headerBeingResized.classList.add("header--being-resized");
      }
    };

    // GRAB COLUMNS FROM DOM
    document.querySelectorAll("th").forEach((header, index) => {
      console.log("==========header", header, index);
      const max = columnTypeToRatioMap[header.dataset.type as string] + "fr";
      columns.push({
        header,
        size: localColumnData[index] || `minmax(${min}px, ${max})`,
      });
      console.log("==========columns", columns);
      table.style.gridTemplateColumns = columns.map(({ size }) => size).join(" ");
      setIsLoading(false);

      const resizeHandle = header.querySelector(".resize-handle") as HTMLElement;
      resizeHandle.addEventListener("mousedown", initResize);

      // DEV TOUCH EVENTS
      resizeHandle.addEventListener("touchstart", initResize);
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

    // Clean up event listeners in the return function
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      // DEV TOUCH EVENTS
      window.removeEventListener("touchmove", onMouseMove);
      window.removeEventListener("touchend", onMouseUp);

      columns.forEach(({ header }) => {
        const resizeHandle = header.querySelector(".resize-handle") as HTMLElement;
        resizeHandle.removeEventListener("mousedown", initResize);

        // DEV TOUCH EVENTS
        resizeHandle.removeEventListener("touchstart", initResize);
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

  console.log("IS LOADING: ", isLoading);

  return (
    <>
      {isLoading && <Loader />}
      <table
        className={`${styles.table} table`}
        style={{
          ...(isLoading && { display: "none" }),
        }}
      >
        <thead>
          <tr>
            <th data-type="text-long">
              Name <span className={`resize-handle ${styles["resize-handle"]}`}></span>
            </th>
            <th data-type="numeric">
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
        <span>{currentlySelected ? grabBytesDataFromDOM(currentlySelected) : "\t"}</span>
        <span>{currentlySelected ? grabBytesDataFromDOM(currentlySelected) : "\t"}</span>
        <span>{currentlySelected ? grabModifiedDateFromDOM(currentlySelected) : ""}</span>
      </footer>
    </>
  );
}
