var express = require("express");
var server = express();
var bodyParser = require("body-parser");

// Middleware
server.use(express.json());

var model = {
  clients: {},
  reset: function () {
    this.clients = {};
  },
  addAppointment: function (name, fecha) {
    // date --> {date: "04/06/1989"}
    const newDay = { date: fecha.date, status: `pending` };
    if (this.clients[name]) {
      this.clients[name].push(newDay);
    } else {
      this.clients[name] = [newDay];
    }
  },
  attend: function (name, fecha) {
    // javier, {date: "04/06/1989"}
    // find devuelve el primer elemento que coincide con la busqueda
    // filter devuelve todos los elemento que coincidan con la busqueda
    // findIndex devuelve true o false --> 0 o -1
    const dateFind = this.clients[name].find((d) => d.date === fecha);
    dateFind.status = "attended";
  },
  expire: function (name, fecha) {
    const dateFind = this.clients[name].find((d) => d.date === fecha);
    dateFind.status = "expired";
  },
  cancel: function (name, fecha) {
    // model.attend("javier", "22/10/2020 16:00");
    const dateFind = this.clients[name].find((d) => d.date === fecha);
    // dateFind [{date: "22/10/2020", status: `pending`}, {date: "22/10/2020", status: `pending`}]
    dateFind.status = "cancelled";
  },
  erase: function (name, dato) {
    // fecha es un status
    // encontrar el appoiment a borrar
    // y borrarlo
    const allState = ["attended", "expired", "cancelled"];
    // fecha --> "04/06/1989" O status --> `cancell`
    const isOrNot = allState.includes(dato); // true or false

    if (isOrNot)
      return (this.clients[name] = this.clients[name].filter(
        (d) => d.status !== dato // `cancell`
      ));
    return (this.clients[name] = this.clients[name].filter(
      (d) => d.date !== dato // "04/06/1989"
    ));
  },
  getAppointments: function (name, status) {
    if (status) return this.clients[name].filter((d) => d.status === status);
    return this.clients[name];
  },
  getClients: function () {
    let box = [];
    // Object.values(this.clients);
    // for in te devuelve los indice de un array
    // for of te devuelve los valores de un array
    for (const key in this.clients) {
      box.push(key);
    }
    return box;
  },
};

server.get("/api", (req, res) => {
  return res.status(200).json(model.clients);
});

server.post("/api/Appointments", (req, res) => {
  const { client, appointment } = req.body;

  if (!client) {
    return res.status(400).send("the body must have a client property");
  }
  if (typeof client !== "string") {
    return res.status(400).send("client must be a string");
  }

  model.addAppointment(client, appointment);

  const finded = model.clients[client].find((d) => d.date === appointment.date);
  return res.status(200).json(finded);
});

server.get("/api/Appointments/:name", (req, res) => {
  const { name } = req.params;
  const { date, option } = req.query;
  const allState = ["attend", "expire", "cancel"];

  if (!model.clients[name]) {
    return res.status(400).send("the client does not exist");
  }
  const finded = model.clients[name].find((d) => d.date === date);
  if (!finded) {
    return res
      .status(400)
      .send("the client does not have a appointment for that date");
  }
  const statusFind = allState.some((status) => status === option);

  if (!statusFind) {
    return res.status(400).send("the option must be attend, expire or cancel");
  }

  model[option](name, date);

  return res.status(200).json(finded);
});

server.listen(666);
module.exports = { model, server };
