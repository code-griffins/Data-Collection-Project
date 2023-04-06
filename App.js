const express = require("express");
const app = express();
const port = 2083;

app.use(express.static("public")); //-> Static files belong in the public directory
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/vote-collection.html")
})


app.listen(port, () => console.log(`Listening to port: ${port}`))

