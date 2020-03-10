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

const Curation = require("./curation"),
  Order = require("./order"),
  Response = require("./response"),
  Care = require("./care"),
  Survey = require("./survey"),
  GraphAPi = require("./graph-api"),
  i18n = require("../i18n.config");

module.exports = class Receive {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }

  // Check if the event is a message or postback and
  // call the appropriate handler function
  handleMessage(lastevent) {
    let event = this.webhookEvent;

    let responses;
    try {
      if (event.message) {
        let message = event.message;

        if (message.quick_reply) {
          responses = this.handleQuickReply();
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage(lastevent);
        } else if (message.text) {
          responses = this.handleTextMessage(lastevent);
        }
      } else if (event.postback) {
        responses = this.handlePostback();
      } else if (event.referral) {
        responses = this.handleReferral();
      }
    } catch (error) {
      console.error(error);
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`
      };
    }

    console.log("---------Este es el reponse a analizar--------");
    console.log(responses);
    console.log("-------------------------------------");

    if (Array.isArray(responses)) {
      console.log("Es un array de respuestas");
      let delay = 0;
      for (let response of responses) {
        this.sendMessage(response, delay * 2000);
        console.log("Comprobamos");
        if (response.text === i18n.__("fallback.wrong")) {
          console.log("Asignando nulo");
          responses = null;
        }
        if (response.payload === "no") {
          console.log("Asignando nulo en No");
          responses = null;
        }
        /*if (response.payload === "no_data") {
          console.log("Asignando nulo en No");
          responses = null;
        }*/
        delay++;
      }
    } else {
      console.log("Es una respuesta individual no array");
      this.sendMessage(responses);
    }

    return responses;
  }

  // Handles messages events with text
  handleTextMessage(lastevent) {
    console.log("---------Llamando a handleTextMessage----------");
    console.log("Payload handleTextMessage");
    console.log(
      "Received text:",
      `${this.webhookEvent.message.text} for ${this.user.psid}`
    );

    // check greeting is here and is confident
    console.log("Es un message nlp");
    console.log(this.webhookEvent.message.nlp);
    console.log("Entidades");
    console.log(this.webhookEvent.message.nlp.entities);

    let greeting = this.firstEntity(this.webhookEvent.message.nlp, "greetings");
    console.log("Greeting");
    console.log(greeting);
    let message = this.webhookEvent.message.text.trim().toLowerCase();
    console.log("message");
    console.log(message);
    let response;
    if (
      (greeting && greeting.confidence > 0.8) ||
      message.includes("start over")
    ) {
      response = Response.genNuxMessage(this.user);
    } else {
      if (lastevent === "getstarted") {
        response = [Response.genText(i18n.__("fallback.wrong"))];
      } else if (lastevent === "nombre") {
        let responseData = Response.genText(
          i18n.__("fallback.dni", {
            message: this.webhookEvent.message.text
          })
        );

        let payloadData = {
          payload: this.webhookEvent.message.text,
          user: this.user.psid
        };

        response = [responseData, payloadData];
      } else if (lastevent === "dni") {
        response = [Response.genText(i18n.__("fallback.birthday"))];
      } else if (lastevent === "birthday") {
        response = [Response.genText(i18n.__("fallback.cel"))];
      } else if (lastevent === "cel") {
        let celMessage = this.firstEntity(
          this.webhookEvent.message.nlp,
          "phone_number"
        );
        if (celMessage && celMessage.confidence > 0.8) {
          response = [Response.genText(i18n.__("fallback.email"))];
        } else {
          response = [Response.genText(i18n.__("fallback.wrong"))];
        }
      } else if (lastevent === "email") {
        let emailMessage = this.firstEntity(
          this.webhookEvent.message.nlp,
          "email"
        );
        if (emailMessage && emailMessage.confidence > 0.8) {
          response = [Response.genText(i18n.__("fallback.address"))];
        } else {
          response = [Response.genText(i18n.__("fallback.wrong"))];
        }
      } else if (lastevent === "address") {
        response = [Response.genText(i18n.__("fallback.photoquestion"))];
      } else if (lastevent === "when") {
        response = [Response.genText(i18n.__("fallback.scenefact"))];
      } else if (lastevent === "where") {
        response = [Response.genText(i18n.__("fallback.specificfact"))];
      }
      //how
      else if (lastevent === "yes_1") {
        response = [Response.genText(i18n.__("fallback.details1"))];
      } else if (lastevent === "yes_2") {
        response = [Response.genText(i18n.__("fallback.details2"))];
      } else if (lastevent === "yes_3") {
        response = [Response.genText(i18n.__("fallback.details3"))];
      } else if (lastevent === "yes_4") {
        response = [Response.genText(i18n.__("fallback.details4"))];
      } else if (lastevent === "recomendation1") {
        let first = Response.genText(i18n.__("fallback.recomendation1"));

        let second = Response.genQuickReply(i18n.__("fallback.evidence"), [
          {
            title: i18n.__("menu.yes"),
            payload: "accept_evidence"
          },
          {
            title: i18n.__("menu.no"),
            payload: "noaccept_evidence"
          }
        ]);
        response = [first, second];
      } else if (lastevent === "recomendation2") {
        let first = Response.genText(i18n.__("fallback.recomendation2"));

        let second = Response.genQuickReply(i18n.__("fallback.evidence"), [
          {
            title: i18n.__("menu.yes"),
            payload: "accept_evidence"
          },
          {
            title: i18n.__("menu.no"),
            payload: "noaccept_evidence"
          }
        ]);
        response = [first, second];
      } else if (lastevent === "recomendation3") {
        let first = Response.genText(i18n.__("fallback.recomendation3"));

        let second = Response.genQuickReply(i18n.__("fallback.evidence"), [
          {
            title: i18n.__("menu.yes"),
            payload: "accept_evidence"
          },
          {
            title: i18n.__("menu.no"),
            payload: "noaccept_evidence"
          }
        ]);
        response = [first, second];
      } else if (lastevent === "recomendation4") {
        let first = Response.genText(i18n.__("fallback.recomendation4"));

        let second = Response.genQuickReply(i18n.__("fallback.evidence"), [
          {
            title: i18n.__("menu.yes"),
            payload: "accept_evidence"
          },
          {
            title: i18n.__("menu.no"),
            payload: "noaccept_evidence"
          }
        ]);
        response = [first, second];
      } else {
        response = [
          Response.genText(
            i18n.__("fallback.any", {
              message: this.webhookEvent.message.text
            })
          )
        ];
      }
      console.log("Receive 114.js help");
    }

    return response;
  }

  // Handles mesage events with attachments
  handleAttachmentMessage(lastevent) {
    let response;
    let attachment = this.webhookEvent.message.attachments[0];
    console.log("Received attachment:", `${attachment} for ${this.user.psid}`);
    if (lastevent === "photoquestion") {
      response = Response.genQuickReply(
        i18n.__("fallback.preparationquestion"),
        [
          {
            title: i18n.__("menu.yes"),
            payload: "yes_confirmation"
          },
          {
            title: i18n.__("menu.no"),
            payload: "deny_confirmation"
          }
        ]
      );
      console.log("Receive.js 135 help");
      console.log("---------Llamando a handleAttachmentMessage----------");
      console.log("Payload handleAttachmentMessage");
      console.log(response);
    } else if (lastevent === "finish") {
      let first = Response.genText(i18n.__("fallback.finish1"));
      let second = Response.genText(i18n.__("fallback.finish2"));
      response = [first, second];
      console.log("---------Llamando a handleAttachmentMessage----------");
      console.log("Payload handleAttachmentMessage");
      console.log(response);
    }
    // Get the attachment
    return response;
  }

  // Handles mesage events with quick replies
  handleQuickReply() {
    // Get the payload of the quick reply
    let payload = this.webhookEvent.message.quick_reply.payload;
    console.log("---------Llamando a HandleQuickReply----------");
    console.log("Payload HandleQuickReply");
    console.log(payload);
    return this.handlePayload(payload);
  }

  // Handles postbacks events
  //El que elije que respuesta de los clicks de botones da
  handlePostback() {
    console.log("---------Llamando a HandlePostBack----------");

    let postback = this.webhookEvent.postback;
    // Check for the special Get Starded with referral
    let payload;
    if (postback.referral && postback.referral.type == "OPEN_THREAD") {
      payload = postback.referral.ref;
      console.log("Opcion Referral Empezó");
    } else {
      // Get the payload of the postback
      console.log("Opcion no Referral Probablemente menu");
      payload = postback.payload;
    }
    console.log("Payload HandlePostBack");
    console.log(payload);
    return this.handlePayload(payload.toUpperCase());
  }

  // Handles referral events
  handleReferral() {
    // Get the payload of the postback
    console.log("--Handle Referral ---");
    let payload = this.webhookEvent.referral.ref.toUpperCase();
    console.log("Payload handle referral");
    console.log(payload);
    return this.handlePayload(payload);
  }

  //en el handle Payload recibe el payload x ejmplo get started
  handlePayload(payload) {
    console.log("Received Payload:", `${payload} for ${this.user.psid}`);

    // Log CTA event in FBA
    GraphAPi.callFBAEventsAPI(this.user.psid, payload);
    //test
    let response;

    // Set the response based on the payload
    if (
      payload === "GET_STARTED" ||
      payload === "DEVDOCS" ||
      payload === "GITHUB"
    ) {
      response = Response.genNuxMessage(this.user);
    } else if (payload.includes("CURATION") || payload.includes("COUPON")) {
      let curation = new Curation(this.user, this.webhookEvent);
      response = curation.handlePayload(payload);
    } else if (payload.includes("CARE")) {
      let care = new Care(this.user, this.webhookEvent);
      response = care.handlePayload(payload);
    } else if (payload.includes("ORDER")) {
      response = Order.handlePayload(payload);
    } else if (payload.includes("CSAT")) {
      response = Survey.handlePayload(payload);
    } else if (payload.includes("CHAT-PLUGIN")) {
      response = [
        Response.genText(i18n.__("chat_plugin.prompt")),
        Response.genText(i18n.__("get_started.guidance")),
        Response.genQuickReply(i18n.__("get_started.help"), [
          {
            title: i18n.__("care.order"),
            payload: "CARE_ORDER"
          },
          {
            title: i18n.__("care.billing"),
            payload: "CARE_BILLING"
          },
          {
            title: i18n.__("care.other"),
            payload: "CARE_OTHER"
          }
        ])
      ];
    } else if (payload.includes("complaints_1")) {
      response = [
        Response.genQuickReply(
          i18n.__("complaints1flow.features_confirmation1"),
          [
            {
              title: i18n.__("menu.yes"),
              payload: "yes_1"
            },
            {
              title: i18n.__("menu.no"),
              payload: "no"
            }
          ]
        )
      ];
    } else if (payload.includes("complaints_2")) {
      response = [
        Response.genQuickReply(
          i18n.__("complaints2flow.features_confirmation2"),
          [
            {
              title: i18n.__("menu.yes"),
              payload: "yes_2"
            },
            {
              title: i18n.__("menu.no"),
              payload: "no"
            }
          ]
        )
      ];
    } else if (payload.includes("complaints_3")) {
      response = [
        Response.genQuickReply(
          i18n.__("complaints3flow.features_confirmation3"),
          [
            {
              title: i18n.__("menu.yes"),
              payload: "yes_3"
            },
            {
              title: i18n.__("menu.no"),
              payload: "no"
            }
          ]
        )
      ];
    } else if (payload.includes("complaints_4")) {
      response = [
        Response.genQuickReply(
          i18n.__("complaints4flow.features_confirmation4"),
          [
            {
              title: i18n.__("menu.yes"),
              payload: "yes_4"
            },
            {
              title: i18n.__("menu.no"),
              payload: "no"
            }
          ]
        )
      ];
    } else if (payload.includes("yes_1")) {
      let confirm = Response.genText(i18n.__("fallback.correct_option"));
      let name = Response.genText(i18n.__("get_started.input_name"));

      let payloadData = {
        payload: "yes_1",
        user: this.user.psid
      };
      response = [confirm, payloadData, name];
    } else if (payload.includes("yes_2")) {
      let confirm = Response.genText(i18n.__("fallback.correct_option"));
      let name = Response.genText(i18n.__("get_started.input_name"));

      let payloadData = {
        payload: "yes_1",
        user: this.user.psid
      };
      response = [confirm, payloadData, name];
    } else if (payload.includes("yes_3")) {
      let confirm = Response.genText(i18n.__("fallback.correct_option"));
      let name = Response.genText(i18n.__("get_started.input_name"));

      let payloadData = {
        payload: "yes_1",
        user: this.user.psid
      };
      response = [confirm, payloadData, name];
    } else if (payload.includes("yes_4")) {
      let confirm = Response.genText(i18n.__("fallback.correct_option"));
      let name = Response.genText(i18n.__("get_started.input_name"));

      let payloadData = {
        payload: "yes_1",
        user: this.user.psid
      };
      response = [confirm, payloadData, name];
    } else if (payload.includes("no")) {
      let firstResponse = Response.genQuickReply(
        i18n.__("get_started.input_select"),
        [
          {
            title: i18n.__("menu.complaints_1"),
            payload: "complaints_1"
          },
          {
            title: i18n.__("menu.complaints_2"),
            payload: "complaints_2"
          },
          {
            title: i18n.__("menu.complaints_3"),
            payload: "complaints_3"
          },
          {
            title: i18n.__("menu.complaints_4"),
            payload: "complaints_4"
          }
        ]
      );
      let payloadData = {
        payload: "no",
        user: this.user.psid
      };
      response = [firstResponse, payloadData];
    } else if (payload.includes("deny_confirmation")) {
      let first = Response.genText(i18n.__("get_started.input_name"));
      let payloadSecond = {
        payload: "deny_confirmation",
        user: this.user.psid
      };
      response = [first, payloadSecond];
    } else if (payload.includes("yes_confirmation")) {
      let first = Response.genText(i18n.__("fallback.when"));
      let payloadSecond = {
        payload: "yes_confirmation",
        user: this.user.psid
      };
      response = [first, payloadSecond];
    } else if (payload.includes("noaccept_evidence")) {
      let first = Response.genText(i18n.__("fallback.finish1"));
      let second = Response.genText(i18n.__("fallback.finish2"));
      response = [first, second];
    } else if (payload.includes("accept_evidence")) {
      let first = Response.genText(i18n.__("fallback.evidence_input"));
      response = [first];
    }

    //yes_confirmation
    else {
      response = {
        text: `This is a default postback message for payload: ${payload}!`
      };
    }
    return response;
  }

  handlePrivateReply(type, object_id) {
    console.log("Handle private replay");
    let welcomeMessage =
      i18n.__("get_started.welcome") +
      " " +
      i18n.__("get_started.guidance") +
      ". " +
      i18n.__("get_started.help");
    console.log(welcomeMessage);
    let response = Response.genQuickReply(welcomeMessage, [
      {
        title: i18n.__("menu.suggestion"),
        payload: "CURATION"
      },
      {
        title: i18n.__("menu.help"),
        payload: "CARE_HELP"
      }
    ]);
    console.log("Receive 238.js help");

    let requestBody = {
      recipient: {
        [type]: object_id
      },
      message: response
    };

    GraphAPi.callSendAPI(requestBody);
  }

  sendMessage(response, delay = 0) {
    // Check if there is delay in the response
    if ("delay" in response) {
      delay = response["delay"];
      delete response["delay"];
    }

    // Construct the message body
    let requestBody = {
      recipient: {
        id: this.user.psid
      },
      message: response
    };

    // Check if there is persona id in the response
    if ("persona_id" in response) {
      let persona_id = response["persona_id"];
      delete response["persona_id"];

      requestBody = {
        recipient: {
          id: this.user.psid
        },
        message: response,
        persona_id: persona_id
      };
    }

    setTimeout(() => GraphAPi.callSendAPI(requestBody), delay);
  }

  firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
  }
};
