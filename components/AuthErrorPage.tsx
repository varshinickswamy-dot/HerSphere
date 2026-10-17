import React from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./AuthErrorPage.module.css";

export interface AuthErrorPageProps {
  /**
   * The title of the error message
   */
  title?: string;
   10	  /**
   11	   * The detailed error message
   12	   */
   13	  message: string;
   14	  /**
   15	   * Optional custom icon
   16	   */
   17	  icon?: React.ReactNode;
   18	  /**
   19	   * Optional additional class name
   20	   */
   21	  className?: string;
   22	}
   23	
   24	export const AuthErrorPage: React.FC<AuthErrorPageProps> = ({
   25	  title = "Authentication Error",
   26	  message,
   27	  icon,
   28	  className,
   29	}) => {
   30	  return (
   31	    <div className={`${styles.container} ${className || ""}`}>
   32	      <div className={styles.card}>
   33	        <div className={styles.iconContainer}>
   34	          {icon || <AlertTriangle className={styles.icon} size={64} />}
   35	        </div>
   36	
   37	        <h1 className={styles.title}>{title}</h1>
   38	
   39	        <p className={styles.message}>{message}</p>
   40	      </div>
   41	    </div>
   42	  );
   43	};
   44