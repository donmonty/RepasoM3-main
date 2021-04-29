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

server.use(bodyParser.json());
//server.use(express.json());
server.use(morgan('tiny'));

// Routes
server.get('/api', getClients);
server.post('/api/Appointments', createAppointment);
server.get('/api/Appointments/clients', getAllClients);
server.get('/api/Appointments/:name', getClientAppointments);
server.get('/api/Appointments/:name/erase', deleteAppointment);
server.get('/api/Appointments/getAppointments/:name', getAppointments);


// Internal functions
function getClients(req, res) {
  const clients = model.clients
  res.status(200).send(clients);
}

function createAppointment(req, res) {
  //console.log(req.body)
  const name = req.body.client;
  const date = req.body.appointment;

  if (!name) return res.status(400).send('the body must have a client property');
  if(typeof name !== 'string') return res.status(400).send('client must be a string');

  model.addAppointment(name, date);
  
  const newAppointment = model.clients[name].find(appointment => appointment.date === date.date)
  //console.log("New Appointment: ", newAppointment);
  res.status(200).send(newAppointment);
}

function getClientAppointments(req, res) {
  const name = req.params.name;
  const date = req.query.date
  const option = req.query.option

  const validOptions = ['attend', 'expire', 'cancel']
  const client = model.clients[name];

  // Respond with 400 if client does not exist
  if(!client) return res.status(400).send('the client does not exist');

  // If client does exist, but does not have an appointment for this date
  const dateMatch = client.find(appointment => appointment.date === date);
  if (!dateMatch) return res.status(400).send('the client does not have a appointment for that date');

  // If option is not 'attend', 'cancel' or 'expire', respond with 400 and string
  if (!validOptions.includes(option)) return res.status(400).send('the option must be attend, expire or cancel');

  // PERFORM STATUS UPDATES
  // console.log("Re.query: ", req.query)
  // console.log("name: ", name);
  // console.log("date: ", date);
  // console.log("option: ", option);
  // console.log("DateMatch: ", dateMatch);

  if (option === 'attend') {
    //console.log("The option is ATTEND")
    dateMatch.status = 'attended';
    //console.log("Updated dateMatch: ", dateMatch);
    //console.log("The client's appointments: ", client)
    return res.status(200).send(dateMatch);
  }

  if (option === 'expire') {
    dateMatch.status = 'expired';
    return res.status(200).send(dateMatch);
  }
  
  if (option === 'cancel') {
    dateMatch.status = 'cancelled';
    return res.status(200).send(dateMatch);
  }
}

function deleteAppointment(req, res) {
  const name = req.params.name;
  const date = req.query.date;

  const client = model.clients[name];
  const statusCodes = ["pending", "attended", "expired", "cancelled"];

  // console.log("Name: ", name);
  // console.log("Date: ", date);
  // console.log("Client Appointments: ", client);

  // Respond 400 if client does not exist
  if (!client) return res.status(400).send('the client does not exist');

  // Check if 'date' parameter is a date or a status
  if (statusCodes.includes(date)) { // It is a status code
    // Save deleted appointmens for later
    const deleted = model.clients[name].filter(appointment => appointment.status === date);
    // Eliminate all the client's appointments that have the given status code
    model.clients[name] = model.clients[name].filter(appointment => appointment.status !== date);
    // Return deleted appointments
    return res.status(200).send(deleted);
  }

  // Date is a date
  // Save appointment to delete for later
  const deleted = model.clients[name].filter(appointment => appointment.date === date);
  // Delete appointment
  model.clients[name] = model.clients[name].filter(appointment => appointment.date !== date);
  res.status(200).send(deleted);

}

function getAppointments(req, res) {
  const name = req.params.name;
  const status = req.query.status;

  // Get appointments with selected status
  //const selectedAppointments = model.clients[name].filter(appointment => appointment.status === status);
  
  const selectedAppointments = model.getAppointments(name, status);
  res.status(200).send(selectedAppointments);
}

function getAllClients(req, res) {
  const clients = model.getClients();
  console.log(clients)
  res.status(200).send(clients);
}

server.listen(9000, () => console.log('Server running at port 9000'));
module.exports = { model, server };

const modelTest = {
  clients: {
    monty: [{date: 'lunes'}, {date: 'martes'}]
  }
}