const PDF = require("pdfkit");
const fs = require("fs");
const User = require("./user");

let user = new User("001");
var doc = new PDF();

doc.pipe(fs.createWriteStream(__dirname + "/" + user.idDocument + ".pdf"));

doc.text("FORMULARIO DE RECEPCIÓN DE DENUNCIAS POLICIALES\n\n\n", {
  align: "center",
  size: "45"
});

doc.text(
  "DATOS GENERALES DEL DENUNCIANTE\n\n" +
    "Nombres y Apellidos: " +
    user.firstName +
    " " +
    user.lastName +
    "\n\n" +
    "Documento de identidad o pasaporte:" +
    user.legalDni +
    "\n\n" +
    "Fecha de nacimiento:" +
    user.legalBirthday +
    "\n\n" +
    "Nro. de celular:" +
    user.cellphone +
    "\n\n" +
    "Correo electrónico:" +
    user.legalEmail +
    "\n\n" +
    "Dirección:" +
    user.legaladdress +
    "\n\n\n" +
    "DATOS DE LA DENUNCIA\n\n\n" +
    "Tipo de denuncia:" +
    user.typeOfReport +
    "\n\n" +
    "Fecha y hora:" +
    user.dateOfFact +
    "\n\n" +
    "Lugar:" +
    user.addressFact +
    "\n\n" +
    "Relato de los hechos:" +
    user.detailFact +
    "\n\n" +
    "Evidencia:" +
    user.evidenceUrl +
    "\n\n\n" +
    "ID de denuncia:" +
    user.idReport,
  {
    align: "justified"
  }
);

doc.end();
