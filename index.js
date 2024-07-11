const express = require('express')
const app = express()
const PORT = 4000

const email = 'pheeraphat_p@flowaccount.com';  // Replace with the email you want to search for
const apiUrl = 'https://api.hubapi.com/crm/v3/objects/contacts/search';
const bearerToken = 'pat-na1-577d3958-9ac8-4d6e-af18-b2f04799d96e';

const config = {
  headers: {
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  },
};

const body = {
  filterGroups: [
    {
      filters: [
        {
          propertyName: 'email',
          operator: 'EQ',
          value: email,
        },
      ],
    },
  ],
};

app.get('/search-contact-by-id', (req, res) => {
  axios.post(apiUrl, body, config)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      if (error.response) {
        res.status(error.response.status).json({
          message: 'Server-side error',
          details: error.response.data,
        });
      } else if (error.request) {
        res.status(500).json({
          message: 'No response received from the server',
          details: error.request,
        });
      } else {
        res.status(500).json({
          message: 'Error message',
          details: error.message,
        });
      }
    });
});


app.get('/', (req, res) => {
  res.send('This is my API running')
})

app.listen(PORT, () => {
  console.log(`API Listening on PORT ${PORT}`)
})


module.exports = app