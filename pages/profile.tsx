import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Plus, Save } from "lucide-react";
import { Input } from "../components/Input";
import { useAuth } from "../helpers/useAuth";
import { getProfile } from "../endpoints/profile_GET.schema";
import { postProfile } from "../endpoints/profile_POST.schema";
import styles from "./profile.module.css";
export default function ProfilePage(){