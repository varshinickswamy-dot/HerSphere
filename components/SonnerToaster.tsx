"use client";

import { Toaster as Sonner } from "sonner";
import styles from "./SonnerToaster.module.css";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * This is already included in the global context providers so should not be rendered again.
   10	 */
   11	export const SonnerToaster = ({ className, ...props }: ToasterProps) => {
   12	  return (
   13	    <Sonner
   14	      className={`${styles.toaster} ${className ?? ""}`}
   15	      toastOptions={{
   16	        unstyled: true,
   17	        classNames: {
   18	          toast: styles.toast,
   19	          content: styles.content,
   20	          title: styles.title,
   21	          actionButton: styles.actionButton,
   22	          cancelButton: styles.cancelButton,
   23	          closeButton: styles.closeButton,
   24	          description: styles.description,
   25	          icon: styles.icon,
   26	        },
   27	      }}
   28	      {...props}
   29	    />
   30	  );
   31	};
   32