import {useEffect,useState} from "react";
import {Link, Navigate} from "react-router-dom";
import {ArrowLeft,Send,MessageCircle,Radio,Search} from "lucide-react";
import {getMessages} from "../endpoints/messages_GET.schema";
import {postMessage} from "../endpoints/messages_POST.schema";
import {getContacts} from "../endpoints/contacts_GET.schema";
import {useAuth} from "../helpers/useAuth";
import {useRealtimeChannel,useRealtimeReconnect} from "../components/FlootRealtimeProvider";
import {channels} from "../helpers/realtimeChannels";
import styles from "./messages.module.css";

export default function Messages(){
 const {authState}=useAuth(); const user=authState.type==="authenticated"?authState.user:null;
 const [messages,setMessages]=useState<any[]>([]),[inboxMessages,setInboxMessages]=useState<any[]>([]),[contacts,setContacts]=useState<any[]>([]);
 const [activePeer,setActivePeer]=useState(""),[unreadCount,setUnreadCount]=useState(0);
 const [recipient,setRecipient]=useState(""),[contactQuery,setContactQuery]=useState(""),[body,setBody]=useState(""),[subject,setSubject]=useState(""),[sending,setSending]=useState(false);
 const [loading,setLoading]=useState(true),[contactsError,setContactsError]=useState(""),[error,setError]=useState(""),[actionNotice,setActionNotice]=useState("");
 const load=async(peer=activePeer)=>{setLoading(true);setError("");try{const inbox=await getMessages();setInboxMessages(inbox.messages||[]);setUnreadCount(inbox.unreadCount||0);if(peer){const thread=await getMessages(peer);setMessages(thread.messages||[]);setUnreadCount(thread.unreadCount||0)}else setMessages(inbox.messages||[])}catch(e){setError(e instanceof Error?e.message:"Could not load messages. Please try again.")}finally{setLoading(false)}};
 useEffect(()=>{if(user)void load("")},[user?.id]);
 useEffect(()=>{if(!user)return;let active=true;setContactsError("");getContacts(contactQuery).then(r=>{if(active)setContacts(r.contacts||[])}).catch(e=>{if(active)setContactsError(e instanceof Error?e.message:"Could not search contacts. Please try again.")});return()=>{active=false}},[contactQuery,user?.id]);
 useRealtimeChannel(user?.id?channels.user(String(user.id)):null,()=>load());useRealtimeReconnect(load);
 const send=async()=>{if(!recipient||!body.trim()||sending)return;setSending(true);setActionNotice("");setError("");try{await postMessage({recipientUserId:recipient,subject,body});setBody("");setSubject("");setActionNotice("Message sent successfully.");await load()}catch(e){setError(e instanceof Error?e.message:"Could not send message. Please try again.")}finally{setSending(false)}};
 if(authState.type==="loading")return <main className={styles.page}><p role="status">Checking your session…</p></main>;
 if(authState.type!=="authenticated")return <Navigate to="/login" replace state={{from:"/messages"}}/>;
 return <main className={styles.page}><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link>
  <header><span><MessageCircle size={15}/> HERSPHERE MESSAGES <i><Radio size={11}/> LIVE</i></span><h1>Your professional inbox.</h1><p>Real-time conversations with recruiters, mentors and career contacts.</p></header>
  <section className={styles.compose}><h2>Start a conversation</h2>
   <div><Search size={15}/><input value={contactQuery} onChange={e=>setContactQuery(e.target.value)} placeholder="Search a person by name"/></div>
   {contactsError&&<p role="alert">{contactsError}</p>}
   {contactQuery&&contacts.slice(0,6).map(c=><button key={c.id} className={styles.contact} onClick={()=>{setRecipient(c.id);setContactQuery(c.displayName)}}>{c.displayName}<small>{c.role}</small></button>)}
   <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject"/>
   <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write a professional message..."/>
   <button onClick={send} disabled={sending||!recipient||!body.trim()}><Send size={15}/> {sending?"Sending...":"Send message"}</button>
  </section>
  {actionNotice&&<p role="status">{actionNotice}</p>}{error&&<p role="alert">{error} <button onClick={()=>void load()}>Retry loading messages</button></p>}
  <section className={styles.list}>
   <h2>Conversations {unreadCount>0&&<small>{unreadCount} unread</small>}</h2>
   {[...new Map(inboxMessages.map(m=>{const outgoing=String(m.senderUserId)===String(user?.id);const peer=outgoing?String(m.recipientUserId):String(m.senderUserId);return [peer,{id:peer,name:outgoing?m.recipientName:m.senderName,last:m,unread:inboxMessages.filter(x=>String(x.senderUserId)===peer&&String(x.recipientUserId)===String(user?.id)&&!x.readAt).length}] })).values()].sort((a,b)=>new Date(b.last.createdAt).getTime()-new Date(a.last.createdAt).getTime()).map(contact=><button key={contact.id} className={styles.contact} onClick={()=>{setActivePeer(contact.id);void load(contact.id)}}><strong>{contact.name||"Professional contact"}</strong><small>{contact.last.body?.slice(0,90)||"No message preview"} · {new Date(contact.last.createdAt).toLocaleString()}</small>{contact.unread>0&&<small>{contact.unread} unread</small>}</button>)}
   {activePeer&&<button className={styles.contact} onClick={()=>{setActivePeer("");void load("")}}>Back to all conversations</button>}
   {loading?<p role="status">Loading messages…</p>:error?<p>Messages could not be loaded. Use Retry loading messages above.</p>:messages.length===0?<p>No messages yet.</p>:messages.map(m=><article key={String(m.id)}><div><b>{m.senderName||m.recipientName||"Professional contact"}</b><small>{m.subject||"No subject"} · {new Date(m.createdAt).toLocaleString()} · {String(m.senderUserId)===String(user?.id)?"Sent":m.readAt?"Read":"Delivered"}</small><p>{m.body}</p></div></article>)}
  </section>
 </main>
}