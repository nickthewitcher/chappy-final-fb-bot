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
const { v4: uuidv4 } = require("uuid");
let random = uuidv4();

module.exports = class User {
  constructor(psid) {
    this.psid = psid;
    this.firstName = "";
    this.lastName = "";
    this.locale = "";
    this.timezone = "";
    this.gender = "neutral";
    this.state = "select_input";
    this.typeOfReport = "";
    this.legalName = "";
    this.legalDni = "";
    this.legalBirthday = "";
    this.cellphone = "";
    this.legalEmail = "";
    this.legaladdress = "";
    this.photoUrl = "";
    this.dateOfFact = "";
    this.addressFact = "";
    this.howFact = "";
    this.detailFact = "";
    this.evidenceUrl = "";
    this.idreport = random.substring(30, 40);
    this.idDocument = random;
  }
  setProfile(profile) {
    this.firstName = profile.firstName;
    this.lastName = profile.lastName;
    this.locale = profile.locale;
    this.timezone = profile.timezone;
    if (profile.gender) {
      this.gender = profile.gender;
    }
  }
};
