import express from "express";
import cors from "cors";
import { query } from "./db.js";
import { lookupVehicle } from "./vehicleProvider.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/services", async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM services ORDER BY price_pence");
    res.json(rows);
  } catch (e) { next(e); }
});

app.get("/api/garages", async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM garages ORDER BY name");
    res.json(rows);
  } catch (e) { next(e); }
});

app.get("/api/vehicle/:registration", async (req, res) => {
  try {
    const vehicle = await lookupVehicle(req.params.registration);
    res.json(vehicle);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get("/api/slots", async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: "date is required" });

  const allSlots = ["09:00", "10:00", "11:30", "14:00", "15:30", "16:30"];
  const { rows } = await query(
    "SELECT booking_time::text FROM bookings WHERE booking_date=$1 AND status <> 'cancelled'",
    [date]
  );
  const booked = new Set(rows.map(r => r.booking_time.slice(0,5)));
  res.json(allSlots.filter(s => !booked.has(s)));
});

app.post("/api/bookings", async (req, res, next) => {
  const client = await query("SELECT 1");
  try {
    const { customer, vehicle, garageId, serviceId, date, time } = req.body;
    if (!customer || !vehicle || !garageId || !serviceId || !date || !time) {
      return res.status(400).json({ error: "Missing booking fields" });
    }

    const c = await query(
      "INSERT INTO customers(full_name,email,phone) VALUES($1,$2,$3) RETURNING id",
      [customer.fullName, customer.email, customer.phone]
    );

    const v = await query(
      `INSERT INTO vehicles(registration,make,model,colour,fuel_type,year,engine_capacity)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT(registration) DO UPDATE SET make=EXCLUDED.make
       RETURNING id`,
      [vehicle.registration.replace(/\s+/g, "").toUpperCase(), vehicle.make, vehicle.model, vehicle.colour, vehicle.fuelType, vehicle.year, vehicle.engineCapacity]
    );

    const b = await query(
      `INSERT INTO bookings(customer_id,vehicle_id,garage_id,service_id,booking_date,booking_time)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [c.rows[0].id, v.rows[0].id, garageId, serviceId, date, time]
    );

    res.status(201).json(b.rows[0]);
  } catch (e) { next(e); }
});

app.get("/api/bookings", async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT b.id,b.booking_date,b.booking_time,b.status,b.payment_status,
             c.full_name,c.email,c.phone,v.registration,v.make,v.model,
             s.name AS service_name,s.price_pence,g.name AS garage_name
      FROM bookings b
      JOIN customers c ON c.id=b.customer_id
      JOIN vehicles v ON v.id=b.vehicle_id
      JOIN services s ON s.id=b.service_id
      JOIN garages g ON g.id=b.garage_id
      ORDER BY b.booking_date,b.booking_time
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Garage API running on port ${process.env.PORT || 4000}`);
});
