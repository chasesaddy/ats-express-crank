'use strict';
const express = require( 'express' );
const path = require('path');
// const serverless = require( 'serverless-http' );
const app = express();
const bodyParser = require( 'body-parser' );

const Cors = require( 'cors' );
const Axios = require( 'axios' );

console.log('env', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  require( 'dotenv' ).config(); //( { path: './.env.dev' } )
  // console.log(process.env);
};

const router = express.Router();

router.get( '/', ( req, res ) => { 
  res.writeHead( 200, { 'Content-Type': 'text/html' } );
  res.write('<h1>Hello from Schmoomu in tha house!</h1>');
  res.end();
} );

router.get( '/another', ( req, res ) => res.json( { route: req.originalUrl } ) );
router.post( '/', ( req, res ) => res.json( { postBody: req.body } ) );

// For working with authorization code OAuth 2 with frontend JS
router.post( '/auth-code', ( req, res ) => {
  Axios.post( req.body.url )
    .then( response => {
      // res.headers( { ...response.headers } );
      res.json( { status: response.status, ...response.data } ) 
    } )
    .catch( ( error ) => {
      if ( error.response ) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          res.sendStatus( error.response.status );
          res.headers( { ...error.response.headers } );
          res.json( { 
            if: 'response', 
            msg: error.message, 
            ...error.response.data
          } );
      } else if ( error.request ) {
          // The request was made but no response was received
          // error.request is instance of XMLHttpRequest in browser, instance of http.ClientRequest in node.js
          res.json( { if: 'request', req: error.request } );
      } else {
          // Something happened in setting up the request that triggered an Error
          res.json( { if: 'else', msg: error.message, message: error.message } );
      }
      // console.log( error.config );
    } );
} );

// Helper
const assembleUrl = ( baseUrl, wildcardPath, queries ) => {
  // Don't need to include anything like ? if there's no query
  let query = '';
  if ( Object.keys( queries ).length !== 0 ) {
    query = '?';
    Object.entries( queries ).forEach( ( [ key, val ] ) => {
      query += `${ key }=${ val }&`;
    } );
  };
  // Slice off & if it's the last character
  const fullQuery = query.charAt( query.length - 1 ) == '&' ? query.slice( 0, -1 ) : query;
  
  return `${ baseUrl }${ wildcardPath }${ fullQuery }`;
}

// Status Hero Helper Example
// const statusheroInitial = ( req ) => {
//   const baseApiUrl = 'https://service.statushero.com/api/v1/';
//   const fullUrl = assembleUrl( baseApiUrl, req.params[ 0 ], req.query );

//   const headers = {};
//   headers[ 'X-TEAM-ID' ] = req.headers[ 'x-team-id' ];
//   headers[ 'X-API-KEY' ] = req.headers[ 'x-api-key' ];
//   if ( req.headers.hasOwnProperty( 'content-type' ) ) {
//     headers[ 'CONTENT-TYPE' ] = req.headers[ 'content-type' ];
//   }
//   console.log( 'headers', headers );

//   return { fullUrl, headers };
// }

// Pass through any url to get around CORS
router.get( '/c/*', ( req, res ) => {
  if ( req.url === '/c' || req.url === '/c/' ) {
    res.writeHead( 200, { 'Content-Type': 'text/html' } );
    res.write('<h1>Hello from Schmoomu in tha hizz!</h1>');
    res.end();
  } else {
  Axios.get(
    req.url.substring( 3 ) 
  ).then( response => {
      // res.headers( { ...response.headers } );
      res.json( { status: response.status, headers: response.headers, data: response.data.length } ) 
    } )
    .catch( ( error ) => {
      if ( error.response ) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          res.sendStatus( error.response.status );
          res.headers( { ...error.response.headers } );
          res.json( { 
            if: 'response', 
            msg: error.message, 
            ...error.response.data 
          } );
      } else if ( error.request ) {
          // The request was made but no response was received
          // error.request is instance of XMLHttpRequest in browser, instance of http.ClientRequest in node.js
          res.json( { if: 'request', req: error.request } );
      } else {
          // Something happened in setting up the request that triggered an Error
          res.json( { if: 'else', msg: error.message, message: error.message } );
      }
      console.log( error.config );
    } );
  }
} );


// My Own

router.get( '/patreon/crank', ( req, res ) => {
  const accessToken = process.env.accessToken;
  const campaignId = process.env.campaignId;
  const url = `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/posts?fields${encodeURIComponent("[")}post${encodeURIComponent("]")}=title,content,is_paid,is_public,published_at,url,embed_data,embed_url,app_id,app_status`;

  Axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      // console.log(response.data);
      res.json( { status: response.status, ...response.data } ) 
    })
    .catch((error) => {
      if ( error.response ) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          // res.headers( { ...error.response.headers } );
          // res.sendStatus( error.response.status );
          res.json( { 
            if: 'response', 
            msg: error.message, 
            ...error.response.data
          } );
      } else if ( error.request ) {
          // The request was made but no response was received
          // error.request is instance of XMLHttpRequest in browser, instance of http.ClientRequest in node.js
          res.json( { if: 'request', req: error.request } );
      } else {
          // Something happened in setting up the request that triggered an Error
          res.json( { if: 'else', msg: error.message, message: error.message } );
      }
      console.error( error.config );
    });
});


app.use( Cors() );
app.use( bodyParser.json() );
app.use( '/functions', router );  // path must route to lambda
app.use( '/', ( req, res ) => res.sendFile( path.join( __dirname, '../index.html' ) ) );

module.exports = app;
// module.exports.handler = serverless( app );
