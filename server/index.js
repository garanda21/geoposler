import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import mysql from 'mysql';
import { format } from 'date-fns';

const app = express();
app.use(cors());
app.use(express.json());

// Validate DB environment variables
const requiredDbVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredDbVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

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
  const connection = mysql.createConnection(dbConfig);
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
        c.total_count as totalCount,
        c.create_date as createDate
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
        createDate: format(new Date(c.createDate), 'dd/MM/yyyy HH:mm:ss'),
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
  const connection = mysql.createConnection(dbConfig);

  const promiseQuery = (sql, values = []) => {
    return new Promise((resolve, reject) => {
      connection.query(sql, values, (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  };

  const { smtpConfig, action, data } = req.body;

  try {
    connection.connect();
    await promiseQuery('START TRANSACTION');

    // Handle SMTP config update if provided
    if (smtpConfig) {
      await promiseQuery(
        `UPDATE smtp_config 
         SET host = ?, port = ?, username = ?, password = ?, 
             fromEmail = ?, fromName = ? 
         WHERE id = 1`,
        [smtpConfig.host, smtpConfig.port, smtpConfig.username, 
         smtpConfig.password, smtpConfig.fromEmail, smtpConfig.fromName]
      );
    }

    // Handle other actions based on action type
    if (action && data) {
      console.log("ACTION:", action);
      console.log("DATA:", data);
      switch (action.type) {
        case 'ADD_TEMPLATE':
          await promiseQuery(
            'INSERT INTO templates (id, name, content) VALUES (?, ?, ?)',
            [data.id, data.name, data.content]
          );
          break;

        case 'UPDATE_TEMPLATE':
          // Build the query dynamically based on what fields are provided
          const updateFields = [];
          const updateValues = [];

          if (data.name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(data.name);
          }
          if (data.content !== undefined) {
            updateFields.push('content = ?');
            updateValues.push(data.content);
          }

          // Add the id for the WHERE clause
          updateValues.push(data.id);

          // Only proceed if there are fields to update
          if (updateFields.length > 0) {
            const updateQuery = `
              UPDATE templates 
              SET ${updateFields.join(', ')} 
              WHERE id = ?
            `;
            await promiseQuery(updateQuery, updateValues);
          }
          break;

        case 'DELETE_TEMPLATE':
          await promiseQuery('DELETE FROM templates WHERE id = ?', [data.id]);
          break;

        case 'ADD_CONTACT_LIST':
          await promiseQuery(
            'INSERT INTO contact_lists (id, name) VALUES (?, ?)',
            [data.id, data.name]
          );
          if (data.contacts && data.contacts.length > 0) {
            const contactValues = data.contacts.map(c => 
              [c.id, c.name, c.email, data.id]
            );
            await promiseQuery(
              'INSERT INTO contacts (id, name, email, contact_list_id) VALUES ?',
              [contactValues]
            );
          }
          break;

        case 'UPDATE_CONTACT_LIST':
          if (data.contacts) {
            // Delete existing contacts and insert new ones
            await promiseQuery('DELETE FROM contacts WHERE contact_list_id = ?', [data.id]);
            if (data.contacts.length > 0) {
              const contactValues = data.contacts.map(c => 
                [c.id, c.name, c.email, data.id]
              );
              await promiseQuery(
                'INSERT INTO contacts (id, name, email, contact_list_id) VALUES ?',
                [contactValues]
              );
            }
          }
          break;

        case 'DELETE_CONTACT_LIST':
          // Contacts will be deleted automatically due to foreign key constraint
          await promiseQuery('DELETE FROM contact_lists WHERE id = ?', [data.id]);
          break;

        case 'ADD_CAMPAIGN':
          // Convert the formatted date string back to MySQL datetime format
          const parsedDate = new Date(data.createDate);
          const mysqlDateTime = format(parsedDate, 'yyyy-MM-dd HH:mm:ss');
          
          await promiseQuery(
            `INSERT INTO campaigns 
             (id, name, subject, template_id, contact_list_id, 
              status, sent_count, total_count, create_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.id, data.name, data.subject, data.templateId,
             data.contactListId, data.status, data.sentCount, data.totalCount, mysqlDateTime]
          );
          if (data.error) {
            const errors = JSON.parse(data.error);
            if (Array.isArray(errors) && errors.length > 0) {
              const errorValues = errors.map(err => 
                [err.email, err.error, data.id]
              );
              await promiseQuery(
                'INSERT INTO errors (email, error, campaign_id) VALUES ?',
                [errorValues]
              );
            }
          }
          break;

        case 'UPDATE_CAMPAIGN':
          // Build the query dynamically based on what fields are provided
          const updateCampaignFields = [];
          const updateCampaignValues = [];

          if (data.status !== undefined) {
            updateCampaignFields.push('status = ?');
            updateCampaignValues.push(data.status);
          }
          if (data.sentCount !== undefined) {
            updateCampaignFields.push('sent_count = ?');
            updateCampaignValues.push(data.sentCount);
          }

          // Add the id for the WHERE clause
          updateCampaignValues.push(data.id);

          // Only proceed if there are fields to update
          if (updateCampaignFields.length > 0) {
            const updateCampaignQuery = `
              UPDATE campaigns 
              SET ${updateCampaignFields.join(', ')} 
              WHERE id = ?
            `;
            await promiseQuery(updateCampaignQuery, updateCampaignValues);
          }

          if (data.error !== undefined) {
            await promiseQuery('DELETE FROM errors WHERE campaign_id = ?', [data.id]);
            if (data.error) {
              const errors = JSON.parse(data.error);
              if (Array.isArray(errors) && errors.length > 0) {
                const errorValues = errors.map(err => 
                  [err.email, err.error, data.id]
                );
                await promiseQuery(
                  'INSERT INTO errors (email, error, campaign_id) VALUES ?',
                  [errorValues]
                );
              }
            }
          }
          break;

        case 'DELETE_CAMPAIGN':
          // Errors will be deleted automatically due to foreign key constraint
          await promiseQuery('DELETE FROM campaigns WHERE id = ?', [data.id]);
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    }

    await promiseQuery('COMMIT');
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
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
  console.log('Database config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database
  });
});