const admin = require('firebase-admin');
const functions = require('firebase-functions');
var alert = require('alert');
var serviceAccount = require("./privatekey.json");
const qrcode = require("qrcode");
 
const express = require('express');
const port = process.env.PORT || 3000;

const path=require('path');
const bodyParser= require('body-parser');
const {check, validationResult, checkSchema}=require('express-validator');
const { Console } = require('console');
const ejs = require('ejs');
const jwt= require("jsonwebtoken");
const dotenv = require('dotenv');
// get config vars
dotenv.config();
process.env.TOKEN_SECRET;
// for encryption
const bcrypt = require('bcrypt');
const saltRounds = 10;

let date_ob = new Date();

var app = express();  

const { join } = require('path');
  

const { start } = require('repl');

app.use(bodyParser.urlencoded({
	extended:true
}));


app.use(express.static('public'));
  
app.set('view engine', 'ejs');


// To Run the server with Port Number  
app.listen(port,()=> console.log(`Express server is running at port no :${port}`));  
  

//      for date

let date,month,year,current_day,c_time;// global

let c_day=date_ob.getDay();

 function get_time () {
    let ts = Date.now();
    let date_ob = new Date(ts);
    utcHour=((date_ob.getUTCHours()+5)%24);
    ////
    utcMinute=((date_ob.getUTCMinutes()+30)%60);
    ///
    let x=0;
    if (date_ob.getUTCMinutes()>29){utcHour=utcHour+1;}
    ///
    
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const d = new Date();
     current_day = weekday[d.getUTCDay()];
    
    let c_hour=String((utcHour)<10?'0':'')+utcHour;
    let c_minutes=String((utcMinute)<10?'0':'') + utcMinute;
     c_time=c_hour+""+c_minutes;
    console.log("printing time :"+c_time);
    ////
   
};


var classes={};
var rows={};
rows=[{"class":'',"section":'',"timing":''}]
var fname='',femail='',uid='';// to be used in dynamic ejs
var today=date_ob.toDateString();
 function checkStudent(res)
{   
   
    var c_section=rows[0].section;
    console.log(c_section);
    var collA={};
    var collB={};
    var collC={};
    var i=0,j=0,k=0;
    var lenA=0;
    var lenB=0;
    var lenC=0;
    admin.firestore().collection("students_list").doc("5A").collection("list").get()
    .then(val => {
        val.forEach(doc => {
            
            collA[i]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
            i++;
            
        });
        lenA = Object.keys(collA).length
        ////////

        admin.firestore().collection("students_list").doc("5B").collection("list").get()
        .then(val2 => {
            val2.forEach(doc => {
                
                collB[j]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                j++;
                
            });
        lenB = Object.keys(collB).length
        
        
        admin.firestore().collection("students_list").doc("5C").collection("list").get()
        .then(val3 => {
            val3.forEach(doc => {
                
                collC[k]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                k++;
                
            });
        lenC = Object.keys(collC).length
         /////
     //checkPresent();
     res.render('pages/faculty_check',{
        countA:lenA,
        StudentsA:collA,
        countB:lenB,
        StudentsB:collB,
        countC:lenC,
        StudentsC:collC
    })
       
});  // end of 5C
});  // end of 5B
});  // end of 5A
}
var presentStudents={};
function checkPresent()
{
   console.log("inside checkPresent")
    var c_section=rows[0].section;
    console.log(c_section);
    console.log(today);
    var present={};
    var x=0;
    admin.firestore().collection("Attendance").doc(uid).collection(c_section).doc(today).collection('attended').get()
        .then(val => {
            val.forEach(doc => {
                console.log('email:'+doc.id+',name:'+doc.data().name+',usn:'+doc.data().usn)
               // present[x]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                k++;
                
            });
        });
        // lenC = Object.keys(collC).length
    // const present =  await admin.firestore().collection('Attendance').doc(uid).collection(c_section).doc(today).collection('attended').get();
    // presentStudents=present.docs.map(doc => doc.data());
    // console.log("listing present studetns: : ");
    // console.log(presentStudents)
}

app.get("/faculty_check",authenticateToken, function(req,res){
 checkStudent(res);
//checkPresent();  // should be called by  get method
});

app.get("/home",authenticateToken,(req,res)=>{
    updateCurrClass(uid,fname,res);
})
app.get("/",authenticateToken, function(req,res){
    updateCurrClass(uid,fname,res);
});
app.get("/login", function(req,res){
    res.render('pages/login')
});
app.get("/register",function(req,res){
    res.render('pages/register')
});
app.get("/admin",function(req,res){
    res.render('pages/admin')
});
app.get("/contact",function(req,res){
    res.render('pages/contact')
});

app.get("/logout",authenticateToken,async(req,res)=>{
    try {
        res.clearCookie("jwt_authentication");
        res.clearCookie("uid");
        console.log("logout successfully");
        res.render('pages/register');
    } catch (error) {
        res.status(500).send(error);
    }
})
app.get("/:id",authenticateToken, function(req,res){
   
    res.render(`pages/${req.params.id}`)
     
 });
//////token/////
function generateAccessToken(username) {
    console.log("token is geneerated");
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '15d' });
}
function authenticateToken(req, res, next) {
    console.log("inside authentication token function");
    const token =  req.headers.cookie;
    console.log(token)
    //// for reading uid
    const uidtoken=token && token.split("=")[2]
    uid=uidtoken;
    ////
    const first_token= token && token.split(';')[0]
    console.log(first_token)
    const finaltoken=first_token && first_token.split('=')[1]
    console.log("finaltokenis ::");
    console.log(finaltoken);
    
    if (finaltoken == null) {
        const errors=[
            {msg:'Session Expired!'}
        ]
        const alert = errors
        res.render('pages/login',{
            alert
        })
        
        }
        else{
            jwt.verify(finaltoken, process.env.TOKEN_SECRET, (err, user) => {
            console.log("token matched");
        
            if (err) {
                console.log("an error has occurred")
                const errors=[
                    {msg:'Session Expired!'}
                ]
                const alert = errors
                res.render('pages/login',{
                    alert
                })
            }// if error occurs
            next()
            })
        }
  }

////////////////////
let scan_valid=0;
let start_time=0,end_time=0,s_time='085500';
async function updateCurrClass(uid,fname,res)
{
    get_time();
    console.log("inside update uid="+uid);
    const firestore_con  =  admin.firestore();
    const writeResult = firestore_con.collection('faculty').doc(uid).get()
    .then(doc => {
        if (!doc.exists) 
        { 
            console.log('No such document in write result!');
            console.log(uid);
            const errors=[
                {msg:' Failed!  server error..'}
            ]
            const alert = errors
            res.render('pages/login', {
                alert
            })

        }
        else { 
            fname=doc.data().name;
            femail=doc.data().email;
            console.log(fname+"  "+femail);
    
        }
    });// end of getting fname and femail


    if(c_time>=0855 && c_time <=0950)
    {
        start_time="08:55 am";
        s_time='085500';
        end_time='09:50 am';

    }
    else if(c_time>=0950 && c_time <=1045)
    {
        start_time='09:50 am';
        s_time='095000';
        end_time='10:45 am';
    }
    else if(c_time>=1045 && c_time <=1115)
    {
        start_time='10:45 am';
        s_time='104500';
        end_time='11:15 am'
        rows[0].timing='10:45am   to 11:15 am';
        rows[0].class='Tea Break';
        rows[0].secion='';
    }
    else if(c_time >=1115 && c_time<=1210)
    {
        start_time='11:15 am';
        s_time='111500';
        end_time='12:10 pm';
    }
    else if((c_time >=1210 )&&(c_time <=1305))
    {

        start_time='12:10 pm';
        s_time='121000';
        end_time='01:05 pm';
        
    }
    else if(c_time >=1305 &&c_time <=1400 )
    {

        start_time='01:05 pm';
        s_time='130500';
        end_time='02:00 pm';
        
    }
    else if(c_time>1400&& c_time<1455)
    {
        start_time='02:00 pm';
        s_time='140000';
        end_time='02:55 pm';
    }
    else if(c_time>1455 && c_time<1550)
    {
        start_time='02:55 pm';
        s_time='145500';
        end_time='03:50 pm';
    }
    else 
    {
     
        s_time='160000';
         scan_valid=0;
        rows[0].timing='04:00 pm to 08:55 am',
        rows[0].class='classes are finished...'
    }
    ////
    console.log(uid)
    console.log(current_day)
    
    const liam = await firestore_con.collection('faculty').doc(uid).collection(current_day).get();
    classes=liam.docs.map(doc => doc.data());
    console.log("listing all classes on current day: : ");
    console.log(classes)
  //////
   console.log('fname of faculty'+fname);
   console.log(c_time);
   if(c_day==0)
   {
    rows[0].timing='NO CLASSES TODAY';
    rows[0].class=''
   }
            if(c_time <1600 && c_time >0800&&c_day !=0)
          {
           
            firestore_con.collection('faculty').doc(uid).collection(current_day).doc(s_time).get().then(function(doc) {
                if(doc.data()===undefined)
                {
                    console.log("i am inside undefined doc.data");
                    rows[0].class='NO CLASS NOW !!';
                    rows[0].section='';
                    rows[0].timing=''
                }
                else{
                    rows[0]=doc.data() 
                    }   
              
                    console.log("current class :-: ");
                    console.log(doc.data())
           
           
            
            ///////     
             
            res.render('pages/faculty_welcome',{
                uid,
                fname,
                femail,
                classes,
                day:current_day,
                current_subject:rows[0].class,
                current_section:rows[0].section,
                current_timing:rows[0].timing,
                current_time:c_time
  
                })


            })// end of firestore_con collection
            .catch(err => { console.log('Error getting document', err);});
            }

            else 
            {
                if(c_time<0800&&c_time>0001){
                    console.log("inside else block")
                    
                    rows[0].timing='',
                    t=0855-c_time;
                    rows[0].timing='classes will start in '+t+' hours ...';
                }
                else {
                    rows[0].timing='04:00 pm   till 08:55 am  next day';
                }
                res.render('pages/faculty_welcome',{
                uid,
                fname,
                femail,
                classes,
                day:current_day,
                current_subject:rows[0].class,
                current_section:rows[0].section,
                current_timing: rows[0].timing,
                current_time:c_time
            })
    

            }
           

}
// end  of update class


app.post('/login', function(req,res,next){
     uid=String(req.body.uid)
    const password=String(req.body.passkey)
    uid=req.body.uid;
    
    const firestore_con  =  admin.firestore();
    const writeResult = firestore_con.collection('faculty').doc(req.body.uid).get()
    .then(doc => {
        if (!doc.exists) // entered uid doesnt registered
        { 
            console.log('No such document!');
            const errors=[
                {msg:' Failed!  Invalid Crudentials..'}
            ]
            const alert = errors
            res.render('pages/login', {
                alert
            })

        }
        else { // block for password matching and others
              db_pass=doc.data().password;
              
             bcrypt.compare(password, db_pass, function(err, result) {
                if (!result) 
                {// password mismatch
                   
                
                     
                    console.log('password not matched')
                    const errors=[
                       {msg:'Failed! Invalid crudentials..'}
                   ]
                   const alert = errors
                   res.render('pages/login', {
                          alert
                      })
   
                } // end of password mismatch
                
               
              

                else
                { // password matched 
                    fname=doc.data().name;
                    console.log("password matched");
                    const user={
                        id:uid,
                        username:fname,
                        password:password
                    }
                     const token = generateAccessToken(user);
                     console.log("token is created")
                     console.log(token)
                     
                     res.cookie("jwt_authentication",token,{ maxAge: 15*24*60*60*1000,httpOnly:true})
                    
                     res.cookie("uid",uid,{ maxAge: 15*24*60*60*1000,httpOnly:true})
                     ///////
                    updateCurrClass(uid,doc.data().name,res);
                           ////////////////////////
                 
                }// end of password matched

            });

         }// end of  block for password matching and others





        
     }) // end of then

    .catch(err => {
         console.log('Error getting document', err);
         const errors=[
            {msg:'Failed! '+err}
        ]
        const alert = errors
        res.render('pages/login', {
               alert
           })
     }); // end of catch
    
  

    
});



 

// for register.ejs
app.post('/register', [
    check('fname', 'Please enter valid username without space..')
        .exists()
        .isLength({ min: 3 })
        .isAlpha(),
    check('email', 'Please provide valid email')
        .isEmail()
        
        .normalizeEmail(),

    check('uid','please provide unique id')   
           .isLength(10)
           .isAlphanumeric(),
           
    check(
            "passkey",
            " password must have  at least one  number and minumum length 5. ",
          )
      .isLength({ min: 5 })
      .matches(
        
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,20}$/,
              ),
 check('confirmpasskey', 'Passwords do not match').custom((value, {req}) => (value === req.body.passkey)),
            

], async(req, res)=> {
   
    const errors = validationResult(req)
   
    if(!errors.isEmpty()) {
        // return res.status(422).jsonp(errors.array())
        const alert = errors.array()
        res.render('pages/register', {
            alert
        })
    }

    else{// if no errors
       
    
        console.log(req.body.name);
        console.log(req.body.email);
        console.log(req.body.uid);
        console.log(req.body.passkey);
       
    
        const encryptkey = await bcrypt.hash(req.body.passkey, saltRounds)
        const writeResult = await admin.firestore().collection('faculty').doc(req.body.uid).set({
            name: req.body.name,
            email: req.body.email,
            
            password: encryptkey
            })
            .then(function() 
            {
                console.log("Document successfully written!");
                res.render('pages/login')
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
                // Already exist 
                        console.log("error in inserting")
                        const errors=[
                             {msg:'Request Denied !! Uable to register...'}
                         ]
                         const alert = errors
                         res.render('pages/register', {
                                alert
                            })
              
            
            });
                             

     }
     
})



// working fine

app.post('/feedback',  [
    check('name', 'Please enter valid username without space..')
        .exists()
        .isLength({ min: 3 })
        .isAlpha(),
    check('email', 'Please provide valid email !!')
        .isEmail()
        .normalizeEmail(),
    check('subject',' invalid subject !!')    
           .exists()
           ,
    check(
            "message",
            "Invalid message body!!"  )
      
       .isLength({min:10})


]
    , async function(req, res) {
        const errors = validationResult(req)
   
    if(!errors.isEmpty()) {
        // return res.status(422).jsonp(errors.array())
        const alert = errors.array()
        res.render('pages/contact', {
            alert
        })
    }
    else
    {

        const writeResult = await admin.firestore().collection('feedback').doc(req.body.name+" "+ req.body.subject).set({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message
            })
            .then(function() 
            {
                console.log("feedback inserted succesfully using node");
                const errors=[
                    
                    {msg:"Thank you '" + req.body.name.toUpperCase() + "'  for contacting us...."}
                ]
                const message = errors
                res.render('pages/contact', {
                    message
                }) 
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
                // Already exist 
                        console.log("error in inserting")
                        const errors=[
                            {msg:'  Failed ! Error .. '}
                         ]
                         const alert = errors
                         res.render('pages/contact', {
                                alert
                            })
              
            
            });
            


                        

      
        
    }
})



// for admin login
var admin_name='admin';
var lenA=0;
var lenB=0;
var lenC=0;
var collA={};
var collB={};
var collC={};
app.post('/verify',(req,res)=>{
    const key=String(req.body.admin_key)
    const password=String(req.body.passkey)


       
    
    const firestore_con  =  admin.firestore();
    const writeResult = firestore_con.collection('admins').doc(req.body.admin_key).get()
    .then(doc => {
        if (!doc.exists) // entered uid doesnt registered
        { 
            console.log('No such document!');
            const errors=[
                {msg:' Failed!  Invalid Crudentials..'}
            ]
            const alert = errors
            res.render('pages/login', {
                alert
            })

        }
        else { // block for password matching and others
              db_pass=doc.data().password;
              //console.log(doc.data());
             
             console.log(db_pass)  
             bcrypt.compare(password, db_pass, function(err, result) {
                if (!result) {// password mismatch
                   
                
                     
                    console.log('password not matched')
                    const errors=[
                       {msg:'Failed! crudentials not matched'}
                   ]
                   const alert = errors
                   res.render('pages/admin', {
                          alert
                      })
   
                 } // end of password mismatch
                
               
              

                else
                { // password matched 
                   
                        console.log("password matched");
                        admin_name=doc.data().name;

                            ////////////////////////
                    
                            var i=0,j=0,k=0;
                          
                            admin.firestore().collection("students_list").doc("5A").collection("list").get()
                            .then(val => {
                                val.forEach(doc => {
                                    
                                    collA[i]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                                    i++;
                                    
                                });
                                lenA = Object.keys(collA).length
                                ////////
                
                                admin.firestore().collection("students_list").doc("5B").collection("list").get()
                                .then(val2 => {
                                    val2.forEach(doc => {
                                        
                                        collB[j]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                                        j++;
                                        
                                    });
                                lenB = Object.keys(collB).length
                                
                                
                                admin.firestore().collection("students_list").doc("5C").collection("list").get()
                                .then(val3 => {
                                    val3.forEach(doc => {
                                        
                                        collC[k]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                                        k++;
                                        
                                    });
                                lenC = Object.keys(collC).length
                                /////
                            
                            /////
                    res.render('pages/admin_edit',{
                        admin_name,
                        lenfeed:0,
                        feeds:'',
                        countA:lenA,
                        StudentsA:collA,
                        countB:lenB,
                        StudentsB:collB,
                        countC:lenC,
                        StudentsC:collC
                    })
                           
                        });  // end of 5C
                        });  // end of 5B
                        
                
                
                
                
                   
                
                    });// end of  5A
                    
                }// end of password matched

            });

             }// end of  block for password matching and others





        
     }) // end of then

    .catch(err => {
         console.log('Error getting document', err);
         const errors=[
            {msg:' Invalid admin crudentials   : '+err}
        ]
        const alert = errors
        res.render('pages/admin', {
               alert
           })
     }); // end of catch
    
  




});

///////firestore////

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    
  });




/// getting class on unique day
 function getFirestore(uid,current_day,time){
    const firestore_con  =  admin.firestore();
  
    const writeResult =  firestore_con.collection('faculty').doc(uid).collection(current_day).doc(time).get().then(doc => {
    if (!doc.exists) { console.log('No  document!'); }
    else {
       console.log(doc.data())
      
     }
    })
    .catch(err => { console.log('Error getting document', err);});
    
    }



/////////






///  inserting data
async function insertFormData(request){
    const writeResult = await admin.firestore().collection('faculty').add({
    name: request.body.fname,
    email: request.body.email,
    uid: request.body.uid,
    password: request.body.passkey
    })
    .then(function() {console.log("Document successfully written!");})
    .catch(function(error) {console.error("Error writing document: ", error);});
    }



//////


function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

 function incrementClass(sec,sub){
    // getting prev count
    let count=0;
    const liam =  admin.firestore().collection('students_list').doc(sec).collection('total_classes').doc(sub).get().then(doc => {
        if (!doc.exists) { console.log('No  document!'); }
        else {
            console.log(doc.data())
            count=parseInt(doc.data().total);
            count++;
              //// if yes , update increment count of classes 
            const writeResult =  admin.firestore().collection('students_list').doc(sec).collection('total_classes').doc(sub).set({
                total: count
            })
            .then(function() {console.log("count of current classes succesfullly done!");
                             console.log("value of count ::"+count)
            })

            .catch(function(error) {console.error("Error writing document: ", error);});
         }
        })
        .catch(err => { console.log('Error getting document', err);});
        ///count is incremented
        
        console.log(count)
    
  

}

async function deletekey(key)
{
    console.log(key)
    //await admin.firestore().collection('QR_key').doc(key).delete(); 
    console.log(" key is deleted")
}

//// for qr page
app.post("/scan", (req, res, next) => {
    console.log(c_time)
    if(c_time>1730||current_day=="Sunday")
    {
        console.log("no class so no qr")
        checkStudent(res);
        
    }
    else{
        var rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        get_time();
      var count=0;
      var str='';
        var currentdate=date_ob.toDateString();
        var currentclass=rows[0].class;
        var currentsection=rows[0].section;
        console.log(currentdate)
        console.log(currentclass)
        console.log(currentsection)
        console.log(uid)
        console.log(c_time)
        console.log(c_day)
        ////// inserting random key into db
        const writeResult =  admin.firestore().collection('QR_key').doc(rString).set({
            class: currentclass,
            date: currentdate,
            day:current_day ,
            section: currentsection,
            teacher_USN: uid,
            time: c_time,
            valid: 1,
            })
            .then(function()
            {
               
                console.log("QR key successfully written!");
                 
                incrementClass(currentsection,currentclass);

                
            })

            .catch(function(error) {console.error("Error writing document: ", error);});



            //////
            var input_text=rString
            qrcode.toDataURL(input_text, (err, src) => {
            if (err) res.send("Something went wrong!!");
            res.render("pages/scan", {
                qr_code: src,
            });


            });

    }
});








/////////////////////////// for admin page ///////////
var feeds={};
  ////
app.post('/firedb',(req,res)=>{
     fireuid=req.body.uid;
     fires_time=req.body.s_time;
     fireday=req.body.day;
     fireclass=req.body.class;
     firesection=req.body.section;
     firetiming=req.body.timing;

     const writeResult =  admin.firestore().collection('faculty').doc(fireuid).collection(fireday).doc(fires_time).set({
        class:fireclass,
        section:firesection,
        timing:firetiming
        })
        .then(function() {console.log("Document successfully written!");
        const errors=[
            {msg:` Successfully inserted data of ${fireuid}`}
        ]
        const alert = errors
        res.render('pages/admin_edit', {
              
               admin_name,
               lenfeed:0,
               feeds:'',
               countA:lenA,
               StudentsA:collA,
               countB:lenB,
               StudentsB:collB,
               countC:lenC,
               StudentsC:collC
           })

        })
        .catch(function(error) {console.error("Error writing document: ", error);
        const errors=[
            {msg:'Failed to insert into database'}
        ]
        const alert = errors
        res.render('pages/admin_edit', {
            admin_name,
            lenfeed:0,
            feeds:'',
            countA:lenA,
            StudentsA:collA,
            countB:lenB,
            StudentsB:collB,
            countC:lenC,
            StudentsC:collC
           })

        });



    
})

app.post('/addStudent',(req,res)=>{
    fireusn=(req.body.usn).toUpperCase();
    fireemail=req.body.email;
    firename=(req.body.name).toUpperCase();
    firesection=(req.body.section).toUpperCase();

    const writeResult =  admin.firestore().collection('students_list').doc(firesection).collection('list').doc(fireemail).set({
        usn:fireusn,
        name:firename
       })
       .then(function() {console.log("Document successfully written!");
       const errors=[
           {msg:` Successfully inserted data of ${fireusn}`}
       ]
       const alert = errors
       res.render('pages/admin_edit', {
        admin_name,
        lenfeed:0,
        feeds:'',
        countA:lenA,
        StudentsA:collA,
        countB:lenB,
        StudentsB:collB,
        countC:lenC,
        StudentsC:collC
          })

       })
       .catch(function(error) {console.error("Error writing document: ", error);
       const errors=[
           {msg:'Failed to insert into database'}
       ]
       const alert = errors
       res.render('pages/admin_edit', {
        admin_name,
        lenfeed:0,
        feeds:'',
        countA:lenA,
        StudentsA:collA,
        countB:lenB,
        StudentsB:collB,
        countC:lenC,
        StudentsC:collC
          })

       });



   
})




  /// for accessing feedbacks 

  app.post('/access_feedback',async(req,res)=>{
    const feed =  await admin.firestore().collection('feedback').get();
    feedbacks=feed.docs.map(doc => doc.data());
    console.log(feedbacks)
    lenfeed = Object.keys(feedbacks).length
    /////
            var collA={};
            var collB={};
            var collC={};
            var i=0,j=0,k=0;
            var lenA=0;
            var lenB=0;
            var lenC=0;
            admin.firestore().collection("students_list").doc("5A").collection("list").get()
            .then(val => {
                val.forEach(doc => {
                    
                    collA[i]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                    i++;
                    
                });
                lenA = Object.keys(collA).length
                ////////

                admin.firestore().collection("students_list").doc("5B").collection("list").get()
                .then(val2 => {
                    val2.forEach(doc => {
                        
                        collB[j]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                        j++;
                        
                    });
                lenB = Object.keys(collB).length
                
                
                admin.firestore().collection("students_list").doc("5C").collection("list").get()
                .then(val3 => {
                    val3.forEach(doc => {
                        
                        collC[k]={email:doc.id,name:doc.data().name,usn:doc.data().usn};
                        k++;
                        
                    });
                lenC = Object.keys(collC).length
                /////
              /////
            res.render('pages/admin_edit',{
                admin_name,
                lenfeed:lenfeed,
                feeds:feedbacks,
                countA:lenA,
                StudentsA:collA,
                countB:lenB,
                StudentsB:collB,
                countC:lenC,
                StudentsC:collC
            })
           
           
        });  // end of 5C
        });  // end of 5B

    });// end of  5
})


  app.post('/deleteQRkey',(req,res)=>{
      getDay=req.body.daytokey;
      var i=0;
        admin.firestore().collection("QR_key").where('day','==',getDay).get()
        .then(val => {
            val.forEach(doc => {
                
                garbage[i]={email:doc.id};
                i++;
                
            });
        res.render('pages/admin_edit',{
            admin_name
        })
    });  

})