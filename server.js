const express = require("express");
const mysql = require("mysql2");

const app = express();

// 👇 CHANGE PORT HERE
const PORT = 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "user123",
  database: "hospital"
});

db.connect(err => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Home page
app.get("/", (req, res) => {
  res.send("<h2>Hospital Database</h2><p>Try /patients</p>");
});

// View patients in browser
app.get("/patients", (req, res) => {
  db.query("SELECT * FROM patients", (err, results) => {
    if (err) return res.send("Error fetching patients");
    res.json(results);
  });
});

// View doctors
app.get("/doctors", (req, res) => {
  db.query("SELECT * FROM doctors", (err, results) => {
    if (err) return res.send("Error fetching doctors");
    res.json(results);
  });
});

// View appointments
app.get("/appointments", (req, res) => {
  const sql = `
    SELECT a.appointment_id,
           p.name AS patient,
           p.sex,
           p.age,
           d.name AS doctor,
           a.appointment_date
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    JOIN doctors d ON a.doctor_id = d.doctor_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.send("Error fetching appointments");
    res.json(results);
  });
});

app.post("/patients", (req, res) => {
  const { name, sex, age } = req.body;

  if (!name || !sex || !age) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = "INSERT INTO patients (name, sex, age) VALUES (?, ?, ?)";
  db.query(sql, [name, sex, age], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error adding patient");
    }
    res.json({ message: "Patient added", id: result.insertId });
  });
});
app.post("/doctors", (req, res) => {
  const { name } = req.body;

  const sql = "INSERT INTO doctors (name) VALUES (?)";
  db.query(sql, [name], (err, result) => {
    if (err) return res.send("Error adding doctor");
    res.json({ message: "Doctor added", id: result.insertId });
  });
});
app.post("/appointments", (req, res) => {
  const { patient_id, doctor_id, appointment_date } = req.body;

  const sql = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [patient_id, doctor_id, appointment_date], (err, result) => {
    if (err) return res.send("Error adding appointment");
    res.json({ message: "Appointment added", id: result.insertId });
  });
});
app.put("/patients/:id", (req, res) => {
  const { name, sex, age } = req.body;
  const { id } = req.params;

  const sql = "UPDATE patients SET name=?, sex=?, age=? WHERE patient_id=?";
  db.query(sql, [name, sex, age, id], (err) => {
    if (err) return res.send("Error updating patient");
    res.json({ message: "Patient updated" });
  });
});
app.put("/doctors/:id", (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  const sql = "UPDATE doctors SET name=? WHERE doctor_id=?";
  db.query(sql, [name, id], () => {
    res.json({ message: "Doctor updated" });
  });
});


app.put("/appointments/:id", (req, res) => {
  const { patient_id, doctor_id, appointment_date } = req.body;
  const { id } = req.params;

  const sql = `
    UPDATE appointments 
    SET patient_id=?, doctor_id=?, appointment_date=?
    WHERE appointment_id=?
  `;
  db.query(sql, [patient_id, doctor_id, appointment_date, id], (err) => {
    if (err) return res.send("Error updating appointment");
    res.json({ message: "Appointment updated" });
  });
});
app.delete("/patients/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM patients WHERE patient_id=?", [id], (err) => {
    if (err) return res.send("Error deleting patient");
    res.json({ message: "Patient deleted" });
  });
});
app.delete("/doctors/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM doctors WHERE doctor_id=?", [id], (err) => {
    if (err) return res.send("Error deleting doctor");
    res.json({ message: "Doctor deleted" });
  });
});
app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM appointments WHERE appointment_id=?", [id], (err) => {
    if (err) return res.send("Error deleting appointment");
    res.json({ message: "Appointment deleted" });
  });
});


