"use strict";

const fs = require("fs");
const PDFDocument = require("./pdfkit-tables");
const doc = new PDFDocument();
const i18n = require("./i18n.config");
const User = require("./services/user");

let user = new User("001");

doc.pipe(fs.createWriteStream("example.pdf"));

const table0 = {
  headers: [i18n.__("titles.titl_per_en"), " "],
  rows: [
    [i18n.__("report.fullname_en"), user.firstName + " " + user.lastName],
    [i18n.__("report.iddoc_en"), user.legalDni],
    [i18n.__("report.birthday_en"), user.legalBirthday],
    [i18n.__("report.telephone_en"), user.cellphone],
    [i18n.__("report.email_en"), user.legalEmail],
    [i18n.__("report.address_en"), user.legaladdress]
  ]
};

doc.table(table0, {
  prepareHeader: () => doc.font("Helvetica-Bold"),
  // eslint-disable-next-line no-unused-vars
  prepareRow: (row, i) => doc.font("Helvetica").fontSize(12)
});

const table1 = {
  headers: ["Country", "Conversion rate", "Trend"],
  rows: [
    ["Switzerland", "12%", "+1.12%"],
    ["France", "67%", "-0.98%"],
    ["England", "33%", "+4.44%"]
  ]
};

doc.moveDown().table(table1, 100, 350, { width: 300 });

doc.end();
