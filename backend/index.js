const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const cors = require("cors")
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json())
app.use(cors())
let db=new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err)=>{
    if(err) {
        console.log(err.message);
        return;
    } else {
        console.log("connected to the database");
    }
})

db.run(`PRAGMA foreign_keys=ON`)

const sql = `CREATE TABLE IF NOT EXISTS user (
  user_id INTEGER PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_password TEXT NOT NULL,
  user_type TEXT NOT NULL
)`;

db.run(sql, [], (err)=>{
    if (err){
        console.log("Error creating user table");
        return;
    }else{
        console.log("created table user");
    }
})

const sqlproject = `CREATE TABLE IF NOT EXISTS project (
    project_id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
  )`;
  
  db.run(sqlproject, [], (err)=>{
      if (err){
          console.log("Error creating project table");
          return;
      }else{
          console.log("created table project");
      }
  })

  const sqltask = `CREATE TABLE IF NOT EXISTS task (
    task_id INTEGER PRIMARY KEY,
    task_description TEXT NOT NULL,
    task_status TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE
  )`;
  
  db.run(sqltask, [], (err)=>{
      if (err){
          console.log("Error creating task table");
          return;
      }else{
          console.log("created table task");
      }
  })

  app.post('/register', async(req, res)=>{
    const {username, password, type} = req.body;
        if (username!=="" && password!=="" && type!==""){
            const hashedpassword = await bcrypt.hash(req.body.password, 10);
            const sql = `SELECT * FROM user WHERE user_name=?`;
            db.get(sql, [req.body.username], async function(err, rows){
                if (err) return res.send("selection process errored");
                if (rows) {
                    res.send("username already exists");
                }else{
                    const insertQuery = `INSERT INTO user (user_name, user_password, user_type) VALUES (?,?,?)`;
                    await db.run(insertQuery, [req.body.username, hashedpassword, req.body.type], function(err){
                        if (err) return res.send("table inserted error")
                        res.send("Registered successfully")
                    })
                }
            })
        }else{
            res.send('please enter valid inputs')
        }
  })

  app.post('/login', async(req, res)=>{
        const {username, password} = req.body
        await db.get(`SELECT * FROM user WHERE user_name=?`, [req.body.username], async(err, rows)=>{
            if (err) return res.send("login table error")
            if(rows){
                const passmatched = await bcrypt.compare(password, rows.user_password)
                if(passmatched===true){
                    const payload = {username, password, type:rows.user_type}
                    const jwtToken = await jwt.sign(payload, "RESIPROCAL_KEY")
                    res.set("content_type", "application/json")
                    res.send({jwtToken})
                }else{
                    res.send("Password invalid")
                }
            }else{
                res.send("Inavlid user")
            }
        })
  })


  const authenticateToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
      response.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "RESIPROCAL_KEY", async (error, payload) => {
        if (error) {
          response.send("json not match");
        } else {
          request.payload=payload
          next();
        }
      });
    }
  };

app.get('/dashboardview', authenticateToken, async (req, res)=>{
    const {payload} = req
    if(req.payload.type==="admin"){
        const adminQuery = `SELECT * FROM user`
        await db.all(adminQuery,[], (err, rows)=>{
            if (err) return res.send("admin selection table error")
            res.send(rows)
        })
    }
    else{
        const memberQuery =`SELECT * FROM user WHERE user_name=?`
        db.all(memberQuery,[payload.username], (err, rows)=>{
            if (err) return res.send("member selection error")
            res.send(rows)
        })
    }
    
})

app.get('/dashboard/userdelete/:id', async (req, res)=>{
    const deleteId = req.params.id
    const sql = `DELETE FROM user WHERE user_id=?`
    await db.run(sql,[deleteId])
    await db.all(`SELECT * FROM user`, [], async(err, rows)=>{
        if (err) {
            res.status(404)
            res.send(err.message)
        }else{
            res.set('content-type', 'application/json')
            res.send(rows)
        }
    })
})

app.get('/dashboard/singleuserdelete/:id', async (req, res)=>{
    const deleteId = req.params.id
    const sql = `DELETE FROM user WHERE user_id=?`
    await db.run(sql,[deleteId],(err)=>{
        res.status(200)
    })
    
})

app.get('/dashboard/projectdelete/:id', async (req, res)=>{
    const deleteId = req.params.id
    const sql = `DELETE FROM project WHERE project_id=?`
    await db.run(sql,[deleteId],(err)=>{
        res.status(200)
    })
    
})

app.get('/projectItems/:id', async (req, res)=>{
    const userId=req.params.id
    const sql = `SELECT * FROM project WHERE user_id=?`
    await db.all(sql, [userId], async(err, row)=>{
        if(err){
            res.send("error")
        }else{
            res.status(201)
            res.send(row)
        }
    })
})

app.get('/task/:id', async (req, res)=>{
    const userId=req.params.id
    const sql = `SELECT * FROM task WHERE project_id=?`
    await db.all(sql, [userId], async(err, row)=>{
        if(err){
            res.send("error")
        }else{
            res.status(201)
            res.send(row)
        }
    })
})

app.post('/createproject/:id', async(req, res)=>{
    await db.run(`INSERT INTO project (project_name, user_id) VALUES (?,?)`, [req.body.projectname, req.params.id])
})

app.post('/createtask/:id', async(req, res)=>{
    await db.run(`INSERT INTO task (task_description, task_status, project_id) VALUES (?,?,?)`, [req.body.taskname, req.body.status, req.params.id])
})

app.get('/dashboard/taskdelete/:id', async (req, res)=>{
    const deleteId = req.params.id
    const sql = `DELETE FROM task WHERE task_id=?`
    await db.run(sql,[deleteId],(err)=>{
        res.status(200)
    })
})

app.put('/dashboard/taskupdate/:id', async (req, res)=>{
    const id = req.params.id
    const sql = `UPDATE task SET task_description=?, task_status=? WHERE task_id=?`
    await db.run(sql,[req.body.taskname, req.body.status, id],(err)=>{
        res.status(200)
    })
    
})

  db.all(`SELECT * FROM user`,[],(err, rows)=>{
    console.log(rows)
  })  

app.listen(8000, (err)=>{
    if(err){
        console.log('error:', err.message)
    }else{
        console.log('listening on port 8000')
    }
})