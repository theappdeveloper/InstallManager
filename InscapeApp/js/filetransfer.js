function fileTransfer(file) {
	//var that = this,
    var tempFile = file + ".pdf"
    var tempUri = "http://www.cubiclesandwashrooms.co.uk/pdf/" + tempFile
	App = new downloadApp(),
	fileName = tempFile,
    uri = encodeURI(tempUri),
	folderName = "test";
    
	navigator.splashscreen.hide();
	App.run(uri, fileName, folderName);
}

var downloadApp = function() {
}

downloadApp.prototype = {
	run: function(uri, fileName, folderName) {
		var that = this,
		filePath = "";
        
		document.getElementById("syncProjectDetails").addEventListener("click", function() {
			that.getFilesystem(
				function(fileSystem) {
					console.log("gotFS");
                    
					if (device.platform === "Android") {
						that.getFolder(fileSystem, folderName, function(folder) {
							filePath = folder.fullPath + "\/" + fileName;
							that.transferFile(uri, filePath)
						}, function() {
							console.log("failed to get folder");
						});
					}
					else {
						filePath = fileSystem.root.fullPath + "\/" + fileName;
						that.transferFile(uri, filePath)
					}
				},
				function() {
					console.log("failed to get filesystem");
				}
				);
		});
	},
    
	getFilesystem:function (success, fail) {
        //check whether we're in Simulator
		if (device.uuid == "e0101010d38bde8e6740011221af335301010333" || device.uuid == "e0908060g38bde8e6740011221af335301010333") {
			alert("Not Supported in Simulator.");
		}
		else {
			window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, fail);
		}
	},

	getFolder: function (fileSystem, folderName, success, fail) {
		fileSystem.root.getDirectory(folderName, {create: true, exclusive: false}, success, fail)
	},

	transferFile: function (uri, filePath) {
		var transfer = new FileTransfer();
		transfer.download(
			uri,
			filePath,
			function(entry) {
				var image = document.getElementById("downloadedImage");
				image.src = entry.fullPath;
				document.getElementById("result").innerHTML = "File saved to: " + entry.fullPath;
			},
			function(error) {
                document.getElementById("result").innerHTML = "An error has occurred: Code = " + error.code;
				console.log("download error source " + error.source);
				console.log("download error target " + error.target);
				console.log("upload error code" + error.code);
			}
			);
	}
}