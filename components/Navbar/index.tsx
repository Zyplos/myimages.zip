import styles from "./Navbar.module.scss";
import Image from "next/image";

export default function Navbar() {
  return (
    <div className={styles["navbar-wrapper"]}>
      <div className={styles.toolbar}>
        <button>File</button>
        <button>Edit</button>
        <button>View</button>
        <button>Favorites</button>
        <button>Tools</button>
        <button>Help</button>
      </div>
      <div className={styles["icon-toolbar-wrapper"]}>
        <div className={styles["divider"]}>
          <div></div>
          <div></div>
        </div>
        <div className={styles["icon-toolbar"]}>
          <button>
            <Image src="/images/icons/add-icon.svg" width="48" height="48" alt="Test Icon" />
            <span>Add</span>
          </button>
          <button>
            <Image src="/images/icons/extract-icon.svg" width="48" height="48" alt="Test Icon" />
            <span>Extract</span>
          </button>
          <button>
            <Image src="/images/icons/test-icon.svg" width="48" height="48" alt="Test Icon" />
            <span>Test</span>
          </button>
          <button>
            <Image src="/images/icons/copy-icon.svg" width="48" height="48" alt="Test Icon" />
            <span>Copy</span>
          </button>
          <button>
            <Image src="/images/icons/move-icon.svg" width="48" height="48" alt="Test Icon" />
            <span>Move</span>
          </button>
          <button>
            <Image src="/images/icons/delete-icon.svg" width="48" height="48" alt="Test Icon" />
            <span>Delete</span>
          </button>
          <button>
            <Image src="/images/icons/info-icon.svg" width="48" height="48" alt="Test Icon" />
            <span>Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}
