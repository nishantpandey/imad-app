var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
var Pool = require('pg').Pool;

app.use(morgan('combined'));
app.use(bodyParser.json());

// User Session Information
app.use(session({
   secret: 'someRandomSecretValue',
   cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}
}));


var config = {
    user :'nishantbitsmesra',
    database : 'nishantbitsmesra',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var content = {
        'article-one' :{
        
        'title': 'Article One| Nishant Pandey',
        'heading': 'Article One',
        'date': '8/6/2017',
        'content':`<p>
                        This is my first article. This is my first article.This is my first article.This is my first article.This is my first article.This is my first article.This is my first article.This is my first article.This is my first article.This is my first article.
                    </p>`
    },
        'article-two' :{
        'title': 'Article Two| Nishant Pandey',
        'heading': 'Article Two',
        'date': '9/6/2017',
        'content':`<p>
                        This is my second article.
                    </p>`
    },
        'article-three': {
       'title': 'Article Three| Nishant Pandey',
        'heading': 'Article Three',
        'date': '10/6/2017',
        'content':`<p>
                        This is my Third article.This is my Third article.This is my Third article.This is my Third article.This is my Third article.This is my Third article.This is my Third article.This is my Third article.
                    </p>` 
    }
};

    function createTemplate(data) {
    var heading = data.heading;
    var title = data.title;
    var date = data.date;
    var content = data.content;
    
    var htmlContent =
    `<html>
        <head>
            <title>${title}</title>
            <meta name = "viewport" content="width=device-width, initial-scale=1" />
            <link href="ui/style.css" rel = "stylesheet"/>
            <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        </head>
        <style>
           .footer {
               background-color: rgba(209, 197, 205, 0.9);
            }
           
        </style>
        <body>
            <div class = "container">
                <div>
                    <a href="/">Home</a>
                </div>
                <hr>
                <h3>
                    ${heading}
                </h3>
                <div>
                    ${date}
                </div>
                <div>
                    <p>
                        ${content}
                    </p>
                </div>
               <form>
                <textarea id="words" rows="5" cols="105"placeholder ="Enter Comment"></textarea>
                <input type="button" onclick="getwords()" value="Enter" />
              </form>
              <div class="footer">
                <p id="para"></p>
              <div>
            </div>
            <script type="text/javascript">
                  function getwords() {
                      var text = words.value;
                      document.getElementById("para").innerHTML += '<hr>'+'<p>'+ text;
                      document.getElementById("words").value = "";
                  }
            </script>
        </body>
        
    </html>`;
    
    return htmlContent;
    }
    

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/login_details/login', function (req, res) {
  res.sendFile(path.join(__dirname, 'login_details', 'login.html'));
});

var pool = new Pool(config);

app.get('/test-db', function(req,res) {
   pool.query('SELECT * FROM test ', function(err,result) {
     if(err) {
         res.status(500).send(err.toString());
     }else {
         res.send(JSON.stringify(result.rows));
     }
   });
    
});

function hash(input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.post('/login', function(req,res) {
   var username = req.body.username;
   var password = req.body.password;

   pool.query('SELECT * FROM "user" WHERE username = $1', [username], function(error, result) {
       if(error) {
           res.status(500).send(error.toString());
       }else if(result.rows.length === 0) {
           res.send(403).send("Username/Password is incorrect");
       }else {
           var dbString = result.rows[0].password;
           var salt = dbString.split('$')[2];
           var hashedPassword = hash(password, salt);
           if(hashedPassword === dbString) {
               // setting the user session.
               req.session.auth = {userId: result.rows[0].id};
               res.send('Credentials Correct');
           }else {
               res.send(403).send("Username/Password is uncorrect");
           }
           
       }
       
   });
   
    
});

app.get('/logout', function(req,res) {
    
    delete req.session.auth.userId;
    res.send('User Logged Out');
});

app.get('/check-login', function(req,res){
   if(req.session && req.session.auth && req.session.auth.userId){
       res.send('User Logged In With' + req.session.auth.userId );
   }else {
       res.send('Session Expired');
   }
    
});


app.post('/create-user', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    console.log('UserName' + username);
    console.log('password' + password);
    pool.query('INSERT into "user" (username, password) VALUES ($1, $2)', [username, dbString], function(result, error){
       if(error) {
           res.status(500).send(error.toString());
       }else {
           res.send('User Created Sucessfully' + username);
       }
        
    });
    
});



app.get('/hash/:input', function (req, res) {
  var hashedString = hash(req.params.input,'this-is-some-randam-string')
  res.send(hashedString);
});

var counter = 0;
app.get('/counter', function (req, res) {
    counter = counter + 1;
  res.send(counter.toString());
});

///submit-name/nishant
var names= [];
app.get('/submit-name', function (req, res) {
  var name = req.query.name;
  names.push(name);
  res.send(JSON.stringify(names));
});


//app.get('/:articleName', function (req, res) {
//  var articleName = req.params.articleName;
 // res.send(createTemplate(content[articleName]));
//});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
