import {useEffect,useState} from "react";
import {Link,Navigate} from "react-router-dom";
import {ArrowLeft,CalendarDays,MapPin,Video} from "lucide-react";
import {getEvents} from "../endpoints/events_GET.schema";
import {registerEvent} from "../endpoints/events_POST.schema";import {useAuth} from "../helpers/useAuth";import {useRealtimeChannel,useRealtimeReconnect} from "../components/FlootRealtimeProvider";import {channels} from "../helpers/realtimeChannels";
import styles from "./events.module.css";

export default function Events(){const {authState}=useAuth();const uid=authState.type==="authenticated"?authState.user.id:null;
 const [d,setD]=useState<any>({events:[],registeredIds:[]}),[loading,setLoading]=useState(true),[error,setError]=useState(""),[actionError,setActionError]=useState("");