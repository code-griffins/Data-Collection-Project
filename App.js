const express = require('express');
const fs = require('fs');
const app = express();
const sqlite3 = require("sqlite3");

// Database to store records.
const db = new sqlite3.Database("./signatures.db");
db.run("CREATE TABLE IF NOT EXISTS signaturesTable (id INTEGER PRIMARY KEY AUTOINCREMENT, idNo TEXT, imageURL TEXT)")

// Set up middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static("public"))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/vote-collection.html")
})

app.get("/more-info", (req, res) => {
    res.sendFile(__dirname + "/public/more-info.html")
})
// Define a route for saving the signature image
app.post('/save-image', (req, res) => {
    const imageData = req.body.imageData;
    const idNo = req.body.idNo;

    // Generate a unique filename for the image
    const fileName = `${Date.now()}.png`;
    const filePath = `./signatures/${fileName}`;

    // Remove the "data:image/png;base64," prefix from the data URL
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

    // Convert the Base64-encoded data to a Buffer
    const bufferData = Buffer.from(base64Data, 'base64');

    // Save the image file to disk
    fs.writeFile(filePath, bufferData, err => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to save image' });
        } else {
            res.status(200).json({ success: true });

            // ID number will be required to verify
            // Save image URL and ID number 
            db.serialize(() => {
                db.run("INSERT INTO signaturesTable(idNo,imageURL) VALUES(?,?)", [idNo, filePath])
            })

            // Reload page

        }
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
