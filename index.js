const axios = require('axios');
const express = require('express');
const app = express();
const PORT = 4000;

// const email = 'pheeraphat_p@flowaccount.com'; 
const email = 'flowaccount_test@flowaccount.com'; 
const searchApiUrl = 'https://api.hubapi.com/crm/v3/objects/contacts/search';
const contactApiUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
const meetingApiUrl = 'https://api.hubapi.com/crm/v3/objects/MEETING/batch/read';
const bearerToken = 'pat-na1-577d3958-9ac8-4d6e-af18-b2f04799d96e';

const config = {
  headers: {
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  },
};

const searchBody = {
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

const meetingProperties = [
  "hs_meeting_start_time",
  "hs_meeting_end_time",
  "hs_meeting_outcome",
  "hs_meeting_title",
  "hs_meeting_external_url",
  "hs_timestamp",
  "hubspot_owner_id",
  "hs_meeting_body",
  "hs_internal_meeting_notes",
  "hs_meeting_location",
  "hs_activity_type",
  "hs_attachment_ids"
];

app.get('/search-contact-by-id', async (req, res) => {
  try {
    // Search for contact by email
    const searchResponse = await axios.post(searchApiUrl, searchBody, config);
    const results = searchResponse.data.results;
    
    if (results.length > 0) {
      const hsObjectId = results[0].properties.hs_object_id;
      
      // Get contact details including associated meetings
      const contactResponse = await axios.get(`${contactApiUrl}/${hsObjectId}?associations=MEETING`, config);
      const contactData = contactResponse.data;
      
      // Extract meeting IDs from associations
      const meetingIds = contactData.associations.meetings.results.map(meeting => ({ id: meeting.id }));
      
      if (meetingIds.length > 0) {
        // Prepare the body for the meeting details request
        const meetingBody = {
          properties: meetingProperties,
          inputs: meetingIds
        };
        
        // Get details of the meetings
        const meetingResponse = await axios.post(meetingApiUrl, meetingBody, config);
        
        // Send the meeting details as the response
        res.json(meetingResponse.data);
      } else {
        res.status(404).json({ message: 'No meetings associated with this contact' });
      }
    } else {
      res.status(404).json({ message: 'Contact not found' });
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

module.exports = app;
