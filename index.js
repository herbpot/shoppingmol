require('dotenv').config()
const express = require('express')
const app = express()
const sqlite3 = require('sqlite3').verbose()
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const cryptojs = require('crypto-js')
const maxAge = 1000 * 60 * 30
const sessionObj = {
    secret: process.env.session,
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({ checkPeriod: maxAge }),
    cookie: {
        maxAge,
    },
};
  
let db = new sqlite3.Database('./static/db/main.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.log(err);
    else console.log('connected with database');
})

function chunk(data = [], size = 4) {
    const arr = [];
      
    for (let i = 0; i < data.length; i += size) {
      arr.push(data.slice(i, i + size));
    }
  
    return arr;
  }

db.serialize(() => {
    db.exec('create table if not exists product(id integer primary key autoincrement, name string, description string, price integer, titleImg string, mainImgs string, subImgs string, tag string);')
    db.exec('create table if not exists users(id integer primary key autoincrement, name string, nick string, phoneNumber string, pw string);')
    // db.exec('insert into product(name, description, price, titleImg, mainImgs, subImgs) values ("test", "test", 1, "non", "non", "non")')
    db.all('select * from users', (err,rows) => {
        console.log(rows);
    })
})

app.engine('html', require('ejs').renderFile );
app.set('view engine', 'html');
app.use('/static', express.static('static'));
app.use(session(sessionObj));
app.use(express.json())
app.use(express.urlencoded( { extended: true } ))

app.get('/', (req,res) => {
    db.all(`select * from product`, (err, rows) => {
        console.log(req.session);
        req.session.isLogin = req.session.user != undefined ? true : false
        req.session.save(() => {
            res.render('main.ejs', {data: chunk(rows), isLogin: req.session.isLogin, user: req.session.user})
        })
    })
})

app.get('/login', (req,res) => {
    res.render('login.ejs',{isLogin: req.session.isLogin})
})

app.post('/login', (req,res) => {
    console.log(req.body, cryptojs.SHA256(req.body.pwpw).toString());
    db.get(`select * from users where nick=="${req.body.idid}" and pw=="${cryptojs.SHA256(req.body.pwpw).toString()}"`, (err, row) => {
        console.log(err, row);
        if (row == undefined) res.send('alert')
        else{
            req.session.user = row
            console.log(req.session, row);
            req.session.save(() => {
                res.redirect('/')    
            })
        }
    })
})

app.get('/signup',(req,res) => {
    res.render('signup.ejs', {isLogin: req.session.isLogin})
})

app.post('/signup', (req,res) => {
    console.log(`insert into users(name, nick, phoneNumber, pw) values("${req.body.name}", "${req.body.idid}", "${req.body.phoneNumber}", "${cryptojs.SHA256(req.body.pwpw).toString()}")`);
    db.exec(`insert into users(name, nick, phoneNumber, pw) values("${req.body.name}", "${req.body.idid}", "${req.body.phoneNumber}", "${cryptojs.SHA256(req.body.pwpw).toString()}")`)
    res.redirect('/')
})

app.get('/product/:id', (req,res) => {
    db.get(`select * from product where id="${req.params.id}"`, (err, row) => {
        console.log(err,row);
        res.render('product.ejs', {data: row, isLogin: req.session.isLogin, user: req.session.user})
    })
})

app.get('/user/:id', (req,res) => {
    if (!req.session.isLogin){
        res.redirect('/')
    }
    db.get(`select * from users where id=${req.params.id}`, (err, row) => {
        res.render('userinfo.ejs', { data: row, isLogin: req.session.isLogin, user: req.session.user})
    })
})

app.post('/user/:id', (req,res) => {
    db.exec(`update users where id=${req.params.id} set (id, pw) = (${req.body.idid}, ${req.body.pwpw})`)
    res.redirect('/user/'+req.params.id)
})

app.get('/buket/:id', (req,res) => { //여기 구현해야함
    res.render('')
})

app.post('/buket/:id', (req,res) => {
    if (req.session.buket == undefined) req.session.buket = []
    req.session.buket.push(id)
    req.session.save(() => {
        res.redirect('/buket'+req.session.user.id)
    })
    
})

app.listen(8080, () => {
    console.log('http://localhost:8080');
})