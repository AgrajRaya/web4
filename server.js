/*******************************************************************************
 * WEB422 – Assignment 1
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Agraj Raya Student ID: 147863237 Date: 2025-05-25
 *
 * Published URL: 
 ******************************************************************************/



require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ListingsDB = require('./listingsAPI/modules/listingsDB');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const http = require('http');
const db = new ListingsDB();
const connectionString = process.env.MONGODB_CONN_STRING;

app.use(cors());
app.use(express.json());  // to parse the json file

// route to home 
app.get('/', (req,res) => {
  res.json({message: "Hello WEB422"});
})

// POST /api/listings
app.post('/api/listings', (req,res) => {
    const newListing = req.body;    
    db.addNewListing(newListing)
    .then((createdListing) => {
        res.status(201).json(createdListing);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({message: 'Failed to add new listing'});
    });
});

//get /api/listings
app.get('/api/listings', (req,res) => {
    const page = parseInt(req.query.page);
    const perPage = parseInt(req.query.perPage);
    const name = req.query.name;

    db.getAllListings(page,perPage,name)
    .then((listings) => {
        if (listings.length == 0){
            res.status(404).json({message: "Listings not found."})
        }
        else {
            res.json(listings);
        }
    })
    .catch((err) => {
        res.status(500).json({message: "Error getting listings.", error: err.message});
    });
});

//get /api/listings/:id

app.get('/api/listings/:id', (req,res) =>
{
    const id = req.params.id;
    
    db.getListingById(id)
    .then(listing =>{
        if (listing) {
            res.json(listing)
        }
        else{
            res.status(404).json({message: `Listing with id ${id} not found.`});
        }
    })
    .catch(err => {
        console.log(err);
    });
});

//put('/api/listings/:id')
app.put('/api/listings/:id', (req, res) => {
  const id = req.params.id;
  const updatedListing = req.body;

  db.updateListingById(updatedListing, id)
    .then(result => {
      if (result.modifiedCount === 0) {
        res.status(404).json({ message: `Listing with id ${id} not found or not modified.` });
      } else {
        res.json({ message: `Listing with id ${id} updated successfully.` });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Failed to update listing.', error: err.message });
    });
});

//route for id delete
app.delete('/api/listings/:id', (req, res) => {
  const id = req.params.id;

  db.deleteListingById(id)
    .then(result => {
      if (result.deletedCount === 0) {
        res.status(404).json({ message: `Listing with id ${id} not found.` });
      } else {
        res.status(204).send(); // No content, successful delete
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete listing.', error: err.message });
    });
});



db.initialize(connectionString)
.then(() =>{
    console.log('Database connected successfully!');
    app.listen(HTTP_PORT, () =>
    {
        console.log(`Server listening at http://localhost:${HTTP_PORT}`)
    });
})
.catch((err) => {
    console.err('Failed to connect to DB:', err);
})
