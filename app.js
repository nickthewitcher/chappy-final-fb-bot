/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */

"use strict";

// Imports dependencies and set up http server
const express = require("express"),
  { urlencoded, json } = require("body-parser"),
  crypto = require("crypto"),
  path = require("path"),
  Receive = require("./services/receive"),
  GraphAPi = require("./services/graph-api"),
  User = require("./services/user"),
  config = require("./services/config"),
  i18n = require("./i18n.config"),
  app = express();

var users = {};
// Parse application/x-www-form-urlencoded
app.use(
  urlencoded({
    extended: true
  })
);

//Test test
// Parse application/json. Verify that callback came from Facebook
app.use(json({ verify: verifyRequestSignature }));

// Serving static files in Express
app.use(express.static(path.join(path.resolve(), "public")));

// Set template engine in Express
app.set("view engine", "ejs");

// Respond with index file when a GET request is made to the homepage
app.get("/", function(_req, res) {
  res.render("index");
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === config.verifyToken) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
  let body = req.body;
  //test
  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      if ("changes" in entry) {
        console.log("Changes Happend");
        // Handle Page Changes event
        let receiveMessage = new Receive();
        if (entry.changes[0].field === "feed") {
          let change = entry.changes[0].value;
          switch (change.item) {
            case "post":
              return receiveMessage.handlePrivateReply(
                "post_id",
                change.post_id
              );
              break;
            case "comment":
              return receiveMessage.handlePrivateReply(
                "commentgity _id",
                change.comment_id
              );
              break;
            default:
              console.log("Unsupported feed change type.");
              return;
          }
        }
      }

      // Gets the body final of the webhook event
      let webhook_event = entry.messaging[0];
      //console.log("Gets the body of the webhook event ");
      //console.log(webhook_event);

      // Discard uninteresting events
      if ("read" in webhook_event) {
        //console.log("Got a read event xd ");
        return;
      }

      if ("delivery" in webhook_event) {
        //console.log("Got a delivery event xd");
        return;
      }

      // Get the sender PSID
      let senderPsid = webhook_event.sender.id;

      if (!(senderPsid in users)) {
        let user = new User(senderPsid);
        console.log("Entro a Crear User");
        GraphAPi.getUserProfile(senderPsid)
          .then(userProfile => {
            user.setProfile(userProfile);
          })
          .catch(error => {
            // The profile is unavailable
            console.log("Profile is unavailable:", error);
          })
          .finally(() => {
            users[senderPsid] = user;
            i18n.setLocale(user.locale);
            console.log(
              "New Profile PSID:",
              senderPsid,
              "with locale:",
              i18n.getLocale()
            );
            console.log("Full user");
            console.log(users[senderPsid]);
            let receiveMessage = new Receive(users[senderPsid], webhook_event);
            return receiveMessage.handleMessage(user.state);
          });
      } else {
        console.log("Entro a Asignar User");
        i18n.setLocale(users[senderPsid].locale);
        console.log(
          "Profile already exists PSID:",
          senderPsid,
          "with locale:",
          i18n.getLocale()
        );
        console.log("Full user");
        console.log(users[senderPsid]);
        let receiveMessage = new Receive(users[senderPsid], webhook_event);
        try {
          if (webhook_event.postback) {
            if (webhook_event.postback.title) {
              if (webhook_event.postback.title === "Get Started") {
                console.log("Inicializamos en postback get started");
                users[senderPsid].state = "getstarted";
                users[senderPsid].typeOfReport = "";
                users[senderPsid].legalName = "";
                users[senderPsid].legalDni = "";
                users[senderPsid].legalBirthday = "";
                users[senderPsid].cellphone = "";
                users[senderPsid].legalEmail = "";
                users[senderPsid].legaladdress = "";
                users[senderPsid].photoUrl = "";
                users[senderPsid].dateOfFact = "";
                users[senderPsid].addressFact = "";
                users[senderPsid].howFact = "";
                users[senderPsid].detailFact = "";
                users[senderPsid].evidenceUrl = "";
              }
            }
          }
          //webhookEvent.message.quick_reply.payload
          if (webhook_event.message) {
            if (webhook_event.message.quick_reply) {
              if (webhook_event.message.quick_reply.payload) {
                if (
                  webhook_event.message.quick_reply.payload ===
                  "deny_confirmation"
                ) {
                  users[senderPsid].state = "nombre";
                }
              }
            }
          }
        } catch (error) {
          console.error(error);
          console.log(`An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`);
        }
        console.log("Envia el mensaje a analizar si es un message or postback");
        console.log("-------------------------------------");
        console.log("Estado a entrar");
        console.log(users[senderPsid].state);
        let varResponse = receiveMessage.handleMessage(users[senderPsid].state);
        if (varResponse != null) {
          if (varResponse.length === 4) {
            if (varResponse[3].payload === "mygreetings") {
              console.log("My greetings");
              users[senderPsid].state = "getstarted";
              users[senderPsid].typeOfReport = "";
              users[senderPsid].legalName = "";
              users[senderPsid].legalDni = "";
              users[senderPsid].legalBirthday = "";
              users[senderPsid].cellphone = "";
              users[senderPsid].legalEmail = "";
              users[senderPsid].legaladdress = "";
              users[senderPsid].photoUrl = "";
              users[senderPsid].dateOfFact = "";
              users[senderPsid].addressFact = "";
              users[senderPsid].howFact = "";
              users[senderPsid].detailFact = "";
              users[senderPsid].evidenceUrl = "";
            }
          }
        }
        console.log("El response a retornar:");
        console.log(varResponse);
        if (users[senderPsid].state === "getstarted" && varResponse != null) {
          users[senderPsid].state = "select_input";
        } else if (
          users[senderPsid].state === "select_input" &&
          varResponse != null
        ) {
          console.log(
            "complaintType a asignar: " + varResponse[1].complaintType
          );
          users[senderPsid].complaintType = varResponse[1].complaintType;
          users[senderPsid].state = "confirm_input";
        } else if (
          users[senderPsid].state === "confirm_input" &&
          varResponse != null
        ) {
          console.log("Confirmacion a asignar: " + varResponse[1].payload);
          users[senderPsid].typeOfReport = varResponse[1].payload;
          users[senderPsid].state = "nombre";
        } else if (
          users[senderPsid].state === "nombre" &&
          varResponse != null
        ) {
          console.log("Confirmacion a asignar: " + varResponse[1].payload);
          users[senderPsid].legalName = varResponse[1].payload;
          users[senderPsid].state = "dni";
        } else if (users[senderPsid].state === "dni" && varResponse != null) {
          users[senderPsid].state = "birthday";
        } else if (
          users[senderPsid].state === "birthday" &&
          varResponse != null
        ) {
          users[senderPsid].state = "cel";
        } else if (users[senderPsid].state === "cel" && varResponse != null) {
          users[senderPsid].state = "email";
        } else if (users[senderPsid].state === "email" && varResponse != null) {
          users[senderPsid].state = "address";
        } else if (
          users[senderPsid].state === "address" &&
          varResponse != null
        ) {
          users[senderPsid].state = "photoquestion";
        } else if (
          users[senderPsid].state === "photoquestion" &&
          varResponse != null
        ) {
          users[senderPsid].state = "preparationquestion";
        } else if (
          users[senderPsid].state === "preparationquestion" &&
          varResponse != null
        ) {
          users[senderPsid].state = "when";
        } else if (users[senderPsid].state === "when" && varResponse != null) {
          users[senderPsid].state = "where";
        } else if (users[senderPsid].state === "where" && varResponse != null) {
          if (users[senderPsid].typeOfReport === "yes_1") {
            users[senderPsid].state = "recomendation1";
          }
          if (users[senderPsid].typeOfReport === "yes_2") {
            users[senderPsid].state = "recomendation2";
          }
          if (users[senderPsid].typeOfReport === "yes_3") {
            users[senderPsid].state = "recomendation3";
          }
          if (users[senderPsid].typeOfReport === "yes_4") {
            users[senderPsid].state = "recomendation4";
          }
        } else if (
          users[senderPsid].state === "recomendation1" ||
          users[senderPsid].state === "recomendation2" ||
          users[senderPsid].state === "recomendation3" ||
          users[senderPsid].state === "recomendation4"
        ) {
          users[senderPsid].state = "evidence";
        } else if (
          users[senderPsid].state === "evidence" &&
          varResponse != null
        ) {
          users[senderPsid].state = "finish";
        }
        console.log("Estado cambiado");
        console.log("-------------------------------------");
        console.log(users[senderPsid].state);
        return varResponse;
      }
    });
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    console.log("Not found 404");
    res.sendStatus(404);
  }
});

// Set up your App's Messenger Profile
app.get("/profile", (req, res) => {
  let token = req.query["verify_token"];
  let mode = req.query["mode"];

  if (!config.webhookUrl.startsWith("https://")) {
    res.status(200).send("ERROR - Need a proper API_URL in the .env file");
  }
  var Profile = require("./services/profile.js");
  Profile = new Profile();
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    if (token === config.verifyToken) {
      if (mode == "webhook" || mode == "all") {
        Profile.setWebhook();
        res.write(
          `<p>Set app ${config.appId} call to ${config.webhookUrl}</p>`
        );
      }
      if (mode == "profile" || mode == "all") {
        Profile.setThread();
        res.write(`<p>Set Messenger Profile of Page ${config.pageId}</p>`);
      }
      if (mode == "personas" || mode == "all") {
        Profile.setPersonas();
        res.write(`<p>Set Personas for ${config.appId}</p>`);
        res.write(
          "<p>To persist the personas, add the following variables \
          to your environment variables:</p>"
        );
        res.write("<ul>");
        res.write(`<li>PERSONA_BILLING = ${config.personaBilling.id}</li>`);
        res.write(`<li>PERSONA_CARE = ${config.personaCare.id}</li>`);
        res.write(`<li>PERSONA_ORDER = ${config.personaOrder.id}</li>`);
        res.write(`<li>PERSONA_SALES = ${config.personaSales.id}</li>`);
        res.write("</ul>");
      }
      if (mode == "nlp" || mode == "all") {
        GraphAPi.callNLPConfigsAPI();
        res.write(`<p>Enable Built-in NLP for Page ${config.pageId}</p>`);
      }
      if (mode == "domains" || mode == "all") {
        Profile.setWhitelistedDomains();
        res.write(`<p>Whitelisting domains: ${config.whitelistedDomains}</p>`);
      }
      if (mode == "private-reply") {
        Profile.setPageFeedWebhook();
        res.write(`<p>Set Page Feed Webhook for Private Replies.</p>`);
      }
      res.status(200).end();
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    // Returns a '404 Not Found' if mode or token are missing
    res.sendStatus(404);
  }
});

// Verify that the callback came from Facebook.
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    console.log("Couldn't validate the signature.");
  } else {
    var elements = signature.split("=");
    var signatureHash = elements[1];
    var expectedHash = crypto
      .createHmac("sha1", config.appSecret)
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

// Check if all environment variables are set
config.checkEnvVariables();

// listen for requests :)
var listener = app.listen(config.port, function() {
  console.log("Your app is listening on port " + listener.address().port);

  if (
    Object.keys(config.personas).length == 0 &&
    config.appUrl &&
    config.verifyToken
  ) {
    console.log(
      "Is this the first time running?\n" +
        "Make sure to set the both the Messenger profile, persona " +
        "and webhook by visiting:\n" +
        config.appUrl +
        "/profile?mode=all&verify_token=" +
        config.verifyToken
    );
  }

  if (config.pageId) {
    console.log("Test your app by messaging:");
    console.log("https://m.me/" + config.pageId);
  }
});
