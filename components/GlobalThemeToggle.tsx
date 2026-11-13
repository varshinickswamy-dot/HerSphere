import { ThemeModeSwitch } from "./ThemeModeSwitch";
import styles from "./GlobalThemeToggle.module.css";

/** Always-available theme control, including compact mobile layouts. */
export function GlobalThemeToggle() {
  return (
    <div className={styles.floating} aria-label="Appearance">
      <span>Theme</span>
      <ThemeModeSwitch />
    </div>
  );
}
