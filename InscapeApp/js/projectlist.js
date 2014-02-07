var db;


function init() {
	document.addEventListener("deviceready", deviceReady, true);
	//delete init;
}

function deviceReady() {
	$('#snagListBack').on('tap', snagListBack);
	$('#viewDrawing').on('tap', viewDrawing);
	$('#viewWorkList').on('tap', viewWorkList);
	
	// open database
	//
	db = window.openDatabase("InscapeDB", "1.0", "Inscape DB Demo", 200000);
	
	// display fullname, role
	//
	if(window.localStorage['username'] != undefined && window.localStorage['role'] != undefined) {
		$('#fullName').text(window.localStorage['username']);
		$('#roleTitle').text(window.localStorage['role']);
	}
	
	// display site, room or maybe customer and project no
	//
	if(window.localStorage['whichCustumer'] != '' && window.localStorage['whichProject'] != '') {
		$('#siteName').text(window.localStorage['whichCustomer']);
		$('#projectNum').text(window.localStorage['whichProject']);
		$('#roomRef').text(window.localStorage['whichRoom']);
	}
	
	// display snag list
	//
	//displaySnagList(window.localStorage['whichSite'], window.localStorage['whichRoom']);
	
	//display Project List
    displayProjects();
    
}




function snagListBack() {
	console.log('LOG.SNAGLIST: Going to worklist.html');
	window.location.href = "worklist.html";
}

function viewDrawing() {
	if(window.localStorage['whichSite'] != '' && window.localStorage['whichRoom'] != '' && window.localStorage['whichCustomer'] != '' && window.localStorage['whichProject'] != '') {
		console.log('LOG.SNAGLIST: Going to viewdrawinglist.html');
		window.location.href = 'viewdrawinglist.html';
	}
	
	
}

function viewWorkList() {
	console.log('LOG.SNAGLIST: Going to worklist.html');
	window.location.href = 'worklist.html';
}

function snagReview() {
	var id = $(this).attr('id');
	id = id.substring(7);
	
	console.log('LOG.SNAGLIST: Going to snagreview.html (snag_id = '+id+')');
	//window.localStorage['whichSnag'] = id;
	window.location.href = 'worklist.html?id=' + id;
}

function displayProjects() {
	// clear all rows
	//
    $('#snagList').find('tbody').empty();
	
	//
	//
	db.transaction(function(tx){getAllProjects(tx)}, transaction_error);
}

function getAllProjects(tx, site_no, room_ref) {
	var sql = 'SELECT DISTINCT site, site_no FROM insc_projnos ORDER BY site';
    tx.executeSql(sql, [], getAllProjects_success);
}




function getAllProjects_success(tx, results) {
	var len = results.rows.length;
	//console.log('snags found: '+len);
    for (var i=0; i<len; i++) {
    	var projects = results.rows.item(i);
    	
    	$('#snagList tbody').append('<tr class="snag-' + i + '">' + 
    					'<td>' + projects.site + '</td>' + 
    					'<td id="snag-review">' + '<a href="#" id="review-' + projects.site_no + '" data-role="button" data-inline="true" class="ui-btn-right">Review</a>' + '</td>' + 
    					'</tr>');
    					
		// add event to review button
		//
		$('#snag-review a').on('tap', snagReview);
    }
}


function transaction_error(tx, error) {
	alert("Database Error: " + error);
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

function getSnagStatus(idx) {
	var s = '';
	switch(idx) {
		case 0:
			s = 'Snag';
			break;
		case 1:
			s = 'Desnagged';
			break;
		case 2:
			s = 'Approved';
			break;
		default:
			break;
	}
	return s;
}