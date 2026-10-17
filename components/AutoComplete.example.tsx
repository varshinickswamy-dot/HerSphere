import { useState } from "react";
import { Mail, Package, User } from "lucide-react";
import { Example } from "@floot/examples";
import { AutoComplete, type Option } from "./AutoComplete";

const colors: Option[] = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
   10	  { value: "yellow", label: "Yellow" },
   11	];
   12	
   13	type Product = {
   14	  id: string;
   15	  name: string;
   16	  category: string;
   17	  price: number;
   18	};
   19	
   20	const products: Product[] = [
   21	  {
   22	    id: "1",
   23	    name: "Mechanical Keyboard",
   24	    category: "Electronics",
   25	    price: 149.99,
   26	  },
   27	  { id: "2", name: "Ergonomic Mouse", category: "Electronics", price: 79.99 },
   28	  { id: "3", name: '27" Monitor', category: "Electronics", price: 299.99 },
   29	  { id: "4", name: "Laptop Stand", category: "Accessories", price: 49.99 },
   30	];
   31	
   32	type Person = {
   33	  id: string;
   34	  name: string;
   35	  email: string;
   36	  role: string;
   37	};
   38	
   39	const users: Person[] = [
   40	  {
   41	    id: "1",
   42	    name: "Sarah Wilson",
   43	    email: "sarah@example.com",
   44	    role: "Designer",
   45	  },
   46	  { id: "2", name: "Mike Chen", email: "mike@example.com", role: "Developer" },
   47	  { id: "3", name: "Emma Davis", email: "emma@example.com", role: "Manager" },
   48	  { id: "4", name: "James Lee", email: "james@example.com", role: "Developer" },
   49	];
   50	
   51	function StrictColorAutoComplete() {
   52	  const [selected, setSelected] = useState<Option>();
   53	  const [inputValue, setInputValue] = useState("");
   54	
   55	  return (
   56	    <div style={{ minHeight: 240 }}>
   57	      <AutoComplete
   58	        options={colors}
   59	        value={selected}
   60	        onValueChange={setSelected}
   61	        inputValue={inputValue}
   62	        onInputValueChange={setInputValue}
   63	        placeholder="Select a color..."
   64	        emptyMessage="No colors found"
   65	        allowFreeForm={false}
   66	      />
   67	      <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
   68	        Input value: "{inputValue}"
   69	      </div>
   70	    </div>
   71	  );
   72	}
   73	
   74	function FreeFormColorAutoComplete() {
   75	  const [selected, setSelected] = useState<Option>();
   76	  const [inputValue, setInputValue] = useState("");
   77	
   78	  return (
   79	    <div style={{ minHeight: 240 }}>
   80	      <AutoComplete
   81	        options={colors}
   82	        value={selected}
   83	        onValueChange={setSelected}
   84	        inputValue={inputValue}
   85	        onInputValueChange={setInputValue}
   86	        placeholder="Type any color..."
   87	        emptyMessage="No colors found"
   88	        allowFreeForm={true}
   89	      />
   90	      <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
   91	        Input value: "{inputValue}"
   92	      </div>
   93	    </div>
   94	  );
   95	}
   96	
   97	function UserAutoComplete() {
   98	  const [selected, setSelected] = useState<Option<Person>>();
   99	  const [inputValue, setInputValue] = useState("");
  100	
  101	  const userOptions: Option<Person>[] = users.map((user) => ({
  102	    value: user.id,
  103	    label: (
  104	      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
  105	        <User size={16} />
  106	        <div>
  107	          <div style={{ fontWeight: 500 }}>{user.name}</div>
  108	          <div
  109	            style={{
  110	              fontSize: "0.75rem",
  111	              color: "var(--muted-foreground)",
  112	              display: "flex",
  113	              alignItems: "center",
  114	              gap: "0.25rem",
  115	            }}
  116	          >
  117	            <Mail size={12} />
  118	            {user.email} • {user.role}
  119	          </div>
  120	        </div>
  121	      </div>
  122	    ),
  123	    displayText: user.name,
  124	    metadata: user,
  125	  }));
  126	
  127	  return (
  128	    <div style={{ minHeight: 300 }}>
  129	      <AutoComplete
  130	        options={userOptions}
  131	        value={selected}
  132	        onValueChange={setSelected}
  133	        inputValue={inputValue}
  134	        onInputValueChange={setInputValue}
  135	        placeholder="Search users or enter a name..."
  136	        emptyMessage="No users found"
  137	        allowFreeForm={true}
  138	      />
  139	      <div style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
  140	        <div>Current input: {inputValue}</div>
  141	        {selected?.metadata && (
  142	          <div style={{ marginTop: "0.5rem" }}>
  143	            Selected user: {selected.metadata.name} ({selected.metadata.role})
  144	          </div>
  145	        )}
  146	      </div>
  147	    </div>
  148	  );
  149	}
  150	
  151	function ProductAutoComplete() {
  152	  const [selected, setSelected] = useState<Option<Product>>();
  153	  const [inputValue, setInputValue] = useState("");
  154	
  155	  const productOptions: Option<Product>[] = products.map((product) => ({
  156	    value: product.id,
  157	    label: (
  158	      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
  159	        <Package size={16} />
  160	        <div>
  161	          <div style={{ fontWeight: 500 }}>{product.name}</div>
  162	          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
  163	            {product.category} • ${product.price}
  164	          </div>
  165	        </div>
  166	      </div>
  167	    ),
  168	    displayText: product.name,
  169	    metadata: product,
  170	  }));
  171	
  172	  return (
  173	    <div style={{ minHeight: 300 }}>
  174	      <AutoComplete
  175	        options={productOptions}
  176	        value={selected}
  177	        onValueChange={setSelected}
  178	        inputValue={inputValue}
  179	        onInputValueChange={setInputValue}
  180	        placeholder="Search products or enter item..."
  181	        emptyMessage="No products found"
  182	        allowFreeForm={true}
  183	      />
  184	      <div style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
  185	        <div>Current input: {inputValue}</div>
  186	        {selected?.metadata && (
  187	          <div style={{ marginTop: "0.5rem" }}>
  188	            Selected product: {selected.metadata.name} ($
  189	            {selected.metadata.price})
  190	          </div>
  191	        )}
  192	      </div>
  193	    </div>
  194	  );
  195	}
  196	
  197	export default function AutoCompleteShowcase() {
  198	  return (
  199	    <>
  200	      <h1>AutoComplete</h1>
  201	      <p>
  202	        A text input that suggests matching options as you type. Options can be
  203	        plain text or rich rows, and typing can be restricted to the listed
  204	        options or left free-form.
  205	      </p>
  206	
  207	      <h2>Input modes</h2>
  208	      <div
  209	        style={{
  210	          display: "flex",
  211	          flexWrap: "wrap",
  212	          gap: "1rem",
  213	          alignItems: "flex-start",
  214	        }}
  215	      >
  216	        <Example
  217	          title="Strict selection"
  218	          description="allowFreeForm={false} — only listed options are accepted."
  219	          width={320}
  220	        >
  221	          <StrictColorAutoComplete />
  222	        </Example>
  223	
  224	        <Example
  225	          title="Free-form"
  226	          description="allowFreeForm={true} — any typed text is kept."
  227	          width={320}
  228	        >
  229	          <FreeFormColorAutoComplete />
  230	        </Example>
  231	      </div>
  232	
  233	      <h2>Rich options</h2>
  234	      <div
  235	        style={{
  236	          display: "flex",
  237	          flexWrap: "wrap",
  238	          gap: "1rem",
  239	          alignItems: "flex-start",
  240	        }}
  241	      >
  242	        <Example title="User search" width={400}>
  243	          <UserAutoComplete />
  244	        </Example>
  245	
  246	        <Example title="Product search" width={400}>
  247	          <ProductAutoComplete />
  248	        </Example>
  249	      </div>
  250	    </>
  251	  );
  252	}
  253