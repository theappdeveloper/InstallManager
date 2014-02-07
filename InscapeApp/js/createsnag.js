var db;
var cx = getUrlVars()["cx"]; // coordinates x
var cy = getUrlVars()["cy"]; // coordinates y


function init() {
	document.addEventListener("deviceready", deviceReady, true);
	//delete init;
}

function deviceReady() {
	//
	//
	$('#createSnagBack').on('tap', createSnagBack);
	//$('#updateLog').on('tap', updateLog);
	$('#saveSnag').on('tap', saveSnag);
	$('#cancelSnag').on('tap', cancelSnag);
	//$('#viewSnagList').on('tap', viewSnagList);
    $('#workList').on('tap', gotoWorkList);
    $('#snagList').on('tap', gotoSnagList);
    
	
	// open database
	//
	db = window.openDatabase("InscapeDB", "1.0", "Inscape DB Demo", 200000);
	
	// display fullname, role, and site
	//
	if (window.localStorage['username'] != undefined && window.localStorage['role'] != undefined) {
		$('#fullName').text(window.localStorage['username']);
		$('#roleTitle').text(window.localStorage['role']);
	}
	
	// display site, room or maybe customer and project no
	//
	if(window.localStorage['whichCustumer'] != '' && window.localStorage['whichProject'] != '') {
		$('#siteName').text(window.localStorage['whichCustomer']);
		//$('#projectNum').text(window.localStorage['whichProject']);
        $('#projectNum').text(window.localStorage['whichSitename']);
        
		$('#roomRef').text(window.localStorage['whichRoom']);
        $('#addedBy').text(window.localStorage['username']);
	}
	
	// display added by
	//
	if (window.localStorage['username'] != undefined && window.localStorage['role'] != undefined) {
		$('#addedBy').val(window.localStorage['username']);
	}
	
	// display project options
	//
	displayProjectOptions(window.localStorage['whichSite'], window.localStorage['whichRoom']);
	
}



function gotoWorkList() {
	console.log('LOG.CREATESNAG: Going to worklist.html');
	window.location.href = 'worklist.html';
}

function gotoSnagList() {
	console.log('LOG.CREATESNAG: Going to SnagList.html');
	window.location.href = 'snaglist.html';
}


function createSnagBack() {
	console.log('LOG.CREATESNAG: Going to viewdrawing.html');
	window.location.href = 'viewdrawing.html';
}

function cancelSnag() {
	console.log('LOG.CREATESNAG: Cancel snag creation');
	console.log('LOG.CREATESNAG: Going to viewdrawing.html');
	window.location.href = 'viewdrawing.html';
}

function saveSnag() {
	// get snag info
	//
	var pv = $('#selectProject option:selected').val();
	var st = $('#snagTitle').val();
	var sc = $('#addedBy').val();
	var sd = $('#description').val();
	var sl = $('#log').val();
	
	if(pv == 'Select a product...') {
		navigator.notification.alert(
			'Select a product', 
			function() {},
			'Error');
		return;
	}
		
	if(st == 'Select a category...') {
		navigator.notification.alert(
			'Please enter a category', 
			function() {},
			'Error');
		return;
	}
    
    if(sd == '') {
		navigator.notification.alert(
			'Please enter a description', 
			function() {},
			'Error');
		return;
	}
	
	saveSnagDetail2(sc, st, sd, sl, cx+';'+cy, pv, window.localStorage['whichSite'], window.localStorage['whichPDF'], window.localStorage['whichPage']);
}





function displayProjectOptions(site_no, room_ref) {
	db.transaction(function(tx){SQLGetAllProjects(tx, site_no, room_ref)}, transaction_error);
}

function SQLGetAllProjects(tx, site_no, room_ref) {
	var sql = 'SELECT p.id, p.room_ref, p.description FROM insc_projs p WHERE p.room_ref=? AND projnos_id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?)';
	tx.executeSql(sql, [room_ref, site_no], SQLGetAllProjects_success);
}

function SQLGetAllProjects_success(tx, results) {
	var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var p = results.rows.item(i);
    	
    	//
    	// append project options
    	//
    	$('#selectProject').append('<option value="' + p.id+ '">' + p.description + '</option>');
    }
}





function saveSnagDetail2(snag_adder, snag_title, snag_desc, snag_log, coords, projs_id, site_no, filename, page_num) {
	db.transaction(function(tx){SQLSaveSnagDetail2(tx, snag_adder, snag_title, snag_desc, snag_log, coords, projs_id, site_no, filename, page_num)}, transaction_error);
}

function SQLSaveSnagDetail2(tx, snag_adder, snag_title, snag_desc, snag_log, coords, projs_id, site_no, filename, page_num) {
	var time = currentTimeMillis();
	
	var sql = 'INSERT INTO insc_snags (title, added_by, status, update_date, review_cm, review_desc, review_img, review_log, coords, projs_id, site_no, filename, page_num, timestamp) SELECT ?, u.id, 0, ?, 0, ?, 0, ?, ?, ?, ?, ?, ?, ? FROM insc_users u WHERE u.username=?';
	tx.executeSql(sql, [snag_title, time, snag_desc, snag_log, coords, projs_id, site_no, filename+'.pdf', page_num, time, snag_adder], SQLSaveSnagDetail2_success);
}

function SQLSaveSnagDetail2_success(tx, results) {
	var snagInsertId = results.insertId;
	console.log('Snag inserted row ID = ' + results.insertId);
		
	console.log('LOG.CREATESNAG: Database, new snag record inserted');
	
	navigator.notification.alert(
		'Snag is created!', 
		function() {
			console.log('LOG.CREATESNAG: Going to snagreview.html');
			window.location.href = 'snagreview.html?id=' + snagInsertId;
		},
		'Done'
		);
}

function transaction_error(tx, error) {
	alert("Database Error: " + error);
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function currentTimeMillis() {
	var d = new Date();
	return d.getTime();
}