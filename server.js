const app = require('./app');

const PORT =
    process.env.PORT || 3040;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});