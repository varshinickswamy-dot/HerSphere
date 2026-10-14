import styles from "./Badge.module.css";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "primary"
    | "destructive"
    | "outline"
    | "secondary"
    | "success"