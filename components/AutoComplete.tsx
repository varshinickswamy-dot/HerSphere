import { CommandGroup, CommandItem, CommandList } from "./Command";
import { Command as CommandPrimitive } from "cmdk";
import {
  useState,
  useRef,
  useCallback,
  type KeyboardEvent,
  type ReactNode,
} from "react";
   10	import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
   11	
   12	import { Skeleton } from "./Skeleton";
   13	import styles from "./AutoComplete.module.css";
   14	
   15	export type Option<T = unknown> = {
   16	  value: string;
   17	  label: ReactNode;
   18	  displayText?: string;
   19	  metadata?: T;
   20	};
   21	
   22	const getDisplayText = <T,>(option: Option<T>): string => {
   23	  if (option.displayText) {
   24	    return option.displayText;
   25	  }
   26	  if (typeof option.label === "string") {
   27	    return option.label;
   28	  }
   29	  return option.value;
   30	};
   31	
   32	type AutoCompleteProps<T = unknown> = {
   33	  options: Option<T>[];
   34	  emptyMessage: string;
   35	  value?: Option<T>;
   36	  onValueChange?: (value: Option<T>) => void;
   37	  inputValue: string;
   38	  onInputValueChange: (value: string) => void;
   39	  isLoading?: boolean;
   40	  disabled?: boolean;
   41	  placeholder?: string;
   42	  // when this is false, only values in the options will be accepted
   43	  allowFreeForm?: boolean;
   44	};
   45	
   46	export const AutoComplete = <T = unknown,>({
   47	  options,
   48	  placeholder,
   49	  emptyMessage,
   50	  value,
   51	  onValueChange,
   52	  inputValue,
   53	  onInputValueChange,
   54	  disabled,
   55	  isLoading = false,
   56	  allowFreeForm = false,
   57	}: AutoCompleteProps<T>) => {
   58	  const inputRef = useRef<HTMLInputElement>(null);
   59	
   60	  const [isOpen, setOpen] = useState(false);
   61	  const [selected, setSelected] = useState<Option<T> | undefined>(value);
   62	
   63	  const handleKeyDown = useCallback(
   64	    (event: KeyboardEvent<HTMLDivElement>) => {
   65	      const input = inputRef.current;
   66	      if (!input) {
   67	        return;
   68	      }
   69	
   70	      // This is not a default behaviour of the <input /> field
   71	      if (event.key === "Enter" && input.value !== "") {
   72	        const optionToSelect = options.find(
   73	          (option) => getDisplayText(option) === input.value,
   74	        );
   75	        if (optionToSelect) {
   76	          setSelected(optionToSelect);
   77	          onValueChange?.(optionToSelect);
   78	        }
   79	      }
   80	
   81	      if (event.key === "Escape") {
   82	        input.blur();
   83	        setOpen(false);
   84	      }
   85	    },
   86	    [options, onValueChange],
   87	  );
   88	
   89	  const handleBlur = useCallback(() => {
   90	    // Only reset the input value if the popover is closed and not in free-form mode
   91	    // This prevents interference with the selection process
   92	    if (!isOpen && !allowFreeForm) {
   93	      onInputValueChange(selected ? getDisplayText(selected) : "");
   94	    }
   95	  }, [selected, isOpen, onInputValueChange, allowFreeForm]);
   96	
   97	  const handleSelectOption = useCallback(
   98	    (selectedOption: Option<T>) => {
   99	      onInputValueChange(getDisplayText(selectedOption));
  100	
  101	      setSelected(selectedOption);
  102	      onValueChange?.(selectedOption);
  103	
  104	      // Close the popover after selection
  105	      setOpen(false);
  106	
  107	      // This is a hack to prevent the input from being focused after the user selects an option
  108	      // We can call this hack: "The next tick"
  109	      setTimeout(() => {
  110	        inputRef?.current?.blur();
  111	      }, 0);
  112	    },
  113	    [onValueChange, onInputValueChange],
  114	  );
  115	
  116	  return (
  117	    <Popover open={isOpen} onOpenChange={setOpen}>
  118	      <CommandPrimitive
  119	        onKeyDown={handleKeyDown}
  120	        className={styles.autoComplete}
  121	      >
  122	        <div className={styles.inputWrapper}>
  123	          <PopoverTrigger asChild>
  124	            <CommandPrimitive.Input
  125	              ref={inputRef}
  126	              value={inputValue}
  127	              onValueChange={isLoading ? undefined : onInputValueChange}
  128	              onBlur={handleBlur}
  129	              placeholder={placeholder}
  130	              disabled={disabled}
  131	              className={styles.customInput}
  132	            />
  133	          </PopoverTrigger>
  134	        </div>
  135	        {!!options.length && (
  136	          <PopoverContent
  137	            removeBackgroundAndPadding
  138	            className={styles.popoverContent}
  139	            align="start"
  140	            onOpenAutoFocus={(e) => e.preventDefault()}
  141	          >
  142	            <CommandList className={styles.commandList}>
  143	              {options.length > 0 && (
  144	                <CommandGroup>
  145	                  {options.map((option) => {
  146	                    return (
  147	                      <CommandItem
  148	                        key={option.value}
  149	                        value={getDisplayText(option)}
  150	                        onMouseDown={(event) => {
  151	                          event.preventDefault();
  152	                          event.stopPropagation();
  153	                        }}
  154	                        onSelect={() => handleSelectOption(option)}
  155	                      >
  156	                        {option.label}
  157	                      </CommandItem>
  158	                    );
  159	                    {
  160	                      isLoading ? (
  161	                        <CommandPrimitive.Loading>
  162	                          <div className={styles.loadingContainer}>
  163	                            <Skeleton style={{ height: "2rem" }} />
  164	                          </div>
  165	                        </CommandPrimitive.Loading>
  166	                      ) : null;
  167	                    }
  168	                  })}
  169	                </CommandGroup>
  170	              )}
  171	            </CommandList>
  172	          </PopoverContent>
  173	        )}
  174	      </CommandPrimitive>
  175	    </Popover>
  176	  );
  177	};
  178