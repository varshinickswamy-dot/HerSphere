import { Link } from "react-router-dom";
import type { ElementType } from "react";
import { ArrowRight, Award, Bell, BookOpen, BriefcaseBusiness, Bookmark, CalendarDays, CheckCircle2, ChevronRight, CircleUserRound, FileText, GraduationCap, LayoutDashboard, LogOut, MessageCircle, Sparkles, Target, TrendingUp, Users, Menu, X } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { ThemeModeSwitch } from "../components/ThemeModeSwitch";
import { useEffect, useState } from "react";
import { getDashboard } from "../endpoints/dashboard_GET.schema";
import styles from "./dashboard.module.css";
