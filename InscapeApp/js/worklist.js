var db;
var id = getUrlVars()["id"]; // project id
var drawing_gotoId;
var idex = 0;
var tidex = 0;


function init() {
	document.addEventListener("deviceready", deviceReady, true);
		//console.log('worklist init fired');
	//delete init;
}

function deviceReady() {
	//console.log('device ready fired');
	// check user session
	//
	if(window.localStorage['isLoggedIn'] == undefined || !window.localStorage['isLoggedIn']) {
		// go back to login
		//
		console.log('LOG.WORKLIST: Going to login.html page');
		window.location.href = 'index.html';
		
		return false;
	}
	
	
	
	
	
	//
	//
	$("#worklistLogout").on("tap", worklistLogout);
	//$('#createJob').on("tap", createJob);
	$("#viewSnagList").on("tap", viewSnagList);
    $("#addSnag").on("tap", addSnag);
    
	//$('#viewSnagList').attr('disabled', 'disabled');
	$("#viewDrawing").on("tap", viewDrawing);
	//$('#viewDrawing').attr('disabled', 'disabled');
	$('#selectSite').on("change", selectSiteListener);
	$('#selectRoom').on("change", selectRoomListener);
    
	
	// open database
	//
	db = window.openDatabase("InscapeDB", "1.0", "Inscape DB Demo", 200000);
	
	// display fullname, role
	//
	if(window.localStorage['username'] != undefined && window.localStorage['role'] != undefined) {
		$('#fullName').text(window.localStorage['username']);
		$('#roleTitle').text(window.localStorage['role']);
	}
	
	// initialise table header
	//
	if(window.localStorage['role'] != undefined && window.localStorage['role'] != '') {
		initTableByTeam(window.localStorage['role']);
	}
	
	// load site and room options, make selected
	//
	if(window.localStorage['whichSite'] != undefined && window.localStorage['whichSite'] != '' && window.localStorage['whichRoom'] != undefined && window.localStorage['whichRoom'] != '') {
		// add site options, and make selected
		//
		
		//console.log('addsiteoptions1');
		addSiteOptions(window.localStorage['whichSite']);
		
		// add room options, and make selected
		//
		//console.log('addroomoptions');
		addRoomOptions(window.localStorage['whichSite'], window.localStorage['whichRoom']);
		
		// make site, room option selected
		//
         displayInstallationDetails(window.localStorage['whichSite'], window.localStorage['whichRoom']);
      
	} else {
		// add site options
		//
		//console.log('addsiteoptions2');
		addSiteOptions('');
	}
    
}

function worklistLogout() {
	if(window.localStorage['isLoggedIn'] != undefined) {
		window.localStorage.removeItem('isLoggedIn');
	}
	
	// TODO clear local storage variables
	//
	
	
	// go to index.html
	//
	console.log("LOG.WORKLIST: logging out");
	window.location.href = "index.html";
}

function viewSnagList() {
	console.log('LOG.WORKLIST: site_no='+window.localStorage['whichSite']+';room_ref='+window.localStorage['whichRoom']);
	
	if(window.localStorage['whichSite'] != '' && window.localStorage['whichRoom'] != '' && window.localStorage['whichCustomer'] != '' && window.localStorage['whichProject'] != '') {
		console.log('LOG.WORKLIST: Going to snaglist.html');
		window.location.href = 'snaglist.html';
	} else {
		navigator.notification.alert(
			'Select site and room first!', 
			function() {},
			'Error'
			);
	}

}

function addSnag() {
	console.log('LOG.WORKLIST: site_no='+window.localStorage['whichSite']+';room_ref='+window.localStorage['whichRoom']);
	
	if(window.localStorage['whichSite'] != '' && window.localStorage['whichRoom'] != '' && window.localStorage['whichCustomer'] != '' && window.localStorage['whichProject'] != '') {
		console.log('LOG.WORKLIST: Going to createsnag.html');
        navigator.notification.alert(
			'You are about to enter a snag for ' + window.localStorage['whichSitename'] + ' in room ' + window.localStorage['whichRoom']  , 
			function() {},
			'Message'
			);
		window.location.href = 'createsnag.html';
	} else {
		navigator.notification.alert(
			'Select site and room first!', 
			function() {},
			'Error'
			);
	}

}



function viewDrawing() {
	console.log('LOG.WORKLIST: site_no='+window.localStorage['whichSite']+';room_ref='+window.localStorage['whichRoom']);
	
	if(window.localStorage['whichSite'] != '' && window.localStorage['whichRoom'] != '' && window.localStorage['whichCustomer'] != '' && window.localStorage['whichProject'] != '') {
		console.log('LOG.WORKLIST: Going to viewdrawinglist.html');
		window.location.href = 'viewdrawinglist.html';
	} else {
		navigator.notification.alert(
			'Select site and room first!', 
			function() {},
			'Error'
			);
	}
}



function editInstallQtyPrompt() {
	
	var id = $(this).attr('id');
	projId = id.substring(5);
	//alert(projId);
	var value = $(this).text();
	var max = $(this).attr('max');
	navigator.notification.prompt(
		    'Please enter a value',
		    function(results){onEditInstallQtyPrompt(results, projId, value, max)},
		    'Edit install qty',
		    ['Ok','Cancel'],
            ''
	);
	
}



function onEditInstallQtyPrompt(results, projId, value, max) {
	//alert('call onedit function');
	if(results.buttonIndex == 1) { // OK
		// validate input
		//
		var input = parseInt(results.input1);
		if(isNaN(input)) {
			navigator.notification.alert(
					'Invalid input, number only', 
					function() {},
					'Error'
			);
		} else {
			if(input > max ) {
				navigator.notification.alert(
					'You cant install more than the outstanding quantity', 
					function() {},
					'Error'
				);
			} else {
				if(isInt(input)) {
					//console.log('new input: '+input);
					updateProjectHistory(projId, input);
				} else {
					navigator.notification.alert(
						'Integer only', 
						function() {},
						'Error'
					);
				}
			}
		}
	}
}

function updateProjectHistory(project_id, new_value) {
	db.transaction(function(tx) {SQLUpdateProjectHistory(tx, project_id, new_value)}, transaction_error);
}

function SQLUpdateProjectHistory(tx, project_id, new_value) {
	var time = currentTimeMillis();
   
	var this_project_id = project_id;
    
    var unique_id =  this_project_id + '/' + time
    console.log(unique_id);
	var sql = 'INSERT INTO insc_projs_history (projs_id, install_qty, timestamp, unique_id) VALUES (?, ?, ?,?)';
    console.log(project_id);
	tx.executeSql(sql, [project_id, new_value, time, unique_id], SQLUpdateProjectHistory_success);
}

function SQLUpdateProjectHistory_success(tx, results) {
	//var phInsertId = results.insertId;
	console.log('LOG.WORKLIST: Database, project-history inserted row ID = ' + results.insertId );
	
	navigator.notification.alert(
		'Install qty updated!', 
		function() {
			// clear project list
			//
			$('#workList').find('tbody').empty();
			
			// refresh project list
			//
			db.transaction(function(tx){SQLGetProjectList(tx, window.localStorage['whichSite'], window.localStorage['whichRoom'])}, transaction_error);
		},
		'Done'
		);
}




function selectSiteListener() {
	
	
	var s = $('#selectSite option:selected');
	console.log("option selected text " + s.text() );
	console.log("option selected val " + s.val() );
	
	// remove colour of site selection's parent div
	//
	//console.log("remove snags from parent " + 'selectSite' );
	
	removeSnagCssFromParent('selectSite');

	//
	//
	if(s.text() == 'Select a site...') {		
		// clear local storage variables
		//
		window.localStorage['whichSite'] = '';
		window.localStorage['whichSitename'] = '';
	} else {
		// colour its parent div
		//
		copySelectedSnagCssToParent('selectSite');
	
		// assign new value to local storage variables
		//
		console.log("site is " + s.val() + "which site name is " + s.text() );
		
		window.localStorage['whichSite'] = s.val();
		window.localStorage['whichSitename'] = s.text();
	}
	
	// clear room options, and related local storage variables
	//
	$('#selectRoom').find('option').remove().end().append('<option>Select a room...</option>');
	$('#selectRoom').selectmenu('refresh');
	window.localStorage['whichRoom'] = '';
	window.localStorage['whichRoomname'] = '';
	
	// remove colour of room selection's parent div
	//
	removeSnagCssFromParent('selectRoom');
	
	// clear installation details, customer, project no, and related local storage variables
	//
	$('#customer').val('');
	$('#projectNo').val('');
	window.localStorage['whichCustomer'] = '';
	window.localStorage['whichProject'] = '';
	
	// clear project list
	//
    $('#workList').find('tbody').empty();
	
	// add room options
	//
		//console.log("add room options" + window.localStorage['whichSite']);
	
	addRoomOptions(window.localStorage['whichSite'], '');
	
	// load room selection
	//
	//loadRoomSelectionBySite(site_id);
    
   displayCustomer(window.localStorage['whichSite'])
}

function selectRoomListener() {
	//console.log("Select Room Listener Button Pressed");
	if(window.localStorage['whichSite'] != undefined && window.localStorage['whichSite'] != '') {
		var s = $('#selectRoom option:selected');
	
		// remove color of its parent div
		//
		removeSnagCssFromParent('selectRoom');
	
		//
		//
		if(s.text() == 'Select a room...') {		
			// clear local storage variables
			//
			window.localStorage['whichRoom'] = '';
			window.localStorage['whichRoomname'] = '';
		} else {
			// color its parent div
			//
			copySelectedSnagCssToParent('selectRoom');
		
			// assign new value to local storage variables
			//
			window.localStorage['whichRoom'] = s.val();
			window.localStorage['whichRoomname'] = s.text();
		}
		
		// clear customer, project no
		//
		// do nothing or TODO
		
		// clear project list
		//
		$('#workList').find('tbody').empty();
		
		//
		//
		displayInstallationDetails(window.localStorage['whichSite'], window.localStorage['whichRoom']);
		

	} else {
		navigator.notification.alert(
			'Select site first!', 
			function() {},
			'Error'
			);
	}
}





function makeOptionSelected(element_id, option_value) {
	$('#'+element_id).val(option_value).attr('selected', true);
	$('#'+element_id).selectmenu('refresh');
}





function addSiteOptions(selected_site_no) {
	//console.log("addsiteoptions Selected Site No is " + selected_site_no );
	
	db.transaction(function(tx){SQLGetAllSites(tx, selected_site_no)}, transaction_error);
}

function SQLGetAllSites(tx, selectedsiteno) {
	console.log("SQLGetAllSites Selected Site No is " + selectedsiteno );
	
	var sql = 'SELECT DISTINCT site, site_no FROM insc_projnos ORDER BY site';
	//var sql = 'SELECT DISTINCT site, project_no FROM insc_projnos ORDER BY site';
	
	tx.executeSql(sql, [], function(tx, results){SQLGetAllSites_success(tx, results, selectedsiteno)});
    
}

function SQLGetAllSites_success(tx, results, selected_site_no) {
	
	var len = results.rows.length;
        
    for (var i=0; i<len; i++) {
    	var site = results.rows.item(i);
    	//console.log("358 SQLGetAllSites_success Selected Site is " + site );
	
    	// check snag status and color it
    	//
    	checkSnagStatusOnSite(site, selected_site_no);
    	//console.log("363 SQLGetAllSites_success Selected Site No is " + site.val + "Selected Site No is " + selected_site_no.text);
	
    }
    
}


function addRoomOptions(selected_site_no, selected_room_ref) {
	//console.log("add Room Options Selected Site No is " + selected_site_no + "Selected Room Ref is " + selected_room_ref);
	db.transaction(function(tx){SQLGetAllRooms(tx, selected_site_no, selected_room_ref)}, transaction_error);
}

function SQLGetAllRooms(tx, selected_site_no, selected_room_ref) {
	//console.log("SQLGetAllrooms Selected Site No is " + selected_site_no + "Selected Room Ref is " + selected_room_ref);
	
	var sql = 'SELECT DISTINCT p.room_ref FROM insc_projs p WHERE p.projnos_id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?) ORDER BY p.room_ref';
	//var sql = 'SELECT DISTINCT p.room_ref FROM insc_projs p WHERE p.id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?) ORDER BY p.room_ref';
	
	tx.executeSql(sql, [selected_site_no], function(tx, results){SQLGetAllRooms_success(tx, results, selected_site_no, selected_room_ref)});
}

function SQLGetAllRooms_success(tx, results, selected_site_no, selected_room_ref) {
	//console.log("SQLGetALLRoooms Selected Site No is " + selected_site_no + "Selected Room Ref is " + selected_room_ref);
	
	var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var room = results.rows.item(i);
    	
    	// check snag status
    	//
    	checkSnagStatusOnRoom(selected_site_no, room, selected_room_ref);
    }
}

function displayCustomer(site_no)
{
    db.transaction(function(tx){SQLGetCustomerAndProjectNo(tx, site_no)}, transaction_error);
}



function displayInstallationDetails(site_no, room_ref) {
	// display customer, project no
	//
	db.transaction(function(tx){SQLGetCustomerAndProjectNo(tx, site_no)}, transaction_error);
	
	// display project list
	//
	db.transaction(function(tx){SQLGetProjectList(tx, site_no, room_ref)}, transaction_error);
	
	// enable and initialize butoons
	//
	//$('#viewSnagList').removeAttr('disabled');
	//$('#viewDrawing').removeAttr('disabled');
    
	
}

function SQLGetCustomerAndProjectNo(tx, site_no) {
	var sql = 'SELECT project_no, customer, site FROM insc_projnos WHERE site_no=?';
	tx.executeSql(sql, [site_no], SQLGetCustomerAndProjectNo_success);
}

function SQLGetCustomerAndProjectNo_success(tx, results) {
	var len = results.rows.length;
    
	for (var i=0; i<len; i++) {
		var cp = results.rows.item(i);
		
		// display customer, project no
		//
		$('#customer').val(cp.customer);
		//$('#projectNo').val(cp.project_no);
        $('#projectNo').val(cp.site);
        
		window.localStorage['whichCustomer'] = cp.customer;
    	window.localStorage['whichProject'] = cp.project_no;
	}
}

function SQLGetProjectList(tx, site_no, room_ref) {
	//var sql = 'SELECT p.id, p.room_ref, p.description, p.total_qty, p.install_qty, p.install_sell, p.install_cost, p.fitter_name, ph.install_qty AS phinstqty, MAX(ph.timestamp) FROM insc_projs p LEFT JOIN insc_projs_history ph ON ph.projs_id=p.id WHERE p.room_ref=? AND p.projnos_id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?) GROUP BY p.id, p.room_ref, p.description, p.total_qty, p.install_qty, p.install_sell, p.install_cost, p.fitter_name, phinstqty';
	var sql = 'SELECT p.id, p.room_ref, p.description, p.total_qty, p.install_qty, p.install_sell, p.install_cost, p.fitter_name, sum(ph.install_qty) AS phinstqty, MAX(ph.timestamp) FROM insc_projs p LEFT JOIN insc_projs_history ph ON ph.projs_id=p.id WHERE p.room_ref=? AND p.projnos_id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?) GROUP BY p.id, p.room_ref, p.description, p.total_qty, p.install_qty, p.install_sell, p.install_cost, p.fitter_name';
    tx.executeSql(sql, [room_ref, site_no], SQLGetProjectList_success);
}

function SQLGetProjectList_success(tx, results) {
	var len = results.rows.length;
    
    for (var i=0; i<len; i++) {
        tidex = i;
		var project = results.rows.item(i);
		
		//console.log('------------------');
		//console.log(project.phinstqty);
		
		// check snag status
		//
		checkSnagStatusOnProject(project);
	}
}





function checkSnagStatusOnSite(site, selected_site_no) {
	//console.log("Check Snag Status on site site " + site + "site_no " + selected_site_no );
	
	db.transaction(function(tx){SQLCheckSnagStatusOnSite(tx, site, selected_site_no)}, transaction_error);
}

function SQLCheckSnagStatusOnSite(tx, site, selected_site_no) {
	//console.log("SQLCheckSnagStatusOnSite site " + site + "site_no " + selected_site_no );
	
	var sql = 'SELECT MIN(s.status) AS min_status FROM insc_snags s WHERE s.projs_id IN (SELECT p.id FROM insc_projs p WHERE p.projnos_id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?))';
	tx.executeSql(sql, [site.site_no], function(tx, results){SQLCheckSnagStatusOnSite_success(tx, results, site, selected_site_no)});
}

function SQLCheckSnagStatusOnSite_success(tx, results, site, selected_site_no) {

	//console.log("SQLCheckSnagStatusOnSite_success site " + site + "site_no " + selected_site_no );
	var snagCssClass='';
	
	var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var snag = results.rows.item(i);
    	snagCssClass = snag.min_status;
    }
    
    // add site option and colour it based on status
    //
    var ind = getSnagStatus(snagCssClass);
    
    snagCssClass = 'snag-' + snagCssClass;
    //console.log("selectSite Function " + site.site_no + "site_no " + site.site );
	
	$('#selectSite').append('<option value="' + site.site_no + '" class="' + snagCssClass + '">' + site.site + ind + '</option>');
    $('#selectSite').selectmenu('refresh');
    
    // try to make option selected
    //
    if(len > 0 && selected_site_no != '') {
		makeOptionSelected('selectSite', selected_site_no);
    }
    
    // colour div parent
    //
    copySelectedSnagCssToParent('selectSite');
}





function checkSnagStatusOnRoom(selected_site_no, room, selected_room_ref) {
	db.transaction(function(tx){SQLCheckSnagStatusOnRoom(tx, selected_site_no, room, selected_room_ref)}, transaction_error);
}

function SQLCheckSnagStatusOnRoom(tx, selected_site_no, room, selected_room_ref) {
	var sql = 'SELECT MIN(s.status) AS min_status FROM insc_snags s WHERE s.projs_id IN (SELECT p.id FROM insc_projs p WHERE p.room_ref=? AND p.projnos_id IN (SELECT pn.id FROM insc_projnos pn WHERE pn.site_no=?))';
	tx.executeSql(sql, [room.room_ref, selected_site_no], function(tx, results){SQLCheckSnagStatusOnRoom_success(tx, results, room, selected_room_ref)});
}

function SQLCheckSnagStatusOnRoom_success(tx, results, room, selected_room_ref) {
	var snagCssClass='';
	
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
		var snag = results.rows.item(i);
		snagCssClass = snag.min_status;
	}
	
	// add room option and colour it based on status
	//
	var ind = getSnagStatus(snagCssClass);
    
    snagCssClass = 'snag-' + snagCssClass;
    
	$('#selectRoom').append('<option value="' + room.room_ref + '" class="' + snagCssClass + '">' + room.room_ref + ind + '</option>');
    $('#selectSite').selectmenu('refresh');
    
    // try to make option selected
    //
    if(len > 0 && selected_room_ref != '') {
    	makeOptionSelected('selectRoom', selected_room_ref);
    }
    
    // colour div parent
    //
    copySelectedSnagCssToParent('selectRoom');
}





function checkSnagStatusOnProject(project) {
	db.transaction(function(tx){SQLCheckSnagStatusOnProject(tx, project)}, transaction_error);
    
}

function SQLCheckSnagStatusOnProject(tx, project) {
	var sql = 'SELECT MIN(status) AS min_status FROM insc_snags WHERE projs_id=?';
	tx.executeSql(sql, [project.id], function(tx, results){SQLCheckSnagStatusOnProject_success(tx, results, project)});
  
}

function SQLCheckSnagStatusOnProject_success(tx, results, project) {
	var min_status = '';
    if (min_status == '1'){
    console.log(min_status);
    }
	
	var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var snag = results.rows.item(i);
    	min_status = snag.min_status;
    }
    
    // display project list and colour some based on status
	//
	var cssClass = 'snag-' + snag.min_status;
	var instQty = '';
	if(project.phinstqty == null || project.phinstqty == undefined) {
		instQty = project.install_qty;
	} else {
		instQty = project.phinstqty;
	}
    
    
    
	if(window.localStorage['role'] == 'fitter') {
		//alert(window.localStorage['role']);
		$('#workList tbody').append('<tr class="' + cssClass + '">'+
    					'<td>' + project.room_ref + '</td>'+
    					'<td>' + project.description + '</td>'+
    					'<td>' + project.total_qty + '</td>'+
    					'<td id="inst-qty">' + '<a href="#" max="' + project.total_qty + '" id="proj-' + project.id + '" data-role="button" data-inline="true" class="ui-btn-right">' + instQty + '</a>' + '</td>'+
    					'<td>' + project.fitter_name + '</td>'+
    					'</tr>');
    	var thisid = "proj-" + project.id ;
        document.getElementById(thisid).onclick = editInstallQtyPrompt;
          					
	} else if(window.localStorage['role'] == 'manager' || window.localStorage['role'] == 'administrator') {
        
        var temp_qty = project.total_qty - project.phinstqty
        
			
		$('#workList tbody').append('<tr class="' + cssClass + '">'+
    					'<td>' + project.room_ref + '</td>'+
    					'<td>' + project.description + '</td>'+
    					'<td>' + project.total_qty + '</td>'+
    					//'<td id="inst-qty">' + '<a href="#" max="' + project.total_qty + '" id="proj-' + project.id + '" data-role="button" data-inline="true" class="ui-btn-right">' + instQty + '</a>' + '</td>'+
    	                '<td id="inst-qty">' + '<a href="#" max="' + temp_qty + '" id="proj-' + project.id + '" data-role="button" data-inline="true" class="ui-btn-right">' + instQty + '</a>' + '</td>'+
    									
        //'<td id="fit-qty" input-type="text"></td>'+
    					//'<td>' + project.install_qty + '</td>'+
    					//'<td>' + project.install_sell + '</td>'+ // temp hide
    					//'<td>' + project.install_cost + '</td>'+ // temp hide
    					'<td>' + project.fitter_name + '</td>'+
    					'</tr>');
    	thisid = "proj-" + project.id ;
        document.getElementById(thisid).onclick = editInstallQtyPrompt;
        
         //$('#workList a').on('tap', editInstallQtyPrompt);
	} else if(window.localStorage['role'] == 'customer') {
		$('#workList tbody').append('<tr class="' + cssClass + '">'+
    					'<td>' + project.room_ref + '</td>'+
    					'<td>' + project.description + '</td>'+
    					'<td>' + project.total_qty + '</td>'+
    					'<td>' + instQty + '</td>'+
    					'<td>' + project.fitter_name + '</td>'+
    					'</tr>');
	}
   
}

 

function initTableByTeam(t) {
	if(t == 'fitter' || t == 'customer') {
		$('#workList thead tr').append('<th class="col-f1" data-priority="1">Room Ref</th>'+
								'<th class="col-f2" data-priority="2">Description</th>'+
								'<th class="col-f3" data-priority="3">Total Qty</th>'+
								'<th class="col-f4" data-priority="4">Ins Qty</th>'+
								'<th class="col-f5" data-priority="5">Fitter</th>');
								
	} else if(t == 'manager' || t == 'administrator') {
		$('#workList thead tr').append('<th class="col-m1" data-priority="1">Room Ref</th>'+
								'<th class="col-m2" data-priority="2">Description</th>'+
								'<th class="col-m3" data-priority="3">Total Qty</th>'+
								'<th class="col-m4" data-priority="4">Inst Qty</th>'+
								//'<th class="col-m5" data-priority="5">Fitted Qty</th>'+
								//'<th class="col-m6" data-priority="6">Int Sell</th>'+
								//'<th class="col-m7" data-priority="7">Int Cost</th>'+
								'<th class="col-m8" data-priority="8">Fitter</th>');
	} else {
		
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
			s = ' (snag)';
			break;
		case 1:
			s = ' (desnagged)';
			break;
		case 2:
			s = ' (approved)';
			break;
		default:
			break;
	}
	return s;
}

function currentTimeMillis() {
	var d = new Date();
	return d.getTime();
}

function isInt(n) {
   return n % 1 === 0;
}

function copySelectedSnagCssToParent(selectId) {
	var opt = $('#'+selectId+' option:selected'),
		optcls = opt.attr('class');
	
	if(optcls != undefined && optcls.indexOf('snag-') != -1) {
		var from = optcls.indexOf('snag-'),
			cls = optcls.substring(from, from+6);
		opt.parent().parent().addClass(cls);
		$('#'+selectId).selectmenu('refresh');
	}
}

function removeSnagCssFromParent(selectId) {
	//console.log("The id is " + selectId);
		
	var div = $('#'+selectId).parent(),
		divcls = div.attr('class');
		
	if(divcls != undefined && divcls.indexOf('snag-') != -1) {
		var from = divcls.indexOf('snag-'),
			cls = divcls.substring(from, from+6);
		div.removeClass(cls);
		$('#'+selectId).selectmenu('refresh');
	}
}
