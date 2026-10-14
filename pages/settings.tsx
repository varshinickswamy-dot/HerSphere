import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {ArrowLeft,Bell,BriefcaseBusiness,Check,Lock,Palette,Save,Shield,UserRound} from "lucide-react";
import {useAuth} from "../helpers/useAuth";
import {getProfile} from "../endpoints/profile_GET.schema";
import {postProfile} from "../endpoints/profile_POST.schema";
import {useThemeMode} from "../helpers/themeMode";
import styles from "./settings.module.css";
