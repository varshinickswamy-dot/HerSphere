import { Example } from "@floot/examples";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./Carousel";

   10	const PlaceholderImage = ({
   11	  index,
   12	  alt,
   13	  height = "100%",
   14	}: {
   15	  index: number;
   16	  alt: string;
   17	  height?: string;
   18	}) => {
   19	  // Extract numeric height for the image URL; default to 400 if parsing fails.
   20	  const numericHeight = parseInt(height, 10) || 400;
   21	  return (
   22	    <img
   23	      src={`https://picsum.photos/800/${numericHeight}?random=${index}`}
   24	      alt={alt}
   25	      style={{
   26	        width: "100%",
   27	        height: height,
   28	        objectFit: "cover",
   29	      }}
   30	    />
   31	  );
   32	};
   33	
   34	export default function CarouselShowcase() {
   35	  return (
   36	    <>
   37	      <h1>Carousel</h1>
   38	      <p>
   39	        A slide-by-slide scroller built on Embla. It scrolls horizontally or
   40	        vertically, keeps its own previous and next buttons in sync with what
   41	        can still be scrolled, and responds to the arrow keys.
   42	      </p>
   43	
   44	      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
   45	        <Example
   46	          width={640}
   47	          title="Horizontal"
   48	          description="One slide at a time, the default orientation."
   49	        >
   50	          <div style={{ height: "200px" }}>
   51	            <Carousel>
   52	              <CarouselContent>
   53	                <CarouselItem>
   54	                  <PlaceholderImage
   55	                    index={1}
   56	                    alt="Random landscape 1"
   57	                    height="300px"
   58	                  />
   59	                </CarouselItem>
   60	                <CarouselItem>
   61	                  <PlaceholderImage
   62	                    index={2}
   63	                    alt="Random landscape 2"
   64	                    height="400px"
   65	                  />
   66	                </CarouselItem>
   67	                <CarouselItem>
   68	                  <PlaceholderImage
   69	                    index={3}
   70	                    alt="Random landscape 3"
   71	                    height="500px"
   72	                  />
   73	                </CarouselItem>
   74	              </CarouselContent>
   75	              <CarouselPrevious />
   76	              <CarouselNext />
   77	            </Carousel>
   78	          </div>
   79	        </Example>
   80	
   81	        <Example
   82	          width={640}
   83	          title="Vertical"
   84	          description="Slides stack down the page and the buttons become up and down chevrons."
   85	        >
   86	          <Carousel orientation="vertical">
   87	            <CarouselContent style={{ height: "400px" }}>
   88	              <CarouselItem>
   89	                <PlaceholderImage index={4} alt="Random landscape 4" />
   90	              </CarouselItem>
   91	              <CarouselItem>
   92	                <PlaceholderImage index={5} alt="Random landscape 5" />
   93	              </CarouselItem>
   94	              <CarouselItem>
   95	                <PlaceholderImage index={6} alt="Random landscape 6" />
   96	              </CarouselItem>
   97	            </CarouselContent>
   98	            <CarouselPrevious />
   99	            <CarouselNext />
  100	          </Carousel>
  101	        </Example>
  102	
  103	        <Example
  104	          width={640}
  105	          title="Three visible items"
  106	          description="Each item's flex basis decides how many slides fit in the viewport."
  107	        >
  108	          <Carousel opts={{ loop: false }}>
  109	            <CarouselContent style={{ gap: "var(--spacing-xs)" }}>
  110	              {[1, 2, 3, 4, 5, 6].map((index) => {
  111	                // Use different heights for the multi example.
  112	                const heights = ["150px", "200px", "250px"];
  113	                const height = heights[(index - 1) % heights.length];
  114	                return (
  115	                  <CarouselItem
  116	                    key={index}
  117	                    // Adjust flex basis to display 3 items at once.
  118	                    style={{
  119	                      flex: "0 0 calc((100% - 0.75rem) / 3)",
  120	                      paddingRight: 0,
  121	                    }}
  122	                  >
  123	                    <PlaceholderImage
  124	                      index={index}
  125	                      alt={`Random landscape ${index}`}
  126	                      height={height}
  127	                    />
  128	                  </CarouselItem>
  129	                );
  130	              })}
  131	            </CarouselContent>
  132	            <CarouselPrevious />
  133	            <CarouselNext />
  134	          </Carousel>
  135	        </Example>
  136	      </div>
  137	    </>
  138	  );
  139	}
  140