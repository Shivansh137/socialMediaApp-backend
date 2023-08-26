const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(() => { console.log('Connected to the database 🔗'); })
    .catch((err) => { console.log(err) });
