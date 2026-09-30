import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function App() {
  const [registration,setRegistration]=useState("AB12 CDE");
  const [vehicle,setVehicle]=useState(null);
  const [services,setServices]=useState([]);
  const [garages,setGarages]=useState([]);
  const [serviceId,setServiceId]=useState("");
  const [garageId,setGarageId]=useState("");
  const [date,setDate]=useState("");
  const [slots,setSlots]=useState([]);
  const [time,setTime]=useState("");
  const [customer,setCustomer]=useState({fullName:"",email:"",phone:""});
  const [message,setMessage]=useState("");

  useEffect(()=>{ Promise.all([
    fetch(API+"/services").then(r=>r.json()),
    fetch(API+"/garages").then(r=>r.json())
  ]).then(([s,g])=>{ setServices(s); setGarages(g); if(s[0]) setServiceId(String(s[0].id)); if(g[0]) setGarageId(String(g[0].id)); }); },[]);

  useEffect(()=>{ if(date) fetch(API+"/slots?date="+date).then(r=>r.json()).then(setSlots); },[date]);

  async function lookup(){
    setMessage("");
    const r=await fetch(API+"/vehicle/"+encodeURIComponent(registration));
    const data=await r.json();
    if(r.ok) setVehicle(data); else setMessage(data.error||"Lookup failed");
  }

  async function book(e){
    e.preventDefault();
    const r=await fetch(API+"/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      customer,vehicle,garageId:Number(garageId),serviceId:Number(serviceId),date,time
    })});
    const data=await r.json();
    if(r.ok) setMessage("Booking confirmed. Reference #"+data.id);
    else setMessage(data.error||"Booking failed");
  }

  return <div className="page">
    <header><div><strong>AutoBook UK</strong><span>MOT & Garage Booking</span></div><a href="#book">Book now</a></header>
    <main>
      <section className="hero">
        <div><p className="eyebrow">FAST • SIMPLE • ONLINE</p><h1>Book your MOT or car service in minutes.</h1><p>Enter your registration, choose the work you need and select an available appointment.</p></div>
        <div className="card reg-card">
          <label>Vehicle registration</label>
          <div className="regrow"><span>GB</span><input value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())}/></div>
          <button onClick={lookup}>Find vehicle</button>
          {vehicle && <div className="vehicle"><b>{vehicle.make} {vehicle.model||""}</b><small>{vehicle.year} • {vehicle.fuelType} • {vehicle.colour}</small></div>}
        </div>
      </section>

      <section id="book" className="booking card">
        <h2>Book an appointment</h2>
        <form onSubmit={book}>
          <div className="grid">
            <label>Service<select value={serviceId} onChange={e=>setServiceId(e.target.value)}>{services.map(s=><option key={s.id} value={s.id}>{s.name} — £{(s.price_pence/100).toFixed(2)}</option>)}</select></label>
            <label>Garage<select value={garageId} onChange={e=>setGarageId(e.target.value)}>{garages.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
            <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
            <label>Time<select value={time} onChange={e=>setTime(e.target.value)} required><option value="">Choose a slot</option>{slots.map(s=><option key={s}>{s}</option>)}</select></label>
          </div>
          <h3>Your details</h3>
          <div className="grid">
            <label>Name<input required value={customer.fullName} onChange={e=>setCustomer({...customer,fullName:e.target.value})}/></label>
            <label>Email<input type="email" required value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})}/></label>
            <label>Phone<input required value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})}/></label>
          </div>
          <button className="primary" disabled={!vehicle}>Confirm booking</button>
          {!vehicle && <small className="hint">Look up your vehicle before booking.</small>}
          {message && <p className="message">{message}</p>}
        </form>
      </section>
    </main>
  </div>
}

createRoot(document.getElementById("root")).render(<App/>);
