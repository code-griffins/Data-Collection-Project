const express = require("express");
const app = express();
const fs = require('fs');
const port = 2083;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public")); //-> Static files belong in the public directory

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/vote-collection.html")
})

app.post('/save-image', (req, res) => {
    const imageData = req.body.imageData;

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
        }
    });
});

app.listen(port, () => console.log(`Listening to port: ${port}`))

