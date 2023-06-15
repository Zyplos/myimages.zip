import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#0078d7",
        color: "white",
        padding: "5rem",
        fontSize: "1.3rem",
      }}
    >
      <p style={{ fontSize: "5rem", marginBottom: "2rem" }}>:&#40;</p>
      <p>Could not find requested resource.</p>
      <p>
        <Link href="/" style={{ color: "white" }}>
          Retry opening myimages.zip
        </Link>
      </p>
    </div>
  );
}
