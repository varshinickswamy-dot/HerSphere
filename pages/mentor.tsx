import {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowLeft,Bot,Send,Sparkles,UserRound,ThumbsUp,ThumbsDown} from "lucide-react";
import {postMentor} from "../endpoints/mentor_POST.schema";import {postMentorFeedback} from "../endpoints/mentor_feedback_POST.schema";
import styles from "./mentor.module.css";
type Msg={role:"user"|"assistant";text:string};
export default function MentorPage(){
 const [messages,setMessages]=useState<Msg[]>([{role:"assistant",text:"Hi! I’m your HerSphere Career Mentor. Ask me about career paths, skills, projects, resumes, interviews or your next step."}]);
 const [input,setInput]=useState(""); const [loading,setLoading]=useState(false); const [feedback,setFeedback]=useState<Record<number,number>>({}); const [feedbackError,setFeedbackError]=useState(""); const rate=async(i:number,rating:1|-1)=>{setFeedbackError("");try{await postMentorFeedback({rating,topic:"mentor-response"});setFeedback(x=>({...x,[i]:rating}))}catch(e){setFeedbackError(e instanceof Error?e.message:"Feedback could not be saved.")}};