import { Shell } from "@/components/shell";

export default function Social(){
 return <Shell title="Social Studio">
  <section className="hero"><h1>Daily Inspirational Publishing</h1><p>Create, review and schedule inspirational content across your channels.</p></section>
  <section className="grid two" style={{marginTop:26}}>
   <div className="card">
    <h2 className="section-title">Create post</h2>
    <div className="form">
     <select defaultValue="INSPIRATION"><option>INSPIRATION</option><option>DEVOTIONAL</option><option>LEADERSHIP</option><option>ENCOURAGEMENT</option><option>PRODUCTIVITY</option></select>
     <textarea rows={8} defaultValue="You do not need to have everything figured out today. Take the next faithful step, remain consistent, and let progress compound."/>
     <input defaultValue="LinkedIn, Facebook, Instagram, Telegram"/>
     <input defaultValue="#DailyInspiration #Growth #Purpose"/>
     <input type="datetime-local"/>
     <button className="btn primary">Schedule post</button>
    </div>
   </div>
   <div className="card"><h2 className="section-title">Today's queue</h2>
    <div className="row"><strong>Morning Inspiration</strong><p>You do not need to see the entire road to take the next faithful step.</p><div className="small">#DailyInspiration #Purpose</div></div>
    <div className="row"><strong>Leadership</strong><p>Strong leadership creates clarity, courage, and room for others to grow.</p><div className="small">#Leadership #Growth</div></div>
    <div className="row"><strong>Evening Reflection</strong><p>Measure today by what you learned, who you encouraged, and how you grew.</p><div className="small">#Reflection #Gratitude</div></div>
   </div>
  </section>
 </Shell>
}
