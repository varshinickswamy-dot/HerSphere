import {useEffect,useState} from "react";
import {Link, Navigate} from "react-router-dom";
import {ArrowLeft,Send,MessageCircle,Radio,Search} from "lucide-react";
import {getMessages} from "../endpoints/messages_GET.schema";
import {postMessage} from "../endpoints/messages_POST.schema";
import {getContacts} from "../endpoints/contacts_GET.schema";
import {useAuth} from "../helpers/useAuth";
import {useRealtimeChannel,useRealtimeReconnect} from "../components/FlootRealtimeProvider";
import {channels} from "../helpers/realtimeChannels";