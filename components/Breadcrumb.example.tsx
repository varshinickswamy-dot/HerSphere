import { Example } from "@floot/examples";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
   10	} from "./Breadcrumb";
   11	
   12	export default function BreadcrumbShowcase() {
   13	  return (
   14	    <>
   15	      <h1>Breadcrumb</h1>
   16	      <p>
   17	        A trail of links showing where the current page sits in the site
   18	        hierarchy.
   19	      </p>
   20	
   21	      <h2>Examples</h2>
   22	      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
   23	        <Example title="Basic">
   24	          <Breadcrumb>
   25	            <BreadcrumbList>
   26	              <BreadcrumbItem>
   27	                <BreadcrumbLink href="/">Home</BreadcrumbLink>
   28	              </BreadcrumbItem>
   29	              <BreadcrumbSeparator />
   30	              <BreadcrumbItem>
   31	                <BreadcrumbPage>Current Page</BreadcrumbPage>
   32	              </BreadcrumbItem>
   33	            </BreadcrumbList>
   34	          </Breadcrumb>
   35	        </Example>
   36	
   37	        <Example title="Multi-level">
   38	          <Breadcrumb>
   39	            <BreadcrumbList>
   40	              <BreadcrumbItem>
   41	                <BreadcrumbLink href="/">Home</BreadcrumbLink>
   42	              </BreadcrumbItem>
   43	              <BreadcrumbSeparator />
   44	              <BreadcrumbItem>
   45	                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
   46	              </BreadcrumbItem>
   47	              <BreadcrumbSeparator />
   48	              <BreadcrumbItem>
   49	                <BreadcrumbLink href="/products/electronics">
   50	                  Electronics
   51	                </BreadcrumbLink>
   52	              </BreadcrumbItem>
   53	              <BreadcrumbSeparator />
   54	              <BreadcrumbItem>
   55	                <BreadcrumbPage>Smartphones</BreadcrumbPage>
   56	              </BreadcrumbItem>
   57	            </BreadcrumbList>
   58	          </Breadcrumb>
   59	        </Example>
   60	
   61	        <Example title="With ellipsis">
   62	          <Breadcrumb>
   63	            <BreadcrumbList>
   64	              <BreadcrumbItem>
   65	                <BreadcrumbLink href="/">Home</BreadcrumbLink>
   66	              </BreadcrumbItem>
   67	              <BreadcrumbSeparator />
   68	              <BreadcrumbItem>
   69	                <BreadcrumbEllipsis />
   70	              </BreadcrumbItem>
   71	              <BreadcrumbSeparator />
   72	              <BreadcrumbItem>
   73	                <BreadcrumbLink href="/products/electronics">
   74	                  Electronics
   75	                </BreadcrumbLink>
   76	              </BreadcrumbItem>
   77	              <BreadcrumbSeparator />
   78	              <BreadcrumbItem>
   79	                <BreadcrumbPage>Product Details</BreadcrumbPage>
   80	              </BreadcrumbItem>
   81	            </BreadcrumbList>
   82	          </Breadcrumb>
   83	        </Example>
   84	
   85	        <Example title="Single item">
   86	          <Breadcrumb>
   87	            <BreadcrumbList>
   88	              <BreadcrumbItem>
   89	                <BreadcrumbPage>Dashboard</BreadcrumbPage>
   90	              </BreadcrumbItem>
   91	            </BreadcrumbList>
   92	          </Breadcrumb>
   93	        </Example>
   94	      </div>
   95	    </>
   96	  );
   97	}
   98