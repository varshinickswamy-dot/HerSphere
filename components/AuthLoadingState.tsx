import React from "react";
import { Skeleton } from "./Skeleton";
import { Lock } from "lucide-react";
import styles from "./AuthLoadingState.module.css";

interface AuthLoadingStateProps {
  title?: string;
  className?: string;
}
   10	
   11	export const AuthLoadingState: React.FC<AuthLoadingStateProps> = ({
   12	  title = "Authenticating...",
   13	  className,
   14	}) => {
   15	  return (
   16	    <div className={`${styles.container} ${className || ""}`}>
   17	      <div className={styles.content}>
   18	        <div className={styles.skeletonGrid}>
   19	          {/* Top row */}
   20	          <div className={styles.skeletonRow}>
   21	            <Skeleton className={styles.skeletonBar} style={{ width: "90%" }} />
   22	            <Skeleton className={styles.skeletonBar} style={{ width: "75%" }} />
   23	            <Skeleton className={styles.skeletonBar} style={{ width: "85%" }} />
   24	          </div>
   25	
   26	          {/* Middle row with title surrounded by skeletons */}
   27	          <div className={styles.titleRow}>
   28	            <div className={styles.leftSkeletons}>
   29	              <Skeleton
   30	                className={styles.skeletonBar}
   31	                style={{ width: "100%" }}
   32	              />
   33	              <Skeleton
   34	                className={styles.skeletonBar}
   35	                style={{ width: "80%" }}
   36	              />
   37	              <Skeleton
   38	                className={styles.skeletonBar}
   39	                style={{ width: "90%" }}
   40	              />
   41	            </div>
   42	
   43	            <h3 className={styles.title}>
   44	              <Lock className={styles.lockIcon} />
   45	              <span>{title}</span>
   46	            </h3>
   47	
   48	            <div className={styles.rightSkeletons}>
   49	              <Skeleton
   50	                className={styles.skeletonBar}
   51	                style={{ width: "90%" }}
   52	              />
   53	              <Skeleton
   54	                className={styles.skeletonBar}
   55	                style={{ width: "100%" }}
   56	              />
   57	              <Skeleton
   58	                className={styles.skeletonBar}
   59	                style={{ width: "75%" }}
   60	              />
   61	            </div>
   62	          </div>
   63	
   64	          {/* Bottom row */}
   65	          <div className={styles.skeletonRow}>
   66	            <Skeleton className={styles.skeletonBar} style={{ width: "80%" }} />
   67	            <Skeleton className={styles.skeletonBar} style={{ width: "95%" }} />
   68	            <Skeleton className={styles.skeletonBar} style={{ width: "70%" }} />
   69	          </div>
   70	        </div>
   71	      </div>
   72	    </div>
   73	  );
   74	};
   75