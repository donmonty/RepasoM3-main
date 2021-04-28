var express = require("express");
var server = express();
var bodyParser = require("body-parser");
const morgan = require('morgan');

const model = {
  clients: {},
  reset: function() { this.clients = {} },
  addAppointment: function (name, date) {
    // Update date object
    date = {...date, status: 'pending'}
    // If the client is new, add him to the client list
    if (!this.clients.hasOwnProperty([name])) {
      this.clients = { ...this.clients, [name]: [date] }
    } else {
      // If the client is NOT new, add his new appointment
      this.clients[name].push(date)
    }
  },
  attend: function (name, date) {
    const client = this.clients[name];
    const match = client.find(appointment => appointment.date === date)
    match.status = 'attended';
  },
  expire: function (name, date) {
    const client = this.clients[name];
    const match = client.find(appointment => appointment.date === date)
    match.status = 'expired';
  },
  cancel: function (name, date) {
    const client = this.clients[name];
    const match = client.find(appointment => appointment.date === date)
    match.status = 'cancelled';
  },
  erase: function (name, selector) {
    const statusCodes = ['attended', 'cancelled', 'pending', 'expired'];
    let client = this.clients[name];

    // If selector is a status
    if (statusCodes.includes(selector)) {
      this.clients[name] = client.filter(appointment => appointment.status !== selector)
    } else { // selector is a date
      this.clients[name] = client.filter(appointment => appointment.date !== selector)
    }
  },
  getAppointments: function (name, status) {
    // If status is NOT given
    if (!status) return this.clients[name];
    // If status is given
    const appointments = this.clients[name].filter(appointment => appointment.status === status);
    return appointments;
  },
  getClients: function () {
    const clientList = [];
    for (let client in this.clients) {
      clientList.push(client);
    }
    return clientList;
  }

};

//server.use(bodyParser.json());
server.use(express.json());
server.use(morgan('tiny'));

// Routes
server.get('/api', getClients);
server.post('/api/Appointments', createAppointment);


// Internal functions
function getClients(req, res) {
  const clients = model.clients
  res.status(200).send(clients);
}

function createAppointment(req, res) {
  const name = req.body.client;
  const date = req.body.appointment.date;

  if (!name) return res.status(400).send('the body must have a client property');
  if(typeof name !== 'string') return res.status(400).send('client must be a string');

  model.addAppointment(name, date);
  const newAppointment = this.clients[name][this.clients[name].length-1]
  console.log("New Appointment: ", newAppointment);
  res.status(200).send(newAppointment);
}


server.listen(9000, () => console.log('Server running at port 9000'));
module.exports = { model, server };

const modelTest = {
  clients: {
    monty: [{date: 'lunes'}, {date: 'martes'}]
  }
}