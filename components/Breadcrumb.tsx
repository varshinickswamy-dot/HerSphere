import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import styles from "./Breadcrumb.module.css";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
   10	  }
   11	>(({ className, ...props }, ref) => (
   12	  <nav
   13	    ref={ref}
   14	    aria-label="breadcrumb"
   15	    className={`${styles.nav} ${className || ""}`}
   16	    {...props}
   17	  />
   18	));
   19	Breadcrumb.displayName = "Breadcrumb";
   20	
   21	const BreadcrumbList = React.forwardRef<
   22	  HTMLOListElement,
   23	  React.ComponentPropsWithoutRef<"ol">
   24	>(({ className, ...props }, ref) => (
   25	  <ol ref={ref} className={`${styles.list} ${className || ""}`} {...props} />
   26	));
   27	BreadcrumbList.displayName = "BreadcrumbList";
   28	
   29	const BreadcrumbItem = React.forwardRef<
   30	  HTMLLIElement,
   31	  React.ComponentPropsWithoutRef<"li">
   32	>(({ className, ...props }, ref) => (
   33	  <li ref={ref} className={`${styles.item} ${className || ""}`} {...props} />
   34	));
   35	BreadcrumbItem.displayName = "BreadcrumbItem";
   36	
   37	const BreadcrumbLink = React.forwardRef<
   38	  HTMLAnchorElement,
   39	  React.ComponentPropsWithoutRef<"a"> & {
   40	    asChild?: boolean;
   41	  }
   42	>(({ asChild, className, ...props }, ref) => {
   43	  const Comp = asChild ? Slot : "a";
   44	
   45	  return (
   46	    <Comp
   47	      ref={ref}
   48	      className={`${styles.link} ${className || ""}`}
   49	      {...props}
   50	    />
   51	  );
   52	});
   53	BreadcrumbLink.displayName = "BreadcrumbLink";
   54	
   55	const BreadcrumbPage = React.forwardRef<
   56	  HTMLSpanElement,
   57	  React.ComponentPropsWithoutRef<"span">
   58	>(({ className, ...props }, ref) => (
   59	  <span
   60	    ref={ref}
   61	    role="link"
   62	    aria-disabled="true"
   63	    aria-current="page"
   64	    className={`${styles.page} ${className || ""}`}
   65	    {...props}
   66	  />
   67	));
   68	BreadcrumbPage.displayName = "BreadcrumbPage";
   69	
   70	const BreadcrumbSeparator = ({
   71	  className,
   72	  ...props
   73	}: React.ComponentProps<"li">) => (
   74	  <li
   75	    role="presentation"
   76	    aria-hidden="true"
   77	    className={`${styles.separator} ${className || ""}`}
   78	    {...props}
   79	  >
   80	    <ChevronRight size={14} />
   81	  </li>
   82	);
   83	BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
   84	
   85	const BreadcrumbEllipsis = ({
   86	  className,
   87	  ...props
   88	}: React.ComponentProps<"span">) => (
   89	  <span
   90	    role="presentation"
   91	    aria-hidden="true"
   92	    className={`${styles.ellipsis} ${className || ""}`}
   93	    {...props}
   94	  >
   95	    <MoreHorizontal size={14} />
   96	  </span>
   97	);
   98	BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
   99	
  100	export {
  101	  Breadcrumb,
  102	  BreadcrumbList,
  103	  BreadcrumbItem,
  104	  BreadcrumbLink,
  105	  BreadcrumbPage,
  106	  BreadcrumbSeparator,
  107	  BreadcrumbEllipsis,
  108	};
  109