'use strict';

const app = require('./express/server');
const port = 4000;
app.listen(port, () => console.log(`Local app listening on port ${ port }!`));