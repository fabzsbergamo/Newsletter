// jshint esversion: 6

const express = require ("express");
const bodyParser = require ("body-parser");
const request = require ("request");
const https = require ('https');

const app = express();

// This below gets the server to load up the css and images stored in the public folder.
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// This below will get you your html file so that the server can load it up. In the command line type -> nodemon app.js
app.get("/", function (req, res){
    res.sendFile(__dirname + "/signup.html");
});

// This will post your data to the Server you want it to go to. In this case we are sending the data to Mailchimp.
app.post("/", function (req, res){
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;

    //  This is the data Object in javascript. This is basically the subscriber's info
    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    }

    // The data above is in Javascript but we need it in JSON format. So the code below changes it to JSON.
    const jsonData = JSON.stringify(data);

    // Created a file called 'config.js' This file will be named on my .gitignore file. That way it is not visible in any remote depository.
    const config = require ("./config.js");

    var mykey = config.MY_API_KEY;
    var listid = config.LIST_ID;

    // This below will make the data go the right mailchimp server. You get this URL from mailchimp, then you simply put in your specific list ID at the end of the URL and you also add the specif server you want it to land in - (us7 - is the one mailchimp give me).
    const url = "https://us7.api.mailchimp.com/3.0/lists/" + listid;

    

    // this 'options' object will "POST" the information. Your API KEY is like a password which give you permission to do it!
    const options = {
        method: "POST",
        auth: "ChyLashes:" + mykey
    }

    // Finally, now we make the request
    const request = https.request(url, options, function(response){
        
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile (__dirname + ("/failure.html"));
        }

        response.on("data", function(data){
            console.log(JSON.parse(data));
        })
    })

    // Although we made the request above we actually did not specify what we're sending to mailchimp. So hence the code below;
    request.write(jsonData);
    request.end();
});

// If their is an issue with registerign the client top the newsletter. We have added a button (TRY AGAIN) on the failure page, that will redirect you to the home route!
app.post("/failure", function(req, res){
    res.redirect("/");
});

// This below will allow Heroku to deploy our in their local server. BUT we have also kept the 'local 3000' so that we can open our app locally through the command line. Just type -> nodemon app.js
app.listen(process.env.PORT || 3000, function(){
    console.log("Server is runing on port 3000");
});

