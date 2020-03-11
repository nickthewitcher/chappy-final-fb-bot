"use strict";

const fs = require("fs");
const PDFDocument = require("./pdfkit-tables");
const doc = new PDFDocument();
const i18n = require("./i18n.config");
const User = require("./services/user");

let user = new User("001");

doc.pipe(fs.createWriteStream(__dirname + "/" + user.idDocument + ".pdf"));

doc.text(
  i18n.__("report.idreport_en") + user.idreport,
  {
    align: "right"
  },
  70
);

doc.text(i18n.__("titles.title_en") + "\n\n\n\n\n", 130, 70);

doc.image("./public/logo_police.png", 70, 40, {
  fit: [50, 50],
  align: "center",
  valign: "center"
});

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

const table1 = {
  headers: [i18n.__("titles.title_com_en"), " "],
  rows: [
    [i18n.__("report.type_en"), user.typeOfReport],
    [i18n.__("report.datetime_en"), user.dateOfFact],
    [i18n.__("report.place_en"), user.addressFact],
    [i18n.__("report.details_en"), user.detailFact],
    [i18n.__("report.evidence_en"), user.evidenceUrl]
  ]
};

doc.table(table0, table1, {
  prepareHeader: () => doc.font("Helvetica-Bold").fontsize(12),
  // eslint-disable-next-line no-unused-vars
  prepareRow: (row, i) => doc.font("Helvetica").fontSize(10)
});

doc.moveDown().table(table1, 70, 360);

doc.moveDown();
doc.text(
  "____________________________\n" + i18n.__("report.sign_authority"),
  350,
  670
);

doc.text(
  "____________________________\n" +
    i18n.__("report.sign_complainant") +
    "\n" +
    user.firstName +
    " " +
    user.lastName,
  70,
  670,
  {
    align: "left"
  }
);

doc.end();
