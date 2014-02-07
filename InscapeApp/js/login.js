var db;
var time = currentTimeMillis();
var JSONJSON = {};

function createUserDB(tx)
	{
			//remove tables if they exist just in case any users have been added or corrupted
			console.log('running createuserdb');
        //tx.executeSql('DROP TABLE IF EXISTS insc_users');
			tx.executeSql('DROP TABLE IF EXISTS insc_roles');
			
			// create table - users
	//
			tx.executeSql("CREATE TABLE IF NOT EXISTS insc_users (" + 
				  "id INTEGER PRIMARY KEY," + 
				  "username TEXT, " + 
				  "password TEXT, " + 
				  "email TEXT, " + 
				  "role_id INTEGER, " + 
				  "team_id INTEGER, " + 
				  "reg_date NUMERIC, " + 
				  "timestamp NUMERIC, " + 
				  "UNIQUE (id))");

	// create table - roles
	//
	
			tx.executeSql('CREATE TABLE IF NOT EXISTS insc_roles (' + 
				  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
				  'role TEXT, ' + 
				  'timestamp NUMERIC, ' + 
				  'UNIQUE (role))');
			
	tx.executeSql('INSERT INTO insc_roles (id,role, timestamp) VALUES (1,"administrator", ' + time + ')');
	// 1
	tx.executeSql('INSERT INTO insc_roles (id, role, timestamp) VALUES (2,"fitter", ' + time + ')');
	// 2
	tx.executeSql('INSERT INTO insc_roles (id, role, timestamp) VALUES (3,"manager", ' + time + ')');
	// 3
	tx.executeSql('INSERT INTO insc_roles (id, role, timestamp) VALUES (4,"customer", ' + time + ')');
	// 4
			
	}

function syncUsers() //this function calls the server to get the most recent users from the database
	{
		db.transaction(createUserDB,transaction_error, populateDB_success);
        
        
        $.getJSON('http://www.cubiclesandwashrooms.co.uk/callajax.php', function(data) 
        {
           db.transaction(function (tx)
				{  
       			for (var i=0; i < data.length; i++)
       				{  
       					tx.executeSql('INSERT INTO insc_users (id, username, password, email, role_id, team_id, reg_date, timestamp) ' + 'VALUES (?,?,?,?,?,?,?,?)', [data[i].id, data[i].username, data[i].password, data[i].email,data[i].role_id, 4, time, time]);
       				}
        		});
		});
        
         console.log("Users have been added");
         syncProj();
         // alert("Databases have been syncronised");
    }

function syncProj() //this function calls the server to get the most recent users from the database
	{
		//db.transaction(createUserDB,transaction_error, populateDB_success);
        $.getJSON('http://www.cubiclesandwashrooms.co.uk/sendtotablet.php', function(data) 
        {
             	
				db.transaction(function (tx)
				{  
       			for (var i=0; i < data.length; i++)
       				{  
       					//tx.executeSql('INSERT INTO insc_projnos (id,project_no, customer, site, contract_manager, timestamp) VALUES (?,?,?,?,?,?)', [data[i].id ,data[i].project_no , data[i].customer,  data[i].project_name , data[i].contract_manager , time]);
       					//tx.executeSql('INSERT INTO insc_projnos (id,project_no, customer, site, site_no , contract_manager, timestamp) VALUES (?,?,?,?,?,?,?)', [data[i].id ,data[i].project_no , data[i].customer,  data[i].project_name , [data[i].id , data[i].contract_manager , time]);
       					tx.executeSql('INSERT INTO insc_projnos (id,project_no, customer, site, site_no , contract_manager, timestamp) VALUES (?,?,?,?,?,?,?)', [data[i].id ,data[i].project_no , data[i].customer,  data[i].project_name , data[i].id , data[i].contract_manager , time]);
       					
       				}
        			
    			});
				console.log("Projects have been added");
				syncProjDetails();
               	  
        });
        
    
    }



function syncProjDetails() //this function calls the server to get the most recent project details from the database
	{
		$.getJSON('http://www.cubiclesandwashrooms.co.uk/ProjectDetails.php', function(data) 
        {
            	
				db.transaction(function (tx)
				{  
       			for (var i=0; i < data.length; i++)
       				{  
       					tx.executeSql('INSERT INTO insc_projs (id , room_ref , description , total_qty , install_qty , install_sell , install_cost , fitter_name , projnos_id , timestamp) VALUES (?,?,?,?,?,?,?,?,?,?)', [data[i].id , data[i].room_ref , data[i].description ,  data[i].total_qty , data[i].install_qty ,data[i].install_sell , data[i].install_cost , data[i].fitter , data[i].guid ,time]);
       			
       				}
        			
    			});
				console.log("Project Details have been added");
                syncProjHistory();
               	
        });
        
    
    }

function syncProjHistory() //this function calls the server to get the most recent project details from the database
	{
		$.getJSON('http://www.cubiclesandwashrooms.co.uk/ProjectHistory.php', function(data) 
        {
            	
				db.transaction(function (tx)
				{  
       			for (var i=0; i < data.length; i++)
       				{  
       					tx.executeSql('INSERT INTO insc_projs_history (projs_id , install_qty , timestamp , unique_id) VALUES (?,?,?,?)', [data[i].id , data[i].install_qty , data[i].time_int ,  data[i].unique_id]);
       			
       				}
        			
    			});
				console.log("Project Details have been added");
                uploadData();
               	
        });
        
    
    }




function uploadData() {
	
	db.transaction(function(tx) {
		uploadCheck(tx)
	}, transaction_error);
}

function uploadCheck(tx) {
	
   // var sql = 'SELECT id FROM insc_projs WHERE 1';
//	tx.executeSql(sql,uploadSuccess);
    
    //var sql = 'INSERT INTO insc_projs_history (projs_id, install_qty, timestamp) VALUES (?, ? ,?)';
	//tx.executeSql(sql, [1, 2,time], SQLAddProjsHistory_success);
    
    sql = 'SELECT u.projs_id, u.install_qty, u.timestamp, u.unique_id from insc_projs_history u';
    tx.executeSql(sql,[], uploadSuccess);
    
    
	
}



function uploadSuccess(tx,results)
{
    
    var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record 
		var rec = {'projs_id' : item.projs_id, 'install_qty' : item.install_qty, 'timestamp' : item.timestamp, 'unique_id' : item.unique_id};
		//var rec = {'projs_id' : item.id};
		
		ar.push(rec);
	}
	
	 // push to json
	 JSONJSON['insc_projs_history'] = ar;
	
	
     syncSync(JSON.stringify(JSONJSON));    
    
}






function init() {
	document.addEventListener("deviceready", deviceReady, true);
	document.addEventListener("backbutton", overrideNativeBackButton);
	delete init;
}

function deviceReady() {
	
	// open database
	db = window.openDatabase("InscapeDB", "1.0", "Inscape DB", 200000);
	//db.transaction(populateDB, transaction_error, populateDB_success);
	
		
	if (!window.localStorage["isDBCreated"]) 
	{
		// create database
        //alert("run popolatedb");
	    db.transaction(populateDB, transaction_error, populateDB_success);
	    //alert("run createdb");
        db.transaction(createUserDB,transaction_error, populateDB_success);
        //alert("finished create");
	}
	
	//$('#loginForm').on('submit', handleLogin); // form only
	$('#loginButton').on('tap', handleLogin);
   $("#registerButton").on("tap", gotoRegister);
	//$('#sync').on('tap', syncData);
	$('#sync').on('tap', syncUsers);
	//$('#syncProjectDetails').on('tap', fileTransfer);
    	
}

function overrideNativeBackButton() {
	/*if(window.localStorage['isLoggedIn'] == undefined) {
	 } else {
	 }*/
}

function gotoRegister() {
	//console.log("go to registration page...");
	//window.location.href = "register.html";
}

function handleLogin() {

	var form = $('#loginForm');
	$('#loginButton', form).attr('disabled', 'disabled');
   // var thisButton = $('#loginButton');
   // $('#loginButton', form).attr('Value', 'Loggin In');
   // thisButton = $('#loginButton');
    
    
	var u = $('#username', form).val();
	var p = $('#password', form).val();
	
	handleLoginLocally(u, p);

	//if (u != '' && p != '') {
	//	// encrypt password using sha1
	//	//p = CryptoJS.SHA1(p) + ''; // make sure the hash has been serialized to a string
	//	//p = CryptoJS.SHA1(p).toString();
	//
	
	$('#loginButton').removeAttr('disabled');

	return false;
}

function handleLoginLocally(username, password) {
	
	db.transaction(function(tx) {
		SQLCheckUser(tx, username, password)
	}, transaction_error);
}

function SQLCheckUser(tx, username, password) {
	//var sql = 'SELECT u.username, u.email, r.role FROM insc_users u LEFT JOIN insc_roles r ON r.id = u.role_id WHERE username="' + username + '" AND password="' + password + '"';
	var sql = 'SELECT u.username, u.email, u.role_id FROM insc_users u WHERE username="' + username + '" AND password="' + password + '"';
	
	//alert("username is "+username+"password is "+password);
	tx.executeSql(sql, [], SQLCheckUser_success);
	
	
}

function SQLCheckUser_success(tx, results) {
	var len = results.rows.length;
   // var items = results.rows.item(0);
   // var newRole = items.role_id;
    
   // SQLCheckRole(tx,newRole);
        
    
	//alert("number of rows is "+len);

	if (len > 1) {
		console.log('ERR.LOGIN.SQL: Database, Duplicated user record found');
		return false;
	} else if (len <= 0) {
		console.log('LOG.LOGIN.SQL: Database, User not found');
		navigator.notification.alert('Username and password do not match', function() {
		}, 'Login failed');
		return false;
	}

	for (var i = 0; i < len; i++) {
		var user = results.rows.item(i);

		// save user detail to local storage
		//
		window.localStorage['username'] = user.username;
		window.localStorage['email'] = user.email;
		//gb window.localStorage['role'] = user.role;
		window.localStorage['role'] = 'manager';
		

		window.localStorage['isLoggedIn'] = true;

		// clean site and room TODO add in logout
		//
		window.localStorage['whichSite'] = '';
		window.localStorage['whichRoom'] = '';
		window.localStorage['whichSitename'] = '';
		window.localStorage['whichRoomname'] = '';
		window.localStorage['whichProject'] = '';
		window.localStorage['whichCustomer'] = '';

		// goto work list page
		//
		//console.log('LOG.LOGIN: Goint to worklist.html page');
		//window.location.href = 'worklist.html';
        
        console.log('LOG.LOGIN: Goint to projectlist.html page');
		window.location.href = 'projectlist.html';
        
        
	}
}

function SQLCheckRole(tx,role)

{
    
    
	var sql = 'SELECT role FROM insc_roles WHERE site_no="' + role + '"';
    tx.executeSql(sql, [], SQLGetCustomerAndProjectNo_success);
}

//SQLCheckRoleSuccess(tx,results)
//{
//    var newRoleName = results.item(0); 
//    
//}

function populateDB(tx) {
	console.log('running populatedb');
	
//	tx.executeSql('DROP TABLE IF EXISTS insc_users');
	tx.executeSql('DROP TABLE IF EXISTS insc_roles');
	tx.executeSql('DROP TABLE IF EXISTS insc_teams');
	//tx.executeSql('DROP TABLE IF EXISTS insc_teams_fitter');
	//tx.executeSql('DROP TABLE IF EXISTS insc_teams_manager');
	tx.executeSql('DROP TABLE IF EXISTS insc_projnos');
	tx.executeSql('DROP TABLE IF EXISTS insc_projs');
	tx.executeSql('DROP TABLE IF EXISTS insc_projs_history');
	//tx.executeSql('DROP TABLE IF EXISTS insc_drawings');
	//tx.executeSql('DROP TABLE IF EXISTS insc_jobs');
	tx.executeSql('DROP TABLE IF EXISTS insc_snags');
	tx.executeSql('DROP TABLE IF EXISTS insc_imgs');
	tx.executeSql('DROP TABLE IF EXISTS insc_lastmod');

	var time = currentTimeMillis();

	// create table - users
	//
	tx.executeSql("CREATE TABLE IF NOT EXISTS insc_users (" + 
				  "id INTEGER PRIMARY KEY AUTOINCREMENT," + 
				  "username TEXT, " + 
				  "password TEXT, " + 
				  "email TEXT, " + 
				  "role_id INTEGER, " + 
				  "team_id INTEGER, " + 
				  "reg_date NUMERIC, " + 
				  "timestamp NUMERIC, " + 
				  "UNIQUE (username))");

	// create table - roles
	//
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_roles (' + 
				  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
				  'role TEXT, ' + 
				  'timestamp NUMERIC, ' + 
				  'UNIQUE (role))');

	tx.executeSql('INSERT INTO insc_roles (role, timestamp) VALUES ("administrator", ' + time + ')');
	// 1
	tx.executeSql('INSERT INTO insc_roles (role, timestamp) VALUES ("fitter", ' + time + ')');
	// 2
	tx.executeSql('INSERT INTO insc_roles (role, timestamp) VALUES ("manager", ' + time + ')');
	// 3
	tx.executeSql('INSERT INTO insc_roles (role, timestamp) VALUES ("customer", ' + time + ')');
	// 4

	// create table - teams
	//
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_teams (' + 
				  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
				  'team TEXT, ' + 
				  'timestamp NUMERIC, ' + 
				  'UNIQUE (team))');

	//tx.executeSql('INSERT INTO insc_teams (team) VALUES ("fitter team")'); 				// 1
	//tx.executeSql('INSERT INTO insc_teams (team) VALUES ("contract manager")'); 			// 2
	//tx.executeSql('INSERT INTO insc_teams (team, timestamp) VALUES ("IPS Cubicle Fitters UK Ltd", ' + time + ')');
	//tx.executeSql('INSERT INTO insc_teams (team, timestamp) VALUES ("Chester Fitters Ltd", ' + time + ')');
	//tx.executeSql('INSERT INTO insc_teams (team, timestamp) VALUES ("Manchester Fitters Ltd", ' + time + ')');

	// create table - project nos
	//
	
				  
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_projnos (' + 
				  'id INTEGER PRIMARY KEY, ' + 
				  'project_no TEXT, ' + 
				  'customer TEXT, ' + 
				  'site TEXT, ' + 
				  'site_no TEXT, ' + 
				  'contract_manager TEXT, ' + 
				  'timestamp NUMERIC, ' + 
				  'UNIQUE (project_no))');
				  

	// create table - projects
	//
	
	// alert("Creating insc_projs");
	
	//tx.executeSql('CREATE TABLE IF NOT EXISTS insc_projs ('+
	//'id INTEGER PRIMARY KEY AUTOINCREMENT, '+
	//'customer TEXT, '+
	//'project_no TEXT, '+
	//'drawing_id INTEGER)');

	console.log('LOG.INDEX: Created Database, insc_projs');

	// create table - drawings (pdfs)
	//
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_drawings ('+
	'id INTEGER PRIMARY KEY AUTOINCREMENT, '+
	'sitename TEXT, ' +
	'roomname TEXT, '+
	'site INTEGER, '+
	'room INTEGER, ' +
	'page_num INTEGER, '+
	'filename TEXT)');

	// create table - projects
	//
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_projs (' + 
				  'id INTEGER PRIMARY KEY , ' + 
				  'room_ref TEXT, ' + 
				  'description TEXT, ' + 
				  'total_qty INTEGER, ' + 
				  'install_qty INTEGER, ' + 
				  'install_sell REAL, ' + 
				  'install_cost REAL, ' + 
				  'fitter_name TEXT, ' + 
				  'projnos_id TEXT, ' + 
				  'timestamp NUMERIC)');

	// create table - project history
	//
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_projs_history (' + 
				  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
				  'projs_id INTEGER, ' + 
				  'install_qty INTEGER, ' + 
                  'unique_id TEXT, ' + 
				  'timestamp NUMERIC, ' + 
                  'UNIQUE (unique_id) )');

	// create table - snags
	//
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_snags (' + 
				  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
				  'title TEXT, ' + 
				  'added_by INTEGER, ' + 
				  'status INTEGET, ' + 
				  'update_date NUMERIC, ' + 
				  'review_cm INTEGET, ' + 
				  'review_desc TEXT, ' + 
				  'review_img TEXT, ' + 
				  'review_log TEXT, ' + 
				  'coords TEXT, ' + 
				  'projs_id INTEGER, ' + 
				  'site_no TEXT, ' + 
				  'filename TEXT, ' + 
				  'page_num INTEGER, ' + 
				  'timestamp NUMERIC)');

	// create table - images
	//
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_imgs (' + 
				  'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
				  'filename TEXT, ' + 
				  'snag_id INTEGER, ' + 
				  'creation_date NUMERIC, ' + 
				  'timestamp NUMERIC)');
	
	// create table - last modified
	// TODO
	tx.executeSql('CREATE TABLE IF NOT EXISTS insc_lastmod (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp NUMERIC)');
	tx.executeSql('INSERT INTO insc_lastmod (timestamp) VALUES (?)', [time-1000000000]);




	// insert users
	//tx.executeSql('INSERT INTO insc_users (' + 'username, password, email, role_id, team_id, reg_date, timestamp) ' + 'VALUES ("Tom", "67866a7772ab749f833dc52d82ac7853df866bf5", "tom@gmail.com", 3, 2, ?, ?)', [time, time]);
	//tx.executeSql('INSERT INTO insc_users (' + 'username, password, email, role_id, team_id, reg_date, timestamp) ' + 'VALUES ("Paul", "67866a7772ab749f833dc52d82ac7853df866bf5", "paul@gmail.com", 4, 0, ?, ?)', [time, time]);
	//tx.executeSql('INSERT INTO insc_users (' + 'username, password, email, role_id, team_id, reg_date, timestamp) ' + 'VALUES ("Lei", "67866a7772ab749f833dc52d82ac7853df866bf5", "lei@gmail.com", 1, 0, ?, ?)', [time, time]);
	//tx.executeSql('INSERT INTO insc_users (' + 'username, password, email, role_id, team_id, reg_date, timestamp) ' + 'VALUES ("Stewart", "67866a7772ab749f833dc52d82ac7853df866bf5", "stewart@gmail.com", 2, 3, ?, ?)', [time, time]);

	// insert project nos
	
	//tx.executeSql('INSERT INTO insc_projnos (project_no, customer, site, site_no, contract_manager, timestamp) VALUES ("P103623", "Eric Wright Construction Limited", "St Marys Catholic College - Blackpool B S F", "21550", "Gary Wynne", ?)', [time]);
	//tx.executeSql('INSERT INTO insc_projnos (project_no, customer, site, site_no, contract_manager, timestamp) VALUES ("P485965", "Wibbly wobbly Construction Limited", "Lancaster University Graduate College", "21859", "Michael Jordan", ?)', [time]);
	//tx.executeSql('INSERT INTO insc_projnos (project_no, customer, site, site_no, contract_manager, timestamp) VALUES ("P587689", "Fyle College Construction Limited", "Manchester University", "25458", "Michael Jackson", ?)', [time]);

	tx.executeSql('INSERT INTO insc_projnos (id,project_no, customer, site, site_no, contract_manager, timestamp) VALUES (1,"P103623", "Eric Wright Construction Limited", "St Marys Catholic College - Blackpool B S F", "21550", "Gary Wynne", ?)', [time]);
	//tx.executeSql('INSERT INTO insc_projnos (id,project_no, customer, site, site_no, contract_manager, timestamp) VALUES (2,"P485965", "Wibbly wobbly Construction Limited", "Lancaster University Graduate College", "21859", "Michael Jordan", ?)', [time]);
	//tx.executeSql('INSERT INTO insc_projnos (id,project_no, customer, site, site_no, contract_manager, timestamp) VALUES (3,"P587689", "Fyle College Construction Limited", "Manchester University", "25458", "Michael Jackson", ?)', [time]);



	// insert drawings
	tx.executeSql('INSERT INTO insc_drawings (sitename, roomname, site, room, page_num, filename) VALUES ("Fylde College", "00-001-01", 21550, 1, 1, "21550.pdf")');
	tx.executeSql('INSERT INTO insc_drawings (sitename, roomname, site, room, page_num, filename) VALUES ("Fylde College", "00-001-02", 1, 2, 2, "21550.pdf")');
	tx.executeSql('INSERT INTO insc_drawings (sitename, roomname, site, room, page_num, filename) VALUES ("Fylde College", "00-001-03", 1, 3, 3, "21550.pdf")');
	tx.executeSql('INSERT INTO insc_drawings (sitename, roomname, site, room, page_num, filename) VALUES ("Graduate College", "00-002-01", 2, 1, 4, "21550.pdf")');
	tx.executeSql('INSERT INTO insc_drawings (sitename, roomname, site, room, page_num, filename) VALUES ("Graduate College", "00-002-02", 2, 2, 5, "21550.pdf")');
	tx.executeSql('INSERT INTO insc_drawings (sitename, roomname, site, room, page_num, filename) VALUES ("Graduate College", "00-002-05", 2, 5, 6, "21550.pdf")');
	tx.executeSql('INSERT INTO insc_drawings (sitename, roomname, site, room, page_num, filename) VALUES ("Furness College", "00-010-01", 10, 1, 7, "21550.pdf")');
	tx.executeSql('INSERT INTO insc_drawings (sitename, roomname, site, room, page_num, filename) VALUES ("Furness College", "00-010-07", 10, 7, 8, "21550.pdf")');

	// insert projects
	tx.executeSql('INSERT INTO insc_projs (' + 'room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) ' + 'VALUES ("00-00-005", "Installation of flashgaps for two WC ducts", 2, 1, 100.59, 55.25, "IPS Cubicle Fitters UK Ltd", 1, ?)', [time]);
	tx.executeSql('INSERT INTO insc_projs (' + 'room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) ' + 'VALUES ("00-00-005", "Installation of two extremus wc duct panels between walls 00-00-005", 2, 1, 103.91, 45.25, "IPS Cubicle Fitters UK Ltd", 1, ?)', [time]);
	tx.executeSql('INSERT INTO insc_projs (' + 'room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) ' + 'VALUES ("00-00-005", "Installation of three extremus wc duct panels between walls 00-00-005", 2, 1, 103.91, 45.25, "IPS Cubicle Fitters UK Ltd", 1, ?)', [time]);
	tx.executeSql('INSERT INTO insc_projs (' + 'room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) ' + 'VALUES ("00-00-006", "Installation of flashgaps for one wc duct 0-00-006", 1, 0, 51.96, 22.63, "IPS Cubicle Fitters UK Ltd", 1, ?)', [time]);
	tx.executeSql('INSERT INTO insc_projs (' + 'room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) ' + 'VALUES ("00-01-021", "Installation of one extremus wc duct panel between walls 0-01-021", 1, 0, 103.91, 22.63, "IPS Cubicle Fitters UK Ltd", 1, ?)', [time]);
	tx.executeSql('INSERT INTO insc_projs (' + 'room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) ' + 'VALUES ("00-02-014", "Installation of three extremus wc duct panels between walls 0-02-014", 3, 1, 207.82, 67.88, "IPS Cubicle Fitters UK Ltd", 2, ?)', [time]);
	tx.executeSql('INSERT INTO insc_projs (' + 'room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) ' + 'VALUES ("00-01-021", "Installation of duct return panel 0-01-021", 1, 1, 65.83, 22.63, "IPS Cubicle Fitters UK Ltd", 2, ?)', [time]);
	tx.executeSql('INSERT INTO insc_projs (' + 'room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) ' + 'VALUES ("00-09-018", "Installation of ceiling", 10, 2, 65.83, 22.63, "IPS Cubicle Fitters UK Ltd", 3, ?)', [time]);

	// insert snags
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Light broken", 1, 0, ?, 1, "two", 0, "", "0.123;0.321", 1, "21550", "21550.pdf", 2, ?)', [time, time]);
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Ceiling broken", 1, 1, ?, 1, "100 metres", 0, "", "0.5;0.78", 1, "21550", "21550.pdf", 3, ?)', [time, time]);
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Dirty wall", 1, 0, ?, 1, "need white paint", 0, "half done", "0.12;0.35", 3, "21550", "21550.pdf", 8, ?)', [time, time]);
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Know lost", 1, 0, ?, 1, "knob type:K192, need 4", 0, "", "0.201;0.715", 3, "25458", "21550.pdf", 1, ?)', [time, time]);
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Toilet broken", 1, 1, ?, 1, "Cracks found", 0, "one left", "0.4;0.1", 4, "21859", "21550.pdf", 4, ?)', [time, time]);
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Basin renew", 1, 1, ?, 1, "four", 0, "", "0.42;0.22", 4, "25458", "21550.pdf", 9, ?)', [time, time]);
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Light bubbles", 1, 1, ?, 1, "10", 0, "well done", "0.105;0.869", 5, "21550", "21550.pdf", 7, ?)', [time, time]);
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Mirror broken", 1, 2, ?, 1, "mirror type:MM238", 0, "", "0.256;0.956", 6, "25458", "21550.pdf", 6, ?)', [time, time]);
	tx.executeSql('INSERT INTO insc_snags (' + 'title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) ' + 'VALUES ("Door install", 1, 2, ?, 1, "10 doors", 0, "5 done", "0.356;0.656", 6, "21859", "21550.pdf", 5, ?)', [time, time]);
}

function populateDB_success() {
	console.log('LOG.INDEX: Database, database created');

	window.localStorage["isDBCreated"] = true;

	//db.transaction(getSpecificUser, transaction_error);
	//db.transaction(getAllJobs, transaction_error);
	//db.transaction(getAllSnags, transaction_error);
	//db.transaction(getAllDrawings, transaction_error);
}

function transaction_error(tx, error) {
	alert("Database Error: " + error);
}

function currentTimeMillis() {
	var d = new Date();
	return d.getTime();
}

function getDate(m) {
	var today = new Date(m);
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	if(dd<10) {
		dd='0'+dd;
	}
	if(mm<10) {
		mm='0'+mm;
	}
	today = mm+'/'+dd+'/'+yyyy;
	return today;
}



//var JSONJSON = {};
var lastModified = 0;



function syncData() {
	db.transaction(SQLGetLastModifiedTime, transaction_error);
}

function SQLGetLastModifiedTime(tx) {
	var sql = 'SELECT timestamp FROM insc_lastmod';
	tx.executeSql(sql, [], SQLGetLastModifiedTime_success);
}

function SQLGetLastModifiedTime_success(tx, results) {
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		lastModified = item.timestamp;
	}
	
	console.log('LOG.INDEX: Last sync time: ' + getDate(lastModified));
	
	// find data
	//
	if(lastModified > 0) {
		db.transaction(SQLFindNewUsers, transaction_error);
	} else {
		console.log('ERR.INDEX: Cannot find last modified time');
	}
}

function SQLFindNewUsers(tx) {
	var sql = 'SELECT * FROM insc_users WHERE timestamp > ?';
	tx.executeSql(sql, [lastModified], SQLFindNewUsers_success);
}

function SQLFindNewUsers_success(tx, results) {
	var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record
		var rec = {'username' : item.username, 'password' : item.password, 'email' : item.email, 'role_id' : item.role_id, 'team_id' : item.team_id, 'reg_date' : item.reg_date, 'timestamp' : item.timestamp};
		
		ar.push(rec);
	}
	
	// push to json
	JSONJSON['insc_users'] = ar;
	
	// next
	db.transaction(SQLFindNewRoles, transaction_error);
}

function SQLFindNewRoles(tx) {
	var sql = 'SELECT * FROM insc_roles WHERE timestamp > ?';
	tx.executeSql(sql, [lastModified], SQLFindNewRoles_success);
}

function SQLFindNewRoles_success(tx, results) {
	var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record
		var rec = {'role' : item.role, 'timestamp' : item.timestamp};
		
		ar.push(rec);
	}
	
	// push to json
	JSONJSON['insc_roles'] = ar;
	
	// next
	db.transaction(SQLFindNewTeams, transaction_error);
}

function SQLFindNewTeams(tx) {
	var sql = 'SELECT * FROM insc_teams WHERE timestamp > ?';
	tx.executeSql(sql, [lastModified], SQLFindNewTeams_success);
}

function SQLFindNewTeams_success(tx, results) {
	var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record
		var rec = {'team' : item.team, 'timestamp' : item.timestamp};
		
		ar.push(rec);
	}
	
	// push to json
	JSONJSON['insc_teams'] = ar;
	
	// next
	db.transaction(SQLFindNewProjectNos, transaction_error);
}

function SQLFindNewProjectNos(tx) {
	var sql = 'SELECT * FROM insc_projnos WHERE timestamp > ?';
	tx.executeSql(sql, [lastModified], SQLFindNewProjectNos_success);
}

function SQLFindNewProjectNos_success(tx, results) {
	var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record
		var rec = {'project_no' : item.project_no, 'customer' : item.customer, 'site' : item.site, 'site_no' : item.site_no, 'contract_manager' : item.contract_manager, 'timestamp' : item.timestamp};
		
		ar.push(rec);
	}
	
	// push to json
	JSONJSON['insc_projnos'] = ar;
	
	// next
	db.transaction(SQLFindNewProjects, transaction_error);
}

function SQLFindNewProjects(tx) {
	//var sql = 'SELECT * FROM insc_projs WHERE timestamp > ?';
	
	var sql = 'SELECT p.id, p.room_ref, p.description, p.total_qty, p.install_qty, p.install_sell, p.install_cost, p.fitter_name, p.projnos_id, ph.install_qty AS phinstqty, MAX(ph.timestamp) FROM insc_projs p LEFT JOIN insc_projs_history ph ON ph.projs_id=p.id WHERE p.timestamp > ? GROUP BY p.id, p.room_ref, p.description, p.total_qty, p.install_qty, p.install_sell, p.install_cost, p.fitter_name, p.projnos_id, phinstqty';
	
	//var sql = 'SELECT p.id, p.room_ref, p.description, p.total_qty, p.install_qty, p.install_sell, p.install_cost, p.fitter_name, p.projnos_id, ph.install_qty AS phinstqty, MAX(ph.timestamp) FROM insc_projs p LEFT JOIN insc_projs_history ph ON ph.projs_id=p.id WHERE p.room_ref=? AND p.projnos_id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?) GROUP BY p.id, p.room_ref, p.description, p.total_qty, p.install_qty, p.install_sell, p.install_cost, p.fitter_name, phinstqty';
	
	tx.executeSql(sql, [lastModified], SQLFindNewProjects_success);
}

function SQLFindNewProjects_success(tx, results) {
	var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record
		var rec = {'room_ref' : item.room_ref, 'description' : item.description, 'total_qty' : item.total_qty, 'install_qty' : item.phinstqty, 'install_sell' : item.install_sell, 'install_cost' : item.install_cost, 'fitter_name' : item.fitter_name, 'projnos_id' : item.projnos_id, 'timestamp' : item.timestamp};
		
		ar.push(rec);
	}
	
	// push to json
	JSONJSON['insc_projs'] = ar;
	
	// next
	db.transaction(SQLFindNewSnags, transaction_error);
}

function SQLFindNewSnags(tx) {
	var sql = 'SELECT * FROM insc_snags WHERE timestamp > ?';
	tx.executeSql(sql, [lastModified], SQLFindNewSnags_success);
}

function SQLFindNewSnags_success(tx, results) {
	var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record 
		var rec = {'title' : item.title, 'added_by' : item.added_by, 'status' : item.status, 'update_date' : item.update_date, 'review_cm' : item.review_cm, 'review_desc' : item.review_desc, 'review_img' : item.review_img, 'review_log' : item.review_log, 'coords' : item.coords, 'projs_id' : item.projs_id, 'site_no' : item.site_no, 'filename' : item.filename, 'page_num' : item.page_num, 'timestamp' : item.timestamp};
		
		ar.push(rec);
	}
	
	// push to json
	JSONJSON['insc_snags'] = ar;
	
	// next
	db.transaction(SQLFindNewProjectHistory, transaction_error);
}




function SQLFindNewProjectHistory(tx) {
	
    //var sql = 'SELECT * FROM insc_projs_history WHERE timestamp > ?';
    //tx.executeSql(sql, [lastModified], SQLFindNewProjectHistory_success);

    var sql = 'SELECT * FROM insc_projs';
	tx.executeSql(sql, SQLFindNewProjectHistory_success);

}

function SQLFindNewProjectHistory_success(tx, results) {
	var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record 
		var rec = {'projs_id' : item.projs_id, 'install_qty' : item.install_qty, 'timestamp' : item.timestamp};
		
		ar.push(rec);
	}
	
	// push to json
	JSONJSON['insc_projs_history'] = ar;
	
	// next
	//db.transaction(SQLFindNewImages, transaction_error);
    syncSync(JSON.stringify(JSONJSON));    
    
}

function SQLFindNewImages(tx) {
	var sql = 'SELECT * FROM insc_projs_history WHERE timestamp > ?';
	tx.executeSql(sql, [lastModified], SQLFindNewImages_success);
}

function SQLFindNewImages_success(tx, results) {
	var ar = [];
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var item = results.rows.item(i);
		
		// create record 
		var rec = {'filename' : item.filename, 'snag_id' : item.snag_id, 'creation_date' : item.creation_date, 'timestamp' : item.timestamp};
		
		ar.push(rec);
	}
	
	// push to json
	JSONJSON['insc_imgs'] = ar;
	
	// next
	getListOfPDFDrawings();
}

function getListOfPDFDrawings() {
	//var ar = [];
	
	// TODO
	
	//window.resolveLocalFileSystemURI('file:///data/data/com.org.inscapeapp/', onLPDFSuccess, onLPDFError);
	
	// push to json
	JSONJSON['insc_pdfs'] = [];
	
	// upload new data to server
	//
	syncSync(JSON.stringify(JSONJSON));
}

function onLPDFSuccess(fileEntry) {
	
}

var objnewdata = {};
function syncSync(json) {
	console.log(json);
	console.log('LOG.INDEX: Start syncing...');
	
	$.ajax({
        type : 'POST',
        url : 'http://www.cubiclesandwashrooms.co.uk/receive.php',
        dataType : 'json',
        data : json,
        success : function(data) {
            console.log('LOG.INDEX: Receiving data...');
            
            //console.log(data);
            
            //
            // TODO
            //
            //objnewdata = JSON.parse(data);
           
            //syncFinish(objnewdata, lastModified);
        },
        error : function(jqXHR, textStatus, errorThrown) {
			console.log('ERR.INDEX: Sync failed, '+jqXHR+';'+textStatus+';'+errorThrown);
			
			//navigator.notification.alert('Synchronization failed', function(){}, 'Error');
        }
    });
    
    alert("Databases have been syncronised");  
    
    return true;
}

function syncFinish(new_data, last_mod) {
	//updateInscUsers(new_data.insc_users, last_mod);
	var i = 0
	var in_users = new_data.insc_users;
	for(i=0; i<in_users.length; i++) {
		db.transaction(function(tx){SQLUpdateUsers(tx, in_users[i][0])}, transaction_error);
	}
	
	var in_projnos = new_data.insc_projnos;
	for(i=0; i<in_projnos.length; i++) {
		db.transaction(function(tx){SQLUpdateProjnos(tx, in_projnos[i][0])}, transaction_error);
	}
	
	var in_projs = new_data.insc_projs;
	for(i=0; i<in_projs.length; i++) {
		db.transaction(function(tx){SQLUpdateProjs(tx, in_projs[i][0])}, transaction_error);
	}
	
	var in_projs_history = new_data.insc_projs_history;
	for(i=0; i<in_projs_history.length; i++) {
		db.transaction(function(tx){SQLUpdateProjsHistory(tx, in_projs_history[i][0])}, transaction_error);
	}
	
	var in_snags = new_data.insc_snags;
	for(i=0; i<in_snags.length; i++) {
		db.transaction(function(tx){SQLUpdateSnags(tx, in_snags[i][0])}, transaction_error);
	}
	
	var in_imgs = new_data.insc_imgs;
	for(i=0; i<in_imgs.length; i++) {
		db.transaction(function(tx){SQLUpdateImgs(tx, in_imgs[i][0])}, transaction_error);
	}
	
	db.transaction(function(tx) {
		tx.executeSql('INSERT INTO insc_lastmod (timestamp) VALUES (?)', [last_mod], function(tx, results){
//			var rowId = results.insertId;
			console.log('LOG.INDEX: Database, sync insc_lastmod (added): ' + results.insertId);
		});
	}, transaction_error);
}

function SQLUpdateUsers(tx, user) {
	//var sql = 'REPLACE INTO insc_users (username, password, email, role_id, team_id, reg_date, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)';
	//var sql = 'UPDATE OR IGNORE insc_users SET username=?, password=?, email=?, role_id=?, team_id=?, reg_date=?, timestamp=? WHERE username=?; INSERT INTO insc_users';
	//tx.executeSql(sql, [user.username, user.password, user.email, user.role_id, user.team_id, user.reg_date, user.timestamp, user.username], SQLUpdateUsers_success);
	
	var sql = 'SELECT * FROM insc_users WHERE username=?';
	tx.executeSql(sql, [user.username], SQLUpdateUsers_success);
}

function SQLUpdateUsers_success(tx, results) {
	//var rowId = results.insertId;
	//console.log('LOG.INDEX: Database, sync insc_users: ' + results.insertId);
	
	var len = results.rows.length;
	if(len > 0) {
		// update
		db.transaction(function(tx){SQLUpdateUserRecord(tx, objnewdata.insc_users)}, transaction_error);
	} else {
		// insert
		db.transaction(function(tx){SQLAddUserRecord(tx, objnewdata.insc_users)}, transaction_error);
	}
}

function SQLUpdateUserRecord(tx, user) {
	var sql = 'UPDATE insc_users SET username=?, password=?, email=?, role_id=?, team_id=?, reg_date=?, timestamp=? WHERE username=?';
	tx.executeSql(sql, [user.username, user.password, user.email, user.role_id, user.team_id, user.reg_date, user.timestamp, user.username], SQLUpdateUserRecord_success);
}

function SQLUpdateUserRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_users (updated): ' + results.insertId);
}

function SQLAddUserRecord(tx, user) {
	var sql = 'INSERT INTO insc_users (username, password, email, role_id, team_id, reg_date, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)';
	tx.executeSql(sql, [user.username, user.password, user.email, user.role_id, user.team_id, user.reg_date, user.timestamp], SQLAddUserRecord_success);
}

function SQLAddUserRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_users (added): ' + results.insertId);
}



function SQLUpdateProjnos(tx, projno) {
	var sql = 'SELECt * FROM insc_projnos WHERE project_no=?';
	tx.executeSql(sql, [projno.project_no], SQLUpdateProjnos_success);
}

function SQLUpdateProjnos_success(tx, results) {
	var len = results.rows.length;
	if(len > 0) {
		// update
		db.transaction(function(tx){SQLUpdateProjnoRecord(tx, objnewdata.insc_projnos)}, transaction_error);
	} else {
		// insert
		db.transaction(function(tx){SQLAddProjnoRecord(tx, objnewdata.insc_projnos)}, transaction_error);
	}
}

function SQLUpdateProjnoRecord(tx, projno) {
	var sql = 'UPDATE insc_projnos SET project_no=?, customer=?, site=?, site_no=?, contract_manager=?, timestamp=? WHERE project_no=?';
	tx.executeSql(sql, [projno.project_no, projno.customer, projno.site, projno.site_no, projno.contract_manager, projno.timestamp, projno.project_no], SQLUpdateProjnoRecord_success);
}

function SQLUpdateProjnoRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_projnos (updated): ' + results.insertId);
}

function SQLAddProjnoRecord(tx, projno) {
	var sql = 'INSERT INTO insc_projnos (project_no, customer, site, site_no, contract_manager, timestamp) VALUES (?, ?, ?, ?, ?, ?)';
	tx.executeSql(sql, [projno.project_no, projno.customer, projno.site, projno.site_no, projno.contract_manager, projno.timestamp], SQLAddProjnoRecord_success);
}

function SQLAddProjnoRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_projnos (added): ' + results.insertId);
}



function SQLUpdateProjs(tx, proj) {
	var sql = 'SELECt * FROM insc_projs WHERE projnos_id=? AND room_ref=?';
	tx.executeSql(sql, [proj.projnos_id, proj.room_ref], SQLUpdateProjs_success);
}

function SQLUpdateProjs_success(tx, results) {
	var len = results.rows.length;
	if(len > 0) {
		// update
		db.transaction(function(tx){SQLUpdateProjRecord(tx, objnewdata.insc_projs)}, transaction_error);
	} else {
		// insert
		db.transaction(function(tx){SQLAddProjRecord(tx, objnewdata.insc_projs)}, transaction_error);
	}
}

function SQLUpdateProjRecord(tx, proj) {
	var sql = 'UPDATE insc_projs SET room_ref=?, description=?, total_qty=?, install_qty=?, install_sell=?, install_cost=?, fitter_name=?, projnos_id=?, timestamp=? WHERE projnos_id=? AND room_ref=?';
	tx.executeSql(sql, [proj.room_ref, proj.description, proj.total_qty, proj.install_qty, proj.install_sell, proj.install_cost, proj.fitter_name, proj.projnos_id, proj.timestamp, proj.projnos_id, proj.room_ref], SQLUpdateProjRecord_success);
}

function SQLUpdateProjRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_projs (updated): ' + results.insertId);
}

function SQLAddProjRecord(tx, proj) {
	var sql = 'INSERT INTO insc_projs (room_ref, description, total_qty, install_qty, install_sell, install_cost, fitter_name, projnos_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
	tx.executeSql(sql, [proj.room_ref, proj.description, proj.total_qty, proj.install_qty, proj.install_sell, proj.install_cost, proj.fitter_name, proj.projnos_id, proj.timestamp], SQLAddProjRecord_success);
}

function SQLAddProjRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_projs (added): ' + results.insertId);
}



function SQLUpdateProjsHistory(tx, ph) {
	var sql = 'SELECt * FROM insc_projs_history WHERE projs_id=?';
	tx.executeSql(sql, [ph.projs_id], SQLUpdateProjsHistory_success);
}

function SQLUpdateProjsHistory_success(tx, results) {
	var len = results.rows.length;
	if(len > 0) {
		// update
		db.transaction(function(tx){SQLUpdateProjsHistoryRecord(tx, objnewdata.insc_projs_history)}, transaction_error);
	} else {
		// insert
		db.transaction(function(tx){SQLAddProjsHistory(tx, objnewdata.insc_projs_history)}, transaction_error);
	}
}

function SQLUpdateProjsHistoryRecord(tx, ph) {
	var sql = 'UPDATE insc_projs_history SET projs_id=?, install_qty=? timestamp=? WHERE projs_id=?';
	tx.executeSql(sql, [ph.projs_id, ph.install_qty, ph.timestamp, ph.projs_id], SQLUpdateProjsHistoryRecord_success);
}

function SQLUpdateProjsHistoryRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_projs_history (updated): ' + results.insertId);
}

function SQLAddProjsHistory(tx, ph) {
	var sql = 'INSERT INTO insc_projs_history (projs_id, install_qty, timestamp) VALUES (?, ?, ?)';
	tx.executeSql(sql, [ph.projs_id, ph.install_qty, ph.timestamp], SQLAddProjsHistory_success);
}

function SQLAddProjsHistory_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_projs_history (added): ' + results.insertId);
}



function SQLUpdateSnags(tx, snag) {
	var sql = 'SELECt * FROM insc_snags WHERE projs_id=? AND site_no=? AND filename=? AND page_num=? AND coords=?';
	tx.executeSql(sql, [snag.projs_id, snag.site_no, snag.filename, snag.page_num, snag.coords], SQLUpdateSnags_success);
}

function SQLUpdateSnags_success(tx, results) {
	var len = results.rows.length;
	if(len > 0) {
		// update
		db.transaction(function(tx){SQLUpdateSnagRecord(tx, objnewdata.insc_snags)}, transaction_error);
	} else {
		// insert
		db.transaction(function(tx){SQLAddSnagRecord(tx, objnewdata.insc_snags)}, transaction_error);
	}
}

function SQLUpdateSnagRecord(tx, snag) {
	var sql = 'UPDATE insc_snags SET title=?, added_by=?, status=?, update_date=?, review_cm=?, review_desc=?, review_img=?, review_log, coords=?, projs_id=?, site_no=?, filename=?, page_num=?, timestamp=? WHERE projs_id=? AND site_no=? AND filename=? AND page_num=? AND coords=?';
	tx.executeSql(sql, [snag.title, snag.added_by, snag.status, snag.update_date, snag.review_cm, snag.review_desc, snag.review_img, snag.review_log, snag.coords, snag.projs_id, snag.site_no, snag.filename, snag.page_num, snag.timestamp, snag.projs_id, snag.page_num, snag.coords], SQLUpdateSnagRecord_success);
}

function SQLUpdateSnagRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_snags (updated): ' + results.insertId);
}

function SQLAddSnagRecord(tx, snag) {
	var sql = 'INSERT INTO insc_snags (title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	tx.executeSql(sql, [snag.title, snag.added_by, snag.status, snag.update_date, snag.review_cm, snag.review_desc, snag.review_img, snag.review_log, snag.coords, snag.projs_id, snag.site_no, snag.filename, snag.page_num, snag.timestamp], SQLAddSnagRecord_success);
}

function SQLAddSnagRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_snags (added): ' + results.insertId);
}



function SQLUpdateImgs(tx, img) {
	var sql = 'SELECt * FROM insc_imgs WHERE snag_id=?';
	tx.executeSql(sql, [img.snag_id], SQLUpdateImgs_success);
}

function SQLUpdateImgs_success(tx, results) {
	var len = results.rows.length;
	if(len > 0) {
		// update
		db.transaction(function(tx){SQLUpdateImgRecord(tx, objnewdata.insc_snags)}, transaction_error);
	} else {
		// insert
		db.transaction(function(tx){SQLAddImgRecord(tx, objnewdata.insc_snags)}, transaction_error);
	}
}

function SQLUpdateImgRecord(tx, img) {
	var sql = 'UPDATE insc_imgs SET filename=?, snag_id=?, creation_date=?, timestamp=? WHERE snag_id=?';
	tx.executeSql(sql, [img.filename, img.snag_id, img.creation_date, img.timestamp, img.snag_id], SQLUpdateImgRecord_success);
}

function SQLUpdateImgRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_imgs (updated): ' + results.insertId);
}

function SQLAddImgRecord(tx, img) {
	var sql = 'INSERT INTO insc_imgs (filename, snag_id, creation_date, timestamp) VALUES (?, ?, ?, ?)';
	tx.executeSql(sql, [img.filename, img.snag_id, img.creation_date, img.timestamp], SQLAddImgRecord_success);
}

function SQLAddImgRecord_success(tx, results) {
	//var rowId = results.insertId;
	console.log('LOG.INDEX: Database, sync insc_imgs (added): ' + results.insertId);
}


  