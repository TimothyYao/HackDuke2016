'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()



app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())
app.use(express.static(__dirname));
// Index route
app.get('/', function (req, res) {

    //res.render(render);
    res.sendFile('webapp/index.html');

})
app.get('/site', function (req, res) {
  res.sendFile('site/index.html')
})

// app.post('/createEvent', function(req, res) {
//   console.log('hello');
//   processFormFieldsIndividual(req, res);
// })

// //process submitted forms
// function processAllFieldsOfTheForm(req, res) {
//     var form = new formidable.IncomingForm();

//     form.parse(req, function (err, fields, files) {
//         //Store the data from the fields in your data store.
//         //The data store could be a file or database or any other store based
//         //on your application.
//         res.writeHead(200, {
//             'content-type': 'text/plain'
//         });
//         res.write('received the data:\n\n');
//         res.end(util.inspect({
//             fields: fields,
//             files: files
//         }));
//     });
// }

// function processFormFieldsIndividual(req, res) {
//     //Store the data from the fields in your data store.
//     //The data store could be a file or database or any other store based
//     //on your application.
//     var fields = [];
//     var form = new formidable.IncomingForm();
//     form.on('field', function (field, value) {
//         console.log(field);
//         console.log(value);
//         fields[field] = value;
//     });

//     form.on('end', function () {
//         res.writeHead(200, {
//             'content-type': 'text/plain'
//         });
//         res.write('received the data:\n\n');
//         res.end(util.inspect({
//             fields: fields
//         }));
//     });
//     form.parse(req);
// }


// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

const token = "EAACZBKrK1208BAIOZAlGbHWYEZAP3nZBaFGr8bicww1w6N9hYRaAS5XYKdVXC3qXZBh0OMZADWUc1pz6y9YPyZASQXUkq5Absvt8FtTcah5VwXdGXTsEDS52jU1AaUTpGV0Ptul5WZAZAIzPDPqRumeBmxu4hdOOh4KyFFLHRi6RgtwZDZD"

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        var sender = event.sender.id
        if (event.message) {
          console.log(event.message)
          if (event.message.text) {

            let text = event.message.text
            console.log("sender is :" + sender)

            let lowerText = text.toLowerCase();
            if (lowerText.includes("start")) {
                let firstName = getFirstName(sender)
                sendTextMessage(sender, "Hello, " + firstName)
                setTimeout(function() { sendServiceOptions(sender) }, 1000)
                continue
            }
            // if (text === "Environment") {
            //     setTimeout(function() { findEnvironmentEvents(sender) }, 5000)
            //     continue
            // }
            // if (text === "Health") {
            //     setTimeout(function() { findHealthEvents(sender) }, 5000)
            //     continue
            // }
            // if (text === "Poverty") {
            //     fsetTimeout(function() { findPovertyEvents(sender) }, 5000)
            //     continue
            // }
            if (lowerText === 'help') {
                sendTextMessage(sender, 'Type \"start\" to begin your search!')
                continue
            }
            if (lowerText === 'location') {
                sendLocationRequest(sender);
                continue
            }
            if (lowerText === 'generic') {
                sendGenericMessage(sender)
                continue
            }
            if (lowerText.includes("something")) {
                sendGenericMessage(sender)
                continue
            }
            // if (attached && (attached.payload.type === "location")) {
            //     sendGenericMessage(sender)
            //     continue
            // }

            sendTextMessage(sender, 'Could not understand "' + text.substring(0, 320) + '".\nTry typing "help" for more information!')
          }
          if(event.message.attachments) {
            console.log("message has an attachment")
            let lat = event.message.attachments[0].payload.coordinates.lat
            let long = event.message.attachments[0].payload.coordinates.long

            sendTextMessage(sender, "Your coordinates are: " + lat + ", " + long)
          }
        }
        // if (event.message && event.message.attachments) {
        //   if(even.message.attachments.type === "location") {
        //     console.log(event.message.attachment)
        //     sendTextMessage(sender, "attachment!!!")
        //     sendTextMessage(sender, event.message.attachments.payload.coordinates);
        // }
        // }

        // if(event.message && event.message.attatchment) {
        //
        //     lat = event.message.attatchments[0].payload.coordinates.lat
        //     lng = event.message.attatchments[0].payload.coordinates.long
        //
        //     sendTextMessage(sender, "Your coordinates are: " + lat + ", " + long)
        // }
    }
    res.sendStatus(200)
})

function findEnvironmentEvents(sender) {
    sendLocationRequest(sender);
    let link1 = "https://www.facebook.com/events/334490960257445/"
    sendTextMessage(sender, "Here's some events that I found!")
    sendTextMessage(sender, link1);
}

function findHealthEvents(sender) {
    sendLocationRequest(sender);
    let link1 = "https://www.facebook.com/events/1795108914099674/"
    sendTextMessage(sender, "Here's some events that I found!")
    sendTextMessage(sender, link1);
}

function findPovertyEvents(sender) {
    sendLocationRequest(sender);
    let link1 = "https://www.facebook.com/events/334490960257445/"
    sendTextMessage(sender, "Here's some events that I found!")
    sendTextMessage(sender, link1);
}

function sendLocationRequest(sender) {
  let messageData = {
    "text":"Please share your location:",
    "quick_replies":[
      {
        "content_type":"location",
      }
    ]
  }
  sendResponse(sender, messageData)
}

function sendServiceOptions(sender) {
    let messageData = {
        "text":"What type of service are you interested in?",
        "quick_replies":[
          {
              "content_type":"text",
              "title":"Environment",
              "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ENVIRONMENT"
          },
          {
              "content_type":"text",
              "title":"Health",
              "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_HEALTH"
          },
          {
              "content_type":"text",
              "title":"Poverty",
              "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_POVERTY"
          }
        ]
    }
    sendResponse(sender, messageData)
}

function sendResponse(sender, data, callback) {
  let messageData = data
  request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
          recipient: {id:sender},
          message: messageData,
      }
  }, function(error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error)
      } else if (response.body.error) {
        console.log('Error: ', response.body.error)
        console.log(data)
        console.log(sender)
      } else {
        console.log("Message successfully sent")
      }
  })
  if (typeof callback === "function") {
       callback();
   }
}

function sendTextMessage(sender, text) {
    sendResponse(sender, { text:text });
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function getFirstName(sender) {
    // let queryUrl = 'https://graph.facebook.com/v2.6/' + sender.id + '?fields=first_name&access_token=' + token;
    // var userID = "/"+sender.id;
    // FB.api(userID, {fields: 'last_name'}, function(response) {
    //   console.log(response)
    // });
    // request({
    //     url: queryUrl,
    //     method: 'GET',
    //     qs: sender,
    // }, function(error, response, body) {

    // })
    return "friend!";
}
