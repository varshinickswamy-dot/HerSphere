import {publish} from "@floot/realtime";
import {channels} from "./realtimeChannels";
export async function publishUserEvent(userId:string|number,type:string,payload:unknown){await publish(channels.user(String(userId)),{type,payload});}
    4