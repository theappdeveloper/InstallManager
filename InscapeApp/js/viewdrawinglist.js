var db;


//window.localStorage['pdfLocalBaseUri'] = 'file:///data/data/com.org.inscapeapp/';
//window.localStorage['pdfLocalBaseUri'] = 'file:///storage/sdcard0/Android/data/com.telerik.InscapeApp/';
//window.localStorage['pdfLocalBaseUri'] = 'file:///mnt/sdcard/Android/data/com.telerik.InscapeApp/';
window.localStorage['pdfLocalBaseUri'] = 'file:///mnt/sdcard/Icenium/Drawings/';



function init() {
	document.addEventListener("deviceready", deviceReady, true);
	//delete init;
}

function deviceReady() {
    
    getRootFileSystemPath(); // base url of saveTo
    
	$('#viewDrawingListBack').on('tap', viewDrawingListBack);
	
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
	if(window.localStorage['whichCustomer'] != '' && window.localStorage['whichProject'] != '') {
		$('#siteName').text(window.localStorage['whichCustomer']);
		$('#projectNum').text(window.localStorage['whichProject']);
		$('#roomRef').text(window.localStorage['whichRoom']);
	}
	
	
	
	if(window.localStorage['copycopy'] == undefined || !window.localStorage['copycopy']) {
		console.log('oooooooooooooooooooo');
		
		//createDir.create(window.localStorage['pdfLocalBaseUri'], '21550');
		//createDir.create(window.localStorage['pdfLocalBaseUri'], '21859');
		//createDir.create(window.localStorage['pdfLocalBaseUri'], '25458');
		//copyFile.copy('', window.localStorage['pdfLocalBaseUri']+'21550/', '21550.pdf');
		//copyFile.copy('', window.localStorage['pdfLocalBaseUri']+'21859/', '21550.pdf');
		//copyFile.copy('', window.localStorage['pdfLocalBaseUri']+'25458/', '21550.pdf');
	}
	
	//listAllFilesBySiteNo(window.localStorage['whichSite']);
	listAllFilesBySiteNo.list(window.localStorage['whichSite']);
    	console.log('site is '+ window.localStorage['whichSite']);
		
    
}




function viewDrawingListBack() {
	console.log('LOG.SNAGLIST: Going to worklist.html');
	window.location.href = "worklist.html";
}

function fileView() {
	var id = $(this).attr('id'),
		filename = id.substring(5, id.length-4);
	//console.log('going to viewdrawing, filename: '+window.localStorage['whichSite']+'/'+filename);
	window.localStorage['whichPDF'] = filename;
	
	console.log('LOG.VIEWDRAWINGLIST: Going to viewdrawing.html');
	//window.location.href = 'viewdrawing.html?filename=' + filename;
	window.location.href = 'viewdrawing.html';
}

var listAllFilesBySiteNo = {
	list: function(site_no) {
		
		function fail() {
			console.log('list file failed');
		}
		
		function done(entries) {
			var i;
			for (i=0; i<entries.length; i++) {
				console.log(entries[i].name);
				
				// display file list
				//
				$('#fileList tbody').append('<tr>'+
    					'<td>' + (i+1) + '</td>'+
    					'<td>' + entries[i].name + '</td>'+
    					'<td id="file-view">' + '<a href="#" id="view-' + entries[i].name + '" data-role="button" data-inline="true" class="ui-btn-right">View</a>' + '</td>' +
    					'</tr>');
    			
    			// add event to review button
    			//
				$('#file-view a').on('tap', fileView);
			}
		}
		
		function success(entry) {
			if(entry.isDirectory) {
                
				var directoryReader = entry.createReader();
                console.log('directoryReader ' + directoryReader);
				directoryReader.readEntries(done, fail);
			}
		}
		
		var uri = window.localStorage['pdfLocalBaseUri'] + site_no + '/';
        console.log('file path is ' + uri);
		window.resolveLocalFileSystemURI(uri, success, fail);
	}
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
			s = 'Proved';
			break;
		default:
			break;
	}
	return s;
}


var createDir = {
	create: function(base, folder) {
		
		function success(entry) {
			entry.getDirectory(folder, {create: true, exclusive: false}, done, fail);
		}
		
		function done(parent) {
			console.log('new folder is created. oh ye! '+parent.name);
			window.localStorage['copycopy'] = true;
		}
		
		function fail() {
			console.log('folder create failed');
		}
		
		window.resolveLocalFileSystemURI(base, success, fail);
	}  
}

var copyFile = {
	copy: function(src, dest, file) {
		
		function fail() {
			console.log('file copy failed');
		}
		
		function copyDone() {
			console.log('file is copied to new folder. oh ye! file: '+file+'; dest: '+dest);
		}
		
		function done(fileentry) {
			var parentFolder = dest.substring(dest.lastIndexOf('/') + 1);
			var destEntry = new DirectoryEntry(parentFolder, dest);
			fileentry.copyTo(destEntry, file, copyDone, fail);
		}
		
		function success(filesystem) {
			filesystem.root.getFile(file, null, done, fail);			
		}
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, fail);		
	}
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