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
	displaySnagList(window.localStorage['whichSite'], window.localStorage['whichRoom']);
	
	
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
	window.location.href = 'snagreview.html?id=' + id;
}







function displaySnagList(site_no, room_ref) {
	// clear all rows
	//
    $('#snagList').find('tbody').empty();
	
	//
	//
	db.transaction(function(tx){getAllSnags(tx, site_no, room_ref)}, transaction_error);
}

function getAllSnags(tx, site_no, room_ref) {
	var sql = 'SELECT s.id, s.title, u.username, s.status, s.update_date FROM insc_snags s LEFT JOIN insc_users u ON u.id=s.added_by WHERE s.projs_id IN (SELECT p.id FROM insc_projs p WHERE p.room_ref=? AND p.projnos_id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?)) ORDER BY s.status';
	tx.executeSql(sql, [room_ref, site_no], getAllSnags_success);
}

function getAllSnags_success(tx, results) {
	var len = results.rows.length;
	//console.log('snags found: '+len);
    for (var i=0; i<len; i++) {
    	var snag = results.rows.item(i);
    	
    	$('#snagList tbody').append('<tr class="snag-' + snag.status + '">' + 
    					'<td>' + snag.id + '</td>' + 
    					'<td>' + snag.title + '</td>' + 
    					'<td>' + snag.username + '</td>' + 
    					'<td>' + getSnagStatus(snag.status) + '</td>' + 
    					'<td>' + getDate(snag.update_date) + '</td>' + 
    					'<td id="snag-review">' + '<a href="#" id="review-' + snag.id + '" data-role="button" data-inline="true" class="ui-btn-right">Review</a>' + '</td>' + 
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