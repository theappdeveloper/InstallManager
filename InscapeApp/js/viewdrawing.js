var db;
var pdfDoc = null, pageNum = 1, canvas, context;
var snagsLoca = {};


function init() {
	document.addEventListener("deviceready", deviceReady, true);
	//delete init;
}

function deviceReady() {
	//
	//
	$('#viewDrawingBack').on('tap', viewDrawingBack);
	//$('#viewWorkList').on('tap', viewWorkList);
	$('#snagStamp').on("change", toggleSnagStampListener);
	$('#viewSnagList').on('tap', viewSnagList);
	$('#the-canvas').on("click", canvasClickEvent);
	$('#selectPage').on("change", selectPageListener);
    $('#selectZoom').on("change", selectPageListener);

	// open database
	//
	db = window.openDatabase("InscapeDB", "1.0", "Inscape DB Demo", 200000);

	// display full name, role, and site
	//
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

	// remove snag stamp toggle if role
	//
	if (window.localStorage['role'] == 'customer') {
		$('#stamp-f').remove();
	}

	// init parameters
	//
	window.localStorage['toggleSnagStampListener'] = 0;
	

	//
	//
	//$('#busy').show();

	// set width for canvas
	//
	var w = $('#nowrapper').width();
   
	$('#the-canvas').width(w);
	var c = document.getElementById('the-canvas');
	c.width = w;

	//
	//
	canvas = document.getElementById('the-canvas');
	context = canvas.getContext('2d');

	// display
	//
	if(window.localStorage['whichPDF'] != undefined && window.localStorage['whichPDF'] != '') {
		var filename = window.localStorage['whichPDF'];
		var pdfUri = window.localStorage['pdfLocalBaseUri'] + window.localStorage['whichSite'] + '/' + filename + '.pdf';
		
		drawPdf(pdfUri, '');
	}

}

function viewDrawingBack() {
	// clear page local storage variable
	//
	window.localStorage['whichPage'] = 1;
	
	console.log("LOG.VIEWDRAWING: Going to viewdrawinglist.html");
	window.location.href = "viewdrawinglist.html";
}

function toggleSnagStampListener() {
	var s = $('#snagStamp option:selected');
	var v = s.val();

	// on or off
	if (v == 'on') {
		window.localStorage['toggleSnagStampListener'] = 1;
	} else {
		window.localStorage['toggleSnagStampListener'] = 0;
	}
}

function viewSnagList() {
	console.log('LOG.VIEWDRAWING: Going to snaglist.html');
	window.location.href = 'snaglist.html';
}




function addPageOptions(numPages) {
	console.log(numPages);
	for (var i = 1; i < numPages + 1; i++) {
		$('#selectPage').append('<option value="' + i + '">' + 'Page ' + i + '</option>');
	}

	$('#selectPage').selectmenu('refresh');
}





function drawPdf(url, dots) {
	PDFJS.disableWorker = true;
	
	PDFJS.getDocument(url).then(function getPdf(pdf) {
		pdfDoc = pdf;
		
		// add page options 
		//
		addPageOptions(pdf.numPages);
		
		renderPagePrepare(pageNum);
	});

	//$('#busy').hide();
}

function renderPagePrepare(num) {
	// show loading
	//
	$('#busy').show();
	
	//
	//
	var filename = window.localStorage['whichPDF'];
	getSnagsCoordinates(window.localStorage['whichSite'], filename+'.pdf', num);
}

function renderPage(num, dots) {
	pdfDoc.getPage(num).then(function getPage(page) {
		//var viewport = page.getViewport(scale);
		var viewport = page.getViewport(canvas.width / page.getViewport(1.0).width);
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		pageRendering = page.render({
			canvasContext : context,
			viewport : viewport
		});
		
		// wait render to complete
		//
		pageRendering.onData(function(){
			// draw dots
			//
			var imageObj = new Image();
			imageObj.onload = function() {
			 	var imageObjW =	imageObj.width,
					imageObjH = imageObj.height;

				// redraw dots
				for (var key in dots) {
					var obj = dots[key];
					var dx = obj[0] * canvas.width - imageObjW / 2, dy = obj[1] * canvas.height - imageObjH / 2;
					//console.log('previous dots: ' + dx + ', ' + dy);
					context.drawImage(imageObj, dx, dy);
				}
			};
			imageObj.src = 'img/snag30.png';

			// hide loading
			//
			$('#busy').hide();
		});
	});
}

function getSnagsCoordinates(site_no, filenm, pagenum) {
	db.transaction(function(tx){SQLGetSnagsCoordinates(tx, site_no, filenm, pagenum)}, transaction_error);
}

function SQLGetSnagsCoordinates(tx, site_no, filenm, pagenum) {
	// TODO

	
	var sql = 'SELECT coords FROM insc_snags WHERE site_no=? AND filename=? AND page_num=?';
	tx.executeSql(sql, [site_no, filenm, pagenum], function(tx, results){SQLGetSnagsCoordinates_success(tx, results, pagenum)});
}

function SQLGetSnagsCoordinates_success(tx, results, pagenum) {
	var len = results.rows.length;
	console.log('-------------------------------------------');
	console.log(len);
    for (var i=0; i<len; i++) {
    	var sc = results.rows.item(i);
    	
    	//
    	//
    	console.log(sc);
    	var xy = sc.coords.split(';');
    	snagsLoca['dot' + (i + 1)] = [xy[0], xy[1]];
    }
    
    //
    //
    renderPage(pagenum, snagsLoca);
}

function selectPageListener() {
	var pe = $('#selectPage option:selected'), 
		p = pe.val();
	
	pageNum = p;
	window.localStorage['whichPage'] = pageNum;
    
    var zoom =  $('#selectZoom option:selected');
    zoom = zoom.val();
    console.log("Zoom scale is "+zoom);
    
    var w = $('#nowrapper').width();
    
    w = w * zoom
    console.log("width = " + w);
    
	$('#the-canvas').width(w);
	var c = document.getElementById('the-canvas');
	c.width = w;

	renderPagePrepare(p);
}

function canvasClickEvent(evt) {
	if (window.localStorage['toggleSnagStampListener'] == 1) {
		//if (Object.keys(dots).length > 0) {
		//var canvas = $('#the-canvas');
		//var canvas = document.getElementById('the-canvas');

		var cwidth = canvas.width;
		var cheight = canvas.height;

		// get mouse click coordinates
		var mouseCPos = getMousePos(canvas, evt);
		console.log('Mouse pos: ' + (mouseCPos.x / cwidth) + ', ' + (mouseCPos.y / cheight));

		// mycanvas, save state before drawing new dot
		//mycontext = canvas.getContext('2d');
		//mycontext.save();

		// load img and draw
		//var context = canvas.getContext('2d');
		var imageObj = new Image();
		imageObj.onload = function() {
			var imageObjW = imageObj.width;
			var imageObjH = imageObj.height;

			// draw dot on mouse position
			var dx = mouseCPos.x - imageObjW / 2, dy = mouseCPos.y - imageObjH / 2;
			//console.log('draw dot: ' + (dx / cwidth) + ', ' + (dy / cheight));
			//context.drawImage(imageObj, dx, dy);

			// add new dot to dots, temporarily push to dots and wait for confirmation
			dots_push(dx / cwidth, dy / cheight);

			// prompt dialog to create snag page
			//showPrompt();
            console.log("show Create Snag");
			showCreateSnagConfirm();
		};
		imageObj.src = 'img/snag30.png';
		//}
	} else {
		console.log('LOG.VIEWDRAWING: Switch toggle on to enable snag tamp');
	}
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x : evt.clientX - rect.left,
		y : evt.clientY - rect.top
	};
}

function getPosition(event) {
	var x = event.x;
	var y = event.y;

	var canvas = $("#the-canvas");

	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;

	return {
		x : x,
		y : y
	}
}

function showCreateSnagConfirm() {
    console.log("show Create Snag");
	navigator.notification.confirm(
		'Create snag detail?', // message
		onCreateSnagConfirm, // callback to invoke with index of button pressed
		'Confirm', // title
		'Ok,Cancel' // buttonLabels
	);
}

function onCreateSnagConfirm(buttonIndex) {
	if (buttonIndex == 1) {
		// Ok
		var s = Object.keys(snagsLoca).length;
		var cx = snagsLoca['dot'+s][0], cy = snagsLoca['dot'+s][1];

		console.log('LOG.VIEWDRAWING: Going to createsnag.html');
		window.location.href = 'createsnag.html?cx=' + cx + '&cy=' + cy;
	} else if (buttonIndex == 2) {
		// Cancel
		dots_deleteLast();
		console.log('LOG.VIEWDRAWING: New added snag coordinates is deleted');

		// TODO redraw canvas and remove new added dot
		
	}
}

function transaction_error(tx, error) {
	alert("Database Error: " + error);
}


function dots_push(px, py) {
	var s = Object.keys(snagsLoca).length;
	snagsLoca['dot' + (s + 1)] = [px, py];
}

function dots_deleteLast() {
	var s = Object.keys(snagsLoca).length;
	delete snagsLoca['dot' + s];
}


