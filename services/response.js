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

const i18n = require("../i18n.config");

module.exports = class Response {
  static genQuickReply(text, quickReplies) {
    let response = {
      text: text,
      quick_replies: []
    };

    for (let quickReply of quickReplies) {
      response["quick_replies"].push({
        content_type: "text",
        title: quickReply["title"],
        payload: quickReply["payload"]
      });
    }

    return response;
  }

  static genGenericTemplate(image_url, title, subtitle, buttons) {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: title,
              subtitle: subtitle,
              image_url: image_url,
              buttons: buttons
            }
          ]
        }
      }
    };

    return response;
  }

  static genImageTemplate(image_url, title, subtitle = "") {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: title,
              subtitle: subtitle,
              image_url: image_url
            }
          ]
        }
      }
    };

    return response;
  }

  static genButtonTemplate(title, buttons) {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: title,
          buttons: buttons
        }
      }
    };

    return response;
  }

  static genText(text) {
    let response = {
      text: text
    };
    return response;
  }

  static genTextWithPersona(text, persona_id) {
    let response = {
      text: text,
      persona_id: persona_id
    };

    return response;
  }

  static genPostbackButton(title, payload) {
    let response = {
      type: "postback",
      title: title,
      payload: payload
    };

    return response;
  }

  static genWebUrlButton(title, url) {
    let response = {
      type: "web_url",
      title: title,
      url: url,
      messenger_extensions: true
    };

    return response;
  }
  //retorna saludo
  static genNuxMessage(user) {
    let welcome = this.genText(
      i18n.__("get_started.welcome", {
        userFirstName: user.firstName
      })
    );

    let guide = this.genText(i18n.__("get_started.guidance"));

    // let inputname = this.genText(i18n.__("get_started.input_select"));

    let inputname = this.genQuickReply(i18n.__("get_started.input_select"), [
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
    ]);

    let mypayload = {
      payload: "mygreetings"
    }

    return [welcome, guide, inputname, mypayload];
  }
};
