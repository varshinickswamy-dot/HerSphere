import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {ArrowLeft,CheckCircle2,Download,FileText,Plus,Save,Trash2} from "lucide-react";
import {getResume} from "../endpoints/resume_GET.schema";
import {postResume} from "../endpoints/resume_POST.schema";
import {getProfile} from "../endpoints/profile_GET.schema";
import styles from "./resume.module.css";
const empty={title:"ATS Resume",fullName:"",headline:"",email:"",phone:"",location:"",summary:"",skills:[] as string[],education:[{degree:"",institution:"",dates:"",score:""}],experience:[{role:"",company:"",dates:"",details:""}],projects:[{name:"",technologies:"",details:""}],certifications:[] as string[],links:{github:"",linkedin:"",portfolio:""}};
export default function ResumePage(){