import React, { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
   10	  useForm,
   11	} from "./Form";
   12	import { Input } from "./Input";
   13	import { Button } from "./Button";
   14	import { Spinner } from "./Spinner";
   15	import styles from "./PasswordLoginForm.module.css";
   16	import {
   17	  schema,
   18	  postLogin,
   19	} from "../endpoints/auth/login_with_password_POST.schema";
   20	import { useAuth } from "../helpers/useAuth";
   21	
   22	export type LoginFormData = z.infer<typeof schema>;
   23	
   24	interface PasswordLoginFormProps {
   25	  className?: string;
   26	}
   27	
   28	export const PasswordLoginForm: React.FC<PasswordLoginFormProps> = ({
   29	  className,
   30	}) => {
   31	  const [isLoading, setIsLoading] = useState(false);
   32	  const [error, setError] = useState<string | null>(null);
   33	  const { onLogin } = useAuth();
   34	  const navigate = useNavigate();
   35	
   36	  const form = useForm({
   37	    defaultValues: {
   38	      email: "",
   39	      password: "",
   40	    },
   41	    schema,
   42	  });
   43	
   44	  const handleSubmit = async (data: LoginFormData) => {
   45	    setError(null);
   46	    setIsLoading(true);
   47	
   48	    try {
   49	      const result = await postLogin(data);
   50	      onLogin(result.user);
   51	      setTimeout(() => navigate("/dashboard"), 200);
   52	    } catch (err) {
   53	      // Do not log login details or user-linked authentication errors.
   54	      setError(
   55	        err instanceof Error ? err.message : "Login failed. Please try again."
   56	      );
   57	    } finally {
   58	      setIsLoading(false);
   59	    }
   60	  };
   61	
   62	  return (
   63	    <Form {...form}>
   64	      <form
   65	        onSubmit={form.handleSubmit(handleSubmit)}
   66	        className={`${styles.form} ${className || ""}`}
   67	      >
   68	        {error && <div className={styles.errorMessage}>{error}</div>}
   69	
   70	        <FormItem name="email">
   71	          <FormLabel>Email</FormLabel>
   72	          <FormControl>
   73	            <Input
   74	              placeholder="your@email.com"
   75	              type="email"
   76	              autoComplete="email"
   77	              disabled={isLoading}
   78	              value={form.values.email}
   79	              onChange={(e) =>
   80	                form.setValues((prev) => ({ ...prev, email: e.target.value }))
   81	              }
   82	            />
   83	          </FormControl>
   84	          <FormMessage />
   85	        </FormItem>
   86	
   87	        <FormItem name="password">
   88	          <FormLabel>Password</FormLabel>
   89	          <FormControl>
   90	            <Input
   91	              type="password"
   92	              placeholder="••••••••"
   93	              autoComplete="current-password"
   94	              disabled={isLoading}
   95	              value={form.values.password}
   96	              onChange={(e) =>
   97	                form.setValues((prev) => ({
   98	                  ...prev,
   99	                  password: e.target.value,
  100	                }))
  101	              }
  102	            />
  103	          </FormControl>
  104	          <FormMessage />
  105	        </FormItem>
  106	
  107	        <Button
  108	          type="submit"
  109	          disabled={isLoading}
  110	          className={styles.submitButton}
  111	        >
  112	          {isLoading ? (
  113	            <span className={styles.loadingText}>
  114	              <Spinner className={styles.spinner} size="sm" />
  115	              Logging in...
  116	            </span>
  117	          ) : (
  118	            "Log In"
  119	          )}
  120	        </Button>
  121	      </form>
  122	    </Form>
  123	  );
  124	};
  125