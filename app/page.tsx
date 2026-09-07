import { Shell } from "@/components/shell";

const projects=[
 ["Website Redesign","18 tasks · Due Sep 14",76],
 ["Mobile App","24 tasks · Due Sep 21",52],
 ["Marketing Campaign","11 tasks · Due Sep 12",88],
 ["Client Portal","16 tasks · Due Sep 30",41]
];

export default function Home(){
 return <Shell>
  <section className="hero"><h1>Good afternoon, Alex</h1><p>Projects, tasks and daily publishing in one portable workspace.</p></section>
  <section className="grid metrics">
   <div className="card"><div className="label">Active Projects</div><div className="value">12</div></div>
   <div className="card"><div className="label">Tasks Completed</div><div className="value">148</div></div>
   <div className="card"><div className="label">Team Members</div><div className="value">8</div></div>
   <div className="card"><div className="label">Scheduled Posts</div><div className="value">7</div></div>
  </section>
  <section className="grid two">
   <div className="card"><h2 className="section-title">Recent Projects</h2>
    {projects.map(([name,meta,p])=><div className="row" key={String(name)}><strong>{name}</strong><div className="meta">{meta}</div><div className="progress"><span style={{width:`${p}%`}}/></div></div>)}
   </div>
   <div>
    <div className="card"><h2 className="section-title">My Tasks</h2>
     {["Finalize homepage review","Approve onboarding flow","Prepare campaign copy","Review client permissions","Publish daily inspiration"].map(x=><div className="row" key={x}><strong>{x}</strong><div className="small">Today · Workspace</div></div>)}
    </div>
    <div className="card social"><span className="pill">Daily Inspiration</span><span className="pill">Scheduled</span>
     <blockquote>Small faithful steps, repeated daily, can become the path to extraordinary change.</blockquote>
     <div className="small">LinkedIn · Facebook · Instagram · Telegram</div>
    </div>
   </div>
  </section>
 </Shell>
}
