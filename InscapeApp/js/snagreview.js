var db;
var id = getUrlVars()["id"]; // snag id
var pictureSource; // picture source
var destinationType; // sets the format of returned value
var capturedImageSaveTo = '';
var capturedImgUri = '';


function init() {
	document.addEventListener("deviceready", deviceReady, true);
	//delete init;
}

function deviceReady() {
	//
	//
	$('#snagReviewBack').on('tap', snagReviewBack);
	//$('#updateLog').on('tap', updateLog);
	$('#saveSnag').on('tap', saveSnag);
	//$('#viewSnagList').on('tap', viewSnagList);
	$('#markComplete').on('tap', markCompleteConfirm);
	$('#takePhoto').on('tap', takePhoto);
		
	// open database
	db = window.openDatabase("InscapeDB", "1.0", "Inscape DB Demo", 200000);

	// display fullname, role
	if (window.localStorage['username'] != undefined && window.localStorage['role'] != undefined) {
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

	// initialise picture capture parameters
	//
	getRootFileSystemPath(); // base url of saveTo
	pictureSource = navigator.camera.PictureSourceType;
	destinationType = navigator.camera.DestinationType;

	// display snag review info
	//
	//if (id > 0) {
	displaySnagDetails(id);
	//}
	
	
}

function snagReviewBack() {
	console.log('LOG.SNAGREVIEW: Going to snaglist.html');
	window.location.href = 'snaglist.html';
}

function saveSnag() {
	saveSnagReview(id);
}

function takePhoto() {
	capturePhoto();
}


function markCompleteConfirm() {
	navigator.notification.confirm(
        'Mark as Complete?',		// message
        onMarkCompleteConfirm,	// callback to invoke with index of button pressed
        'Confirm',            	// title
        'Ok,Cancel'          	// buttonLabels
    );
}

function markInompleteConfirm() {
	navigator.notification.confirm(
        'Mark as Snag?',		// message
        onMarkIncompleteConfirm,	// callback to invoke with index of button pressed
        'Confirm',            	// title
        'Ok,Cancel'          	// buttonLabels
    );
}

function onMarkCompleteConfirm(buttonIndex) {
	if(buttonIndex == 1) {
		var call = 0;
		
		var role = window.localStorage['role'];
		var ss = $('#snagStatus').text();
		if(ss == 'Snag') { // snag
			if(role == 'administrator' || role == 'manager') {
				call = 2;
			} else if(role == 'fitter' || role == 'customer') {
				call = 1;
			}
		} else if(ss == 'Desnagged') { // desnagged
			if(role == 'administrator' || role == 'manager') {
				call = 1;
			} else if(role == 'fitter' || role == 'customer') {
				call = -1;
			}
		} else if(ss == 'Approved') { // approved
			if(role == 'administrator' || role == 'manager') {
				call = -2;
			} else if(role == 'fitter' || role == 'customer') {
				// do nothing
			}
		} else {
			
		}
		
		markComplete(call);
	}
}

function onMarkIncompleteConfirm(buttonIndex) {
	if(buttonIndex == 1) {
		var call = 0;
		
		var role = window.localStorage['role'];
		var ss = $('#snagStatus').text();
		if(ss == 'Desnagged') { // desnagged
			if(role == 'administrator' || role == 'manager') {
				call = -1;
			}
		}
		
		markComplete(call);
	}
}

function markComplete(call) {
	db.transaction(function(tx) {
		SQLMarkSnagComplete(tx, id, call)
	}, transaction_error, SQLMarkSnagComplete_success);
}

function SQLMarkSnagComplete(tx, id, call) {
	var time = currentTimeMillis();
	
	var sql = 'UPDATE insc_snags SET status=status+'+call+', update_date=?, timestamp=? WHERE id=?';
	tx.executeSql(sql, [time, time, id]);
}

function SQLMarkSnagComplete_success() {
	console.log('LOG.SNAGREVIEW: Database, mark snag #'+id+' as \'Desnagged\'');
	navigator.notification.alert(
		'Snag mark is updated', 
		function(){
			updateSnagStatus();
		},
		'Done'
	);
	
}

function updateSnagStatus() {
	displaySnagDetails(id);
}




function saveSnagReview(id) {
	// get captured image's filename
	//
	var img = $('#smallImage').attr('src');
	var imgfn = getLastSubstring(img, '/');
	console.log('image captured filename: ' + imgfn);

	// save captured image
	//
	db.transaction(function(tx) {
		SQLSaveSnagCapturedImage(tx, imgfn, id)
	}, transaction_error);
}

function SQLSaveSnagCapturedImage(tx, imageFilename, snagId) {
	var time = currentTimeMillis();
	
	var sql = 'INSERT INTO insc_imgs (filename, snag_id, creation_date, timestamp) VALUES (?, ?, ?, ?)';
	tx.executeSql(sql, [imageFilename, snagId, time, time], SQLSaveSnagCapturedImage_success);
}

function SQLSaveSnagCapturedImage_success(tx, results) {
	var imgInsertId = results.insertId;
	console.log('LOG.SNAGREVIEW: Database, image inserted row ID = ' + results.insertId);
	
	// save snag details
	//
	db.transaction(function(tx) {
		SQLSaveSnagDetails(tx, id, parseInt(imgInsertId))
	}, transaction_error, SQLSaveSnagDetails_success);
}

function SQLSaveSnagDetails(tx, snagId, imageId) {
	// get snag details, description, log
	//
	var description = $('#description').val();
	var log = $('#log').val();
	
	var time = currentTimeMillis();

	var sql = 'UPDATE insc_snags SET review_desc=?, review_log=?, review_img=?, update_date=?, timestamp=? WHERE id=?';
	tx.executeSql(sql, [description, log, imageId, time, time, snagId]);
}

function SQLSaveSnagDetails_success() {
	console.log('LOG.SNAGREVIEW: Database, snag updated');
	navigator.notification.alert(
		'Review is updated!', 
		function() {},
		'Done'
		);
}


function displaySnagDetails(snagId) {
	db.transaction(function(tx) {
		SQLGetSnagReview(tx, snagId)
	}, transaction_error);
}

function SQLGetSnagReview(tx, snagId) {
	//var sql = 'SELECT s.id, s.title ST, s.review_cm, s.review_desc, i.filename, s.review_log, j.title JT FROM insc_snags s LEFT JOIN insc_jobs j ON j.id=s.job_id LEFT JOIN insc_imgs i ON s.review_img=i.id WHERE s.id="' + id + '"';
	
	var sql = 'SELECT s.title, s.status, u.username AS adder, u2.username AS reviewer, s.review_desc, i.filename, s.review_log FROM insc_snags s LEFT JOIN insc_users u ON u.id=s.added_by LEFT JOIN insc_users u2 ON u2.id=s.review_cm LEFT JOIN insc_imgs i ON s.review_img=i.id WHERE s.id=?';
	tx.executeSql(sql, [snagId], SQLGetSnagReview_success);
}

function SQLGetSnagReview_success(tx, results) {
	var len = results.rows.length;
    console.log('LOG.SNAGREVIEW: number of snags is ' + len );
	
	for (var i = 0; i < len; i++) {
		var rev = results.rows.item(i);
    console.log('LOG.SNAGREVIEW: snag filename is ' + rev.filename);
	
		//
		//
		$('#snagStatus').text(getSnagStatus(rev.status));
		$('#snagTitle').val(rev.title);
		$('#addedBy').val(rev.adder);
		$('#description').val(rev.review_desc);
		//$('#photo').append('<img src="' + rev.review_img + '" class="list-icon"/>');
		//console.log('photo name: ' + rev.filename);
		//console.log('photo uri: ' + capturedImageSaveTo + '/Android/data/com.org.inscapeapp/cache/' + rev.filename);
		//$('#smallImage').attr('src', capturedImageSaveTo + '/Android/data/com.org.inscapeapp/cache/' + rev.filename);
		$('#smallImage').attr('src', capturedImageSaveTo + '/Android/data/com.telerik.inscapeapp/cache/' + rev.filename);
		
        $('#log').val(rev.review_log);
		
		// initialise mark button TODO
		//
		var role = window.localStorage['role'];
		if(rev.status == 0) { // snag
			if(role == 'administrator' || role == 'manager') {
				// change mark text
				$('#markComplete').text('Mark as Approved');  			// +2
				decorateButton($('#markComplete'));
				
				// try to remove incomplete button
				$('#markIncomplete').remove();
			} else if(role == 'fitter' || role == 'customer') {
				// change mark text
				$('#markComplete').text('Mark as Desnagged'); 			// +1
				decorateButton($('#markComplete'));
			}
		} else if(rev.status == 1) { // desnagged
			if(role == 'administrator' || role == 'manager') {
				// change mark text
				$('#markComplete').text('Mark as Approved'); 			// +1
				decorateButton($('#markComplete'));
				
				// add unapprove button
				$('#markComplete').after('<a href="#" id="markIncomplete" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Mark as Incomplete</span></span></a>');
				$('#markIncomplete').on('tap', markInompleteConfirm); 	// -1
			} else if(role == 'fitter' || role == 'customer') {	
				$('#markComplete').text('Mark as Snag'); 				// -1
				decorateButton($('#markComplete'));
			}
		} else if(rev.status == 2) { // approved
			if(role == 'administrator' || role == 'manager') {
				$('#markComplete').text('Mark as Snag');				// -2
				decorateButton($('#markComplete'));
				
				// try to remove incomplete button
				$('#markIncomplete').remove();
			} else if(role == 'fitter' || role == 'customer') {
				// remove mark button
				$('#markComplete').remove();
			}
		}
	}
	
	// unhide phtot
	//
	var smallImage = document.getElementById('smallImage');
	smallImage.style.display = 'block';

	// TODO
	//
	//console.log('set first focus');
	//$('#jobTitle').focus();
}

function transaction_error(tx, error) {
	alert("Database Error: " + error);
}

function getUrlVars() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}


function getLastSubstring(str, separator) {
	var sarray = str.split(separator);
	return sarray[sarray.length - 1];
}

function currentTimeMillis() {
	var d = new Date();
	return d.getTime();
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
			s = 'undefined';
			break;
	}
	return s;
}

function decorateButton(ele) {
	//$('#markComplete').after('<a href="#" id="markIncomplete" data-role="button" data-inline="true" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-up-c"><span class="ui-btn-inner"><span class="ui-btn-text">Mark as incomplethaha</span></span></a>');
	
	ele.attr('data-role', 'button');
	ele.attr('data-inline', 'true');
	ele.attr('data-corners', 'true');
	ele.attr('data-shadow', 'true');
	ele.attr('data-iconshadow', 'true');
	ele.attr('data-wrapperels', 'span');
	ele.attr('data-theme', 'c');
	ele.attr('class', 'ui-btn ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-up-c');
	var text = ele.text();
	ele.text('');
	ele.prepend('<span class="ui-btn-inner"><span class="ui-btn-text">' + text + '</span></span>');
	//ele.append('</span></span>');
}



function onPhotoURISuccess(imageURI) {
	// Get image handle
	//
	var smallImage = document.getElementById('smallImage');

	// Unhide image elements
	//
	smallImage.style.display = 'block';

	// Show the captured photo
	// The inline CSS rules are used to resize the image
	//
	smallImage.src = imageURI;
	console.log('image captured is saved to : ' + imageURI);
	capturedImgUri = imageURI;
}

function capturePhoto() {
	navigator.camera.getPicture(onPhotoURISuccess, onFail, {
		quality : 100,
		//encodingType : Camera.EncodingType.JPEG,
		//correctOrientation : true, // android ignore this parameter
		destinationType : destinationType.FILE_URI
	});
}

function onFail(message) {
	alert('Failed because: ' + message);
}





function getRootFileSystemPath() {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, rootFileSystemPath_success, rootFileSystemPath_fail);
}

function rootFileSystemPath_success(fileSystem) {
	capturedImageSaveTo = fileSystem.root.fullPath;
	console.log('get root file system path: ' + fileSystem.root.fullPath);
}

function rootFileSystemPath_fail(error) {
	console.log('Get file system full path fail! Error:' + error.code);
}