import {useCallback,useEffect,useState} from "react";
import {Link,Navigate} from "react-router-dom";
import {ArrowLeft,Search,Users} from "lucide-react";
import superjson from "superjson";
import {useAuth} from "../helpers/useAuth";
import styles from "./mentorship.module.css";
export default function Mentorship(){
 const {authState}=useAuth();
 const [items,setItems]=useState<any[]>([]),[query,setQuery]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");