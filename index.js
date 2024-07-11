const axios = require('axios');
const express = require('express');
const app = express();
const PORT = 4000;

const email = 'pheeraphat_p@flowaccount.com'; 
const searchApiUrl = 'https://api.hubapi.com/crm/v3/objects/contacts/search';
const contactDetailsApiUrl = 'https://api.hubapi.com/crm/v3/objects/contacts/';
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


const searchContact = async () => {
  try {
    const response = await axios.post(searchApiUrl, body, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getContactDetails = async (hsObjectId) => {
  try {
    const response = await axios.get(`${contactDetailsApiUrl}${hsObjectId}?associations=MEETING`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

app.get('/search-contact', async (req, res) => {
  try {
    const searchResult = await searchContact();
    if (searchResult.total > 0) {
      const hsObjectId = searchResult.results[0].properties.hs_object_id;
      const contactDetails = await getContactDetails(hsObjectId);
      res.json({ searchResult, contactDetails });
    } else {
      res.status(404).json({ message: 'No contact found with the given email' });
    }
  } catch (error) {
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
  }
});


app.get('/', (req, res) => {
  res.send('This is my API running');
});


app.listen(PORT, () => {
  console.log(`API Listening on PORT ${PORT}`);
});
