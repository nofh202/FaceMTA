const express = require('express');
const path = require('path');
const package = require('./package.json');
const users = require('./modules/users.js');
const posts = require('./modules/posts.js');
const messages = require('./modules/messages.js');
const utils = require('./utils');
const StatusCodes = require('http-status-codes').StatusCodes;

let port =2718
const app = express()

function get_content_type_from_ext(url) {
	const match = url.match( /\.([a-z]+)/i );
	
	if ( ! match ) {
		if ( url === '/' || match == null ) {
			return 'text/html';
		}

		return 'application/json';
	}

	const ext = match[1].toLowerCase();

	switch( ext ) {
		case 'js': 
			return 'text/javascript';
		case 'css': 
			return 'text/css';
		case 'html': 
			return 'text/html';
	}

	return 'text/plain';
}

// General app settings
app.use((req, res, next) => {
	const content_type = '/api' === req.baseUrl ? 'application/json; charset=utf-8' : get_content_type_from_ext(req.url);
	res.contentType(content_type);
	next();
});

app.use(express.json());  // to support JSON-encoded bodies
app.use(express.urlencoded( // to support URL-encoded bodies
{  
  extended: true
}));


users.load_users();
posts.load_posts();
messages.load_messages();

// Version 
function get_version( req, res) 
{
	const token = req.header('Authorization');
	found_token = utils.check_token(token, req, res);

	if(found_token)
	{
		const version_obj = { version: package.version, description: package.description };
		res.status( StatusCodes.OK );
		res.send(  JSON.stringify( version_obj) );  
	}
	else
	{
		res.status( StatusCodes.UNAUTHORIZED );
		res.send( "Only logon user can get this request!");
	}
	 
}

//============ROUTING==========
//-------------USERS-----------
const router = express.Router();
router.get('/version', (req, res) => { get_version(req, res )  } );
router.get('/users', (req, res) => { users.list_users(req, res )  } )
router.post('/users', (req, res) => { users.create_user(req, res )  } )
router.put('/user/(:id)', (req, res) => { users.update_user(req, res )  } )
router.get('/user/(:id)', (req, res) => { users.get_user(req, res )  })
router.delete('/user/(:id)', (req, res) => { users.delete_user(req, res )  })
router.post('/user/login', (req, res) => { users.login(req, res )  })
router.put('/user/approve/(:id)', (req, res) => { users.approve_user(req, res )  })
router.put('/user/suspend/(:id)', (req, res) => { users.suspend_user(req, res )  })
router.put('/user/restore/(:id)', (req, res) => { users.restore_user(req, res )  })
router.post('/user/logout', (req, res) => { users.logout(req, res )  })


//-------------POSTS-----------
router.get('/posts', (req, res) => { posts.list_posts(req, res )  } )
router.post('/posts', (req, res) => { posts.create_post(req, res )  } )
router.get('/post/(:id)', (req, res) => { posts.get_post(req, res )  })
router.delete('/post/(:id)', (req, res) => { posts.delete_post(req, res )  })

//-------------MESSAGES-----------
router.get('/messages', (req, res) => { messages.list_messages(req, res) })
router.post('/messages', (req, res) => { messages.create_message(req, res) })
router.post('/messages/forAll', (req, res) => { messages.create_message_for_all(req, res) })
router.get('/messages/message/(:id)', (req, res) => { messages.get_message(req, res )})
router.get('/messages/chat/(:id)', (req, res) => { messages.get_chat(req, res ) })



app.use(express.static(path.join(__dirname, 'client')));

app.use('/api',router)


// Init 

let msg = `${package.description} listening at port ${port}`
app.listen(port, () => { console.log( msg ) ; });

