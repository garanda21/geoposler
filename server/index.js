import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import mysql from 'mysql';  // Changed to import

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/verify-smtp', async (req, res) => {
  const config = req.body;
  
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    await transporter.verify();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/send-email', async (req, res) => {
  const { contact, subject, content, smtpConfig } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: `"${contact.name}" <${contact.email}>`,
      subject: subject,
      html: content,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

//Endpoints for connect to a mySQL database and get settings for later use on the app useStore.ts
app.get('/api/settings', async (req, res) => {
  //const mysql = require('mysql');
  const connection = mysql.createConnection({
    host: '10.70.29.123',
    user: "root", //username  for the database   
    password: 'mypassword', //password for the database
    database: 'geoposler'
  });
  const promiseQuery = (sql) => {
    return new Promise((resolve, reject) => {
      connection.query(sql, (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  };
  try
  {
    connection.connect();
    // Fetch templates
    const templates = await promiseQuery('SELECT id, name, content FROM templates');

    // Fetch contact lists with their contacts
    const contactLists = await promiseQuery('SELECT id, name FROM contact_lists');
    for (let list of contactLists) {
      const contacts = await promiseQuery(
        `SELECT id, name, email 
        FROM contacts 
        WHERE contact_list_id = '${list.id}'`
      );
      list.contacts = contacts;
    }

    // Fetch campaigns with template and contact list names
    const campaigns = await promiseQuery(`
      SELECT 
        c.id,
        c.name,
        c.subject,
        c.template_id as templateId,
        t.name as templateName,
        c.contact_list_id as contactListId,
        cl.name as contactListName,
        c.status,
        c.sent_count as sentCount,
        c.total_count as totalCount
      FROM campaigns c
      LEFT JOIN templates t ON c.template_id = t.id
      LEFT JOIN contact_lists cl ON c.contact_list_id = cl.id
    `);

    // Fetch error details for each campaign
    for (let campaign of campaigns) {
      const errors = await promiseQuery(`
        SELECT email, error
        FROM errors
        WHERE campaign_id = '${campaign.id}'
      `);
      
      // Only add error field if there are errors
      if (errors.length > 0) {

        campaign.error = JSON.stringify(errors.map(err => ({
          email: err.email,
          error: err.error
        })));
      } else {
        campaign.error = null;
      }
    }

    // Fetch SMTP configuration
    const smtpConfig = await promiseQuery('SELECT * FROM smtp_config');
    const smtp = smtpConfig[0] || {
      host: '',
      port: 587,
      username: '',
      password: '',
      fromEmail: '',
      fromName: ''
    };

    // Construct the response object
    const response = {
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        content: t.content
      })),
      contactLists: contactLists.map(cl => ({
        id: cl.id,
        name: cl.name,
        contacts: cl.contacts.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email
        }))
      })),
      campaigns: campaigns.map(c => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        templateId: c.templateId,
        templateName: c.templateName,
        contactListId: c.contactListId,
        contactListName: c.contactListName,
        status: c.status,
        sentCount: c.sentCount,
        totalCount: c.totalCount,
        error: c.error
      })),
      smtpConfig: {
        host: smtp.host,
        port: smtp.port,
        username: smtp.username,
        password: smtp.password,
        fromEmail: smtp.fromEmail,
        fromName: smtp.fromName
      }
    };

    res.json(response);  
  }
  catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.end();
  }
});

app.post('/api/settings', async (req, res) => {
  const connection = mysql.createConnection({
    host: '10.70.29.123',
    user: "root", //username  for the database   
    password: 'mypassword', //password for the database
    database: 'geoposler'
  });

  const promiseQuery = (sql, values = []) => {
    return new Promise((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  };

  const { templates, contactLists, campaigns, smtpConfig } = req.body;

  try {
    connection.connect();
    
    // Start transaction
    await promiseQuery('START TRANSACTION');

    // Update SMTP config
    await promiseQuery(
      `UPDATE smtp_config 
       SET host = ?, port = ?, username = ?, password = ?, 
           fromEmail = ?, fromName = ? 
       WHERE id = 1`,
      [smtpConfig.host, smtpConfig.port, smtpConfig.username, 
       smtpConfig.password, smtpConfig.fromEmail, smtpConfig.fromName]
    );

    // Handle templates
    await promiseQuery('DELETE FROM templates');
    if (templates.length > 0) {
      const templateValues = templates.map(t => 
        [t.id, t.name, t.content]
      );
      await promiseQuery(
        'INSERT INTO templates (id, name, content) VALUES ?',
        [templateValues]
      );
    }

    // Handle contact lists and contacts
    await promiseQuery('DELETE FROM contacts');
    await promiseQuery('DELETE FROM contact_lists');
    
    if (contactLists.length > 0) {
      // Insert contact lists
      const contactListValues = contactLists.map(cl => 
        [cl.id, cl.name]
      );
      await promiseQuery(
        'INSERT INTO contact_lists (id, name) VALUES ?',
        [contactListValues]
      );

      // Insert contacts
      const contactValues = contactLists.flatMap(cl =>
        cl.contacts.map(c => 
          [c.id, c.name, c.email, cl.id]
        )
      );
      if (contactValues.length > 0) {
        await promiseQuery(
          'INSERT INTO contacts (id, name, email, contact_list_id) VALUES ?',
          [contactValues]
        );
      }
    }

    // Handle campaigns
    // First, clear existing errors
    await promiseQuery('DELETE FROM errors');
    await promiseQuery('DELETE FROM campaigns');

    if (campaigns.length > 0) {
      // Insert campaigns
      const campaignValues = campaigns.map(c => [
        c.id,
        c.name,
        c.subject,
        c.templateId,
        c.contactListId,
        c.status,
        c.sentCount,
        c.totalCount
      ]);
      
      await promiseQuery(
        `INSERT INTO campaigns 
         (id, name, subject, template_id, contact_list_id, 
          status, sent_count, total_count) 
         VALUES ?`,
        [campaignValues]
      );

      // Insert errors if they exist
      for (const campaign of campaigns) {
        if (campaign.error) {
          const errors = JSON.parse(campaign.error);
          if (Array.isArray(errors) && errors.length > 0) {
            const errorValues = errors.map(err => 
              [err.email, err.error, campaign.id]
            );
            await promiseQuery(
              'INSERT INTO errors (email, error, campaign_id) VALUES ?',
              [errorValues]
            );
          }
        }
      }
    }

    // Commit transaction
    await promiseQuery('COMMIT');
    
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    // Rollback on error
    await promiseQuery('ROLLBACK');
    console.error('Error saving settings:', error);
    res.status(500).json({ 
      error: 'Failed to save settings',
      details: error.message 
    });
  } finally {
    connection.end();
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});