const PDF = require("pdfkit"),
  fs = require("fs"),
  User = require("./services/user"),
  i18n = require("./i18n.config");

let user = new User("001");

var doc = new PDF();

doc.pipe(fs.createWriteStream(__dirname + "/" + user.idDocument + ".pdf"));

doc.text(i18n.__("titles.title_en") + "\n\n\n", {
  align: "center",
  size: "45px"
});

doc
  .image("./public/escudo_pnp.png", 430, 15, {
    fit: [100, 100],
    align: "center",
    valign: "center"
  })
  .rect(430, 15, 100, 100);

doc.text(
  i18n.__("titles.titl_per_en") +
    "\n\n" +
    i18n.__("report.fullname_en") +
    user.firstName +
    " " +
    user.lastName +
    "\n\n" +
    i18n.__("report.iddoc_en") +
    user.legalDni +
    "\n\n" +
    i18n.__("report.birthday_en") +
    user.legalBirthday +
    "\n\n" +
    i18n.__("report.telephone_en") +
    user.cellphone +
    "\n\n" +
    i18n.__("report.email_en") +
    user.legalEmail +
    "\n\n" +
    i18n.__("report.address_en") +
    user.legaladdress +
    "\n\n\n" +
    i18n.__("titles.title_com_en") +
    "\n\n\n" +
    i18n.__("report.type_en") +
    user.typeOfReport +
    "\n\n" +
    i18n.__("report.datetime_en") +
    user.dateOfFact +
    "\n\n" +
    i18n.__("report.place_en") +
    user.addressFact +
    "\n\n" +
    i18n.__("report.details_en") +
    user.detailFact +
    "\n\n" +
    i18n.__("report.evidence_en") +
    user.evidenceUrl +
    "\n\n\n" +
    i18n.__("report.idreport_en") +
    user.idreport,
  {
    align: "justified"
  }
);

doc.end();
