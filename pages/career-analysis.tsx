import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Loader2, Sparkles, Target, TrendingUp } from "lucide-react";
import { getCareerAnalysis } from "../endpoints/career_analysis_GET.schema";
import { postCareerAnalysis } from "../endpoints/career_analysis_POST.schema";
import styles from "./career-analysis.module.css";
export default function CareerAnalysisPage(){
 const [role,setRole]=useState(""); const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
 useEffect(()=>{getCareerAnalysis().then(setData).catch(()=>{});},[]);