import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
   10	  FormDescription,
   11	  useForm,
   12	} from "./Form";
   13	import { Input } from "./Input";
   14	import { Button } from "./Button";
   15	import { Spinner } from "./Spinner";
   16	import styles from "./PasswordRegisterForm.module.css";
   17	import { useAuth } from "../helpers/useAuth";
   18	import {
   19	  schema,
   20	  postRegister,
   21	} from "../endpoints/auth/register_with_password_POST.schema";
   22	
   23	export type RegisterFormData = z.infer<typeof schema>;
   24	
   25	interface PasswordRegisterFormProps {
   26	  className?: string;
   27	  defaultValues?: Partial<RegisterFormData>;
   28	}
   29	
   30	export const PasswordRegisterForm: React.FC<PasswordRegisterFormProps> = ({
   31	  className,
   32	  defaultValues,
   33	}) => {
   34	  const [isLoading, setIsLoading] = useState(false);
   35	  const [error, setError] = useState<string | null>(null);
   36	  const { onLogin } = useAuth();
   37	  const navigate = useNavigate();
   38	
   39	  const form = useForm({
   40	    schema,
   41	    defaultValues: defaultValues || {
   42	      email: "",
   43	      password: "",
   44	      displayName: "",
   45	    },
   46	  });
   47	
   48	  const handleSubmit = async (data: z.infer<typeof schema>) => {
   49	    setError(null);
   50	    setIsLoading(true);
   51	
   52	    try {
   53	      const result = await postRegister(data);
   54	      // Avoid writing email addresses or other personal data to browser logs.
   55	      onLogin(result.user);
   56	      navigate("/profile");
   57	    } catch (err) {
   58	      // Keep registration errors out of logs; they may include user-provided details.
   59	
   60	      if (err instanceof Error) {
   61	        const errorMessage = err.message;
   62	
   63	        if (errorMessage.includes("Email already in use")) {
   64	          setError(
   65	            "This email is already registered. Please try logging in instead."
   66	          );
   67	        } else if (errorMessage.toLowerCase().includes("display name")) {
   68	          setError("Please provide a valid display name that isn't empty.");
   69	        } else if (
   70	          errorMessage.includes("display") ||
   71	          errorMessage.includes("name")
   72	        ) {
   73	          setError("Please check your display name: " + errorMessage);
   74	        } else {
   75	          setError(errorMessage || "Registration failed. Please try again.");
   76	        }
   77	      } else {
   78	        // Avoid logging submitted registration data.
   79	        setError("Registration failed. Please try again.");
   80	      }
   81	    } finally {
   82	      setIsLoading(false);
   83	    }
   84	  };
   85	
   86	  return (
   87	    <Form {...form}>
   88	      {error && <div className={styles.errorMessage}>{error}</div>}
   89	      <form
   90	        onSubmit={form.handleSubmit((data) =>
   91	          handleSubmit(data as z.infer<typeof schema>)
   92	        )}
   93	        className={`${styles.form} ${className || ""}`}
   94	      >
   95	        <FormItem name="email">
   96	          <FormLabel>Email</FormLabel>
   97	          <FormControl>
   98	            <Input
   99	              placeholder="your@email.com"
  100	              value={form.values.email || ""}
  101	              onChange={(e) =>
  102	                form.setValues((prev: any) => ({
  103	                  ...prev,
  104	                  email: e.target.value,
  105	                }))
  106	              }
  107	            />
  108	          </FormControl>
  109	          <FormMessage />
  110	        </FormItem>
  111	
  112	        <FormItem name="displayName">
  113	          <FormLabel>Display Name</FormLabel>
  114	          <FormControl>
  115	            <Input
  116	              id="register-display-name"
  117	              placeholder="Your Name"
  118	              value={form.values.displayName || ""}
  119	              onChange={(e) =>
  120	                form.setValues((prev: any) => ({
  121	                  ...prev,
  122	                  displayName: e.target.value,
  123	                }))
  124	              }
  125	            />
  126	          </FormControl>
  127	          <FormDescription>
  128	            Spaces, emojis, and special characters are all allowed
  129	          </FormDescription>
  130	          <FormMessage />
  131	        </FormItem>
  132	
  133	        <FormItem name="password">
  134	          <FormLabel>Password</FormLabel>
  135	          <FormControl>
  136	            <Input
  137	              type="password"
  138	              placeholder="••••••••"
  139	              value={form.values.password || ""}
  140	              onChange={(e) =>
  141	                form.setValues((prev: any) => ({
  142	                  ...prev,
  143	                  password: e.target.value,
  144	                }))
  145	              }
  146	            />
  147	          </FormControl>
  148	          <FormDescription>
  149	            At least 8 characters with uppercase, lowercase, and number
  150	          </FormDescription>
  151	          <FormMessage />
  152	        </FormItem>
  153	
  154	        <Button
  155	          type="submit"
  156	          disabled={isLoading}
  157	          className={styles.submitButton}
  158	        >
  159	          {isLoading ? (
  160	            <>
  161	              <Spinner size="sm" /> Creating Account...
  162	            </>
  163	          ) : (
  164	            "Create Account"
  165	          )}
  166	        </Button>
  167	      </form>
  168	    </Form>
  169	  );
  170	};
  171