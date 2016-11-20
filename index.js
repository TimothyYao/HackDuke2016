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

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

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
        let sender = event.sender.id
        if (event.message) {
          if (event.message.text) {
            let text = event.message.text
            console.log("sender is: " + sender)

            let lowerText = text.toLowerCase();
            if (lowerText.includes("start")) {
                var firstName = getFirstName(sender)
                sendTextMessage(sender, "Hello, " + firstName)
                sendServiceOptions(sender);
                continue
            }
            if (text === 'help') {
                sendTextMessage(sender, "Sorry, the help page has not yet been updated :C")
                continue
            }
            if (lowerText === 'location') {
              sendLocationRequest(sender);
              continue
            }
            if (text === 'Generic') {
                sendGenericMessage(sender)
                continue
            }
            if (text.includes("something")) {
                sendGenericMessage(sender)
                continue
            }
            // if (attached && (attached.payload.type === "location")) {
            //     sendGenericMessage(sender)
            //     continue
            // }

            sendTextMessage(sender, "Could not understand \"" + text.substring(0, 320) + "\".\nTry typing \"help\" for more information!")
          }
          console.log(event.message);
          if(event.message.attachment) {
            console.log("message has an attachment")
              lat = event.message.attachments[0].payload.coordinates.lat
              lng = event.message.attachments[0].payload.coordinates.long

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

function sendLocationRequest(sender) {
  let messageData = {
    "text":"Please share your location:",
    "quick_replies":[
      {
        "content_type":"location",
      }
    ]
  }
  sendResponse(sender, messageData);
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
    sendResponse(sender, messageData);
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
