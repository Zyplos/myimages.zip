import FINAL_DATA from "./FINAL_DATA.json";

export interface ItemData {
  name: string;
  type: string;
  size: number;
  created: string;
  modified: string;
  contents?: ItemData[];
  url?: string;
}

export function getFileByPath(path: string): ItemData {
  const pathSegments = path.split("/");
  let currentData: ItemData = FINAL_DATA;

  for (const segment of pathSegments) {
    const item = currentData.contents?.find((item) => item.name === segment);
    if (!item) {
      throw new Error(`Item not found at path: ${path}`);
    }
    currentData = item;
  }

  return currentData;
}

export function getDirectoryContents(path: string): ItemData[] {
  const pathSegments = path.split("/");
  let currentData: ItemData = FINAL_DATA;

  if (!path) {
    return currentData.contents!;
  }

  for (const segment of pathSegments) {
    const item = currentData.contents?.find((item) => item.name === segment);
    if (!item) {
      throw new Error(`This is not a directory: ${path}`);
    }
    currentData = item;
  }

  return currentData.contents!;
}

// turns 2023-05-25T10:07:12.565Z into 2023-05-25 10:07
export function convertDateFormat(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// puts a space every 3 digits starting from the right
export function formatIntegerWithSpaces(num: number): string {
  const numString = num.toString();
  const parts = [];

  for (let i = numString.length; i > 0; i -= 3) {
    parts.unshift(numString.slice(Math.max(0, i - 3), i));
  }

  return parts.join(" ");
}
