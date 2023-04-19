const express = require('express');
const fs = require('fs');
const app = express();
const sqlite3 = require("sqlite3");
let ipAddress
// Database to store records.
const db = new sqlite3.Database("./signatures.db");
db.run("CREATE TABLE IF NOT EXISTS signaturesTable (id INTEGER PRIMARY KEY AUTOINCREMENT, idNo TEXT, imageURL TEXT)")

// Set up middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"))

app.get("/", (req, res) => {
    fetch('https://api.ipify.org/?format=json')
        .then(response => response.json())
        .then(data => {
            ipAddress = data.ip;
            res.sendFile(__dirname + "/public/vote-collection.html");

        })
        .catch(error => console.error(error));
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

            let newRecord = false;
            db.all('SELECT ipAddress FROM signaturesTable', [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                } else {
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        if (row.ipAddress == ipAddress) {
                            newRecord = true;
                        }
                    }
                    if (!newRecord) {
                        res.status(200).json({ success: true, name: "Tony" });

                        db.run("INSERT INTO signaturesTable(ipAddress, idNo, imageURL) VALUES (?, ?, ?)", [ipAddress, idNo, filePath]);
                    }
                }
            });




            // Close the database connection
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('Database connection closed.');
            });
            // })

            // Reload page
        }
    });
});

// Define a route for already signed
app.get('/already-signed', (req, res) => {
    res.sendFile(__dirname + "/public/already-signed.html");
})
// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
