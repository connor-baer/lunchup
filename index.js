var express = require('express')
var request = require('request')
var config = require('./config.json')
var bodyParser = require('body-parser')
var app = express()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/slack/commands/lunch', urlencodedParser, (req, res) =>{
    res.status(200).end() // best practice to respond with empty 200 status code
    var reqBody = req.body
    var responseURL = reqBody.response_url
    console.log(reqBody.token);
    if (reqBody.token != config.SLACK_VERIFICATION_TOKEN) {
        res.status(403).end("Access forbidden")
    } else {
        var message = {
          response_type: 'in_channel',
          text: `Welcome to LunchUp! Feeling hungry and social?`,
          attachments: [
            {
              text: 'Would you like to be paired up for lunch with a random coworker every week?',
              fallback: 'You are unable to participate.',
              callback_id: 'wopr_game',
              color: '#3388ff',
              attachment_type: 'default',
              actions: [
                {
                  name: 'join',
                  text: 'Yes please!',
                  style: 'primary',
                  type: 'button',
                  value: 'true'
                },
                {
                  name: 'join',
                  text: "No thanks.",
                  style: 'danger',
                  type: 'button',
                  value: 'false'
                },
                {
                  name: 'join',
                  text: 'Maybe later.',
                  type: 'button',
                  value: 'later'
                }
              ]
            }
          ]
        }
        sendMessageToSlackResponseURL(responseURL, message)
    }
})

app.post('/slack/actions', urlencodedParser, (req, res) =>{
    res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
    var message = {
        "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].name,
        "replace_original": false
    }
    sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
})



function sendMessageToSlackResponseURL(responseURL, JSONmessage){
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    }
    request(postOptions, (error, response, body) => {
        if (error){
            // handle errors as you see fit
        }
    })
}

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
})
