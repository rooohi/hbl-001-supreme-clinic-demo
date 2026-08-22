"use client";
import { useEffect,useState } from "react";
type Appointment={id:string;name:string;phone:string;treatment:string;slot:string;date:string;status:string};
const seed:Appointment[]=[
 {id:"SUP-1042",name:"Ananya S.",phone:"•••• 7812",treatment:"Acne & scar care",slot:"10:00 AM",date:"2026-08-22",status:"Checked in"},
 {id:"SUP-1043",name:"Nikhil P.",phone:"•••• 4408",treatment:"Hair fall consultation",slot:"11:30 AM",date:"2026-08-22",status:"Confirmed"},
 {id:"SUP-1044",name:"Riya K.",phone:"•••• 9021",treatment:"Skin rejuvenation",slot:"1:00 PM",date:"2026-08-22",status:"Confirmed"},
 {id:"SUP-1045",name:"Meera D.",phone:"•••• 2287",treatment:"Laser hair reduction",slot:"4:30 PM",date:"2026-08-22",status:"Awaiting"}
];
export default function Dashboard(){
 const [rows,setRows]=useState(seed); const [active,setActive]=useState<Appointment|null>(null);
 useEffect(()=>{const saved=localStorage.getItem("supreme-latest-appointment");if(saved){try{setRows(r=>[JSON.parse(saved),...r])}catch{}}},[]);
 const update=(id:string,status:string)=>setRows(r=>r.map(x=>x.id===id?{...x,status}:x));
 return <main className="dashboard"><aside><a className="brand inverse" href="/"><span className="brand-mark">S</span><span><b>SUPREME</b><small>CLINIC DESK</small></span></a><nav><a className="on">▦ Overview</a><a>◷ Appointments</a><a>♙ Clients</a><a>✦ Treatments</a><a>◌ Messages</a></nav><div className="staff"><i>SK</i><span><b>Shreya K.</b><small>Front desk</small></span></div></aside>
 <section className="dash-main"><header><div><p>Saturday, 22 August</p><h1>Good morning, Supreme.</h1></div><a href="/">View patient website ↗</a></header>
 <div className="metrics"><article><small>TODAY’S VISITS</small><b>{rows.length}</b><span>5 confirmed · 1 awaiting</span></article><article><small>NEXT APPOINTMENT</small><b>11:30</b><span>Hair fall consultation</span></article><article><small>BOOKING RATE</small><b>84%</b><span className="positive">↑ 12% this week</span></article><article><small>OPEN SLOTS</small><b>6</b><span>Today until 8:30 PM</span></article></div>
 <div className="dash-grid"><section className="schedule"><div className="section-head"><div><p>Today’s schedule</p><h2>Appointments</h2></div><button>+ Add appointment</button></div><div className="table-head"><span>TIME</span><span>CLIENT</span><span>TREATMENT</span><span>STATUS</span><span/></div>{rows.map(r=><button className="table-row" key={r.id} onClick={()=>setActive(r)}><b>{r.slot}</b><span><i>{r.name.split(" ").map(x=>x[0]).join("")}</i><span><strong>{r.name}</strong><small>{r.id}</small></span></span><span>{r.treatment}</span><em className={r.status.toLowerCase().replace(" ","-")}>{r.status}</em><span>›</span></button>)}</section>
 <aside className="side-card"><p>Capacity</p><h3>This week</h3><div className="donut"><span><b>78%</b><small>booked</small></span></div><div className="legend"><span><i/>Booked <b>42</b></span><span><i/>Available <b>12</b></span></div><hr/><p>Smart prompt</p><h3>Reduce tomorrow’s gaps</h3><small>Three clients are due for follow-ups. Send a gentle reminder to fill open slots.</small><button>Review follow-ups →</button></aside></div>
 </section>{active&&<div className="drawer"><button onClick={()=>setActive(null)}>×</button><p>Appointment {active.id}</p><h2>{active.name}</h2><span>{active.phone}</span><div><small>TREATMENT</small><b>{active.treatment}</b><small>TIME</small><b>Sat, 22 Aug · {active.slot}</b><small>STATUS</small><b>{active.status}</b></div><button className="drawer-primary" onClick={()=>{update(active.id,"Checked in");setActive(null)}}>Mark as checked in</button><button>Send WhatsApp reminder</button><small className="demo-note">Synthetic demo record — not patient data.</small></div>}</main>
}

