/*				EXPORT.JS
    Handles Graphical elements for the Export Feature of the normal Playground
        
    DEPENDENCIES :
        - ExportLib.js
        - qrcode.js
*/
/// <reference path="../ExportLib.ts"/>
/// <reference path="../EquivalentFaust.ts"/>
/// <reference path="../main.ts"/>
"use strict";
/********************************************************************
*********************  HANDLE FAUST WEB TARGETS *********************
********************************************************************/
var Export = (function () {
    function Export() {
        var _this = this;
        //------ Update Architectures with Plateform change
        this.updateArchitectures = function () {
            if (!_this.clearComboBox('architectures')) {
                return;
            }
            else {
                var data = JSON.parse(App.jsonText);
                var platformsSelect = document.getElementById('platforms'); //get the combobox
                var selPlatform = platformsSelect.options[platformsSelect.selectedIndex].value;
                var dataCopy = data[selPlatform];
                var iterator = 0;
                for (var subData in dataCopy) {
                    if (iterator < dataCopy.length) {
                        var mainData = dataCopy[subData];
                        _this.addItem('architectures', mainData);
                        iterator = iterator + 1;
                    }
                }
            }
        };
        this.uploadTargets = function () {
            _this.clearComboBox('platforms');
            _this.clearComboBox('architectures');
            var input = document.getElementById("faustweburl");
            App.exportURL = input.value;
            App.getXHR(Export.targetsUrl, function (json) { _this.uploadTargetCallback(json); }, function (errorMessage) { ErrorFaust.errorCallBack(errorMessage); });
            //ExportLib.getTargets(App.exportURL, (json: string) => { this.uploadTargetCallback },  (json: string)=> {alert('Impossible to get FaustWeb targets')});
        };
        /********************************************************************
        **************  CALLBACK ONCE SHA KEY WAS CALCULATED  ***************
        ********************************************************************/
        this.exportFaustCode = function (shaKey) {
            var platformsSelect = document.getElementById("platforms"); //get the combobox
            var platforme = platformsSelect.options[platformsSelect.selectedIndex].value;
            var architecturesSelect = document.getElementById("architectures"); //get the combobox
            var architecture = architecturesSelect.options[architecturesSelect.selectedIndex].value;
            var serverUrl = document.getElementById("faustweburl").value;
            var appType = "binary.zip";
            if (architecture == "android")
                appType = "binary.apk";
            var exportLib = new ExportLib();
            exportLib.sendPrecompileRequest("http://faustservice.grame.fr", shaKey, platforme, architecture, appType, function (serverUrl, shaKey, plateforme, architecture, appType) { _this.setDownloadOptions(serverUrl, shaKey, plateforme, architecture, appType); });
            // 	Delete existing content if existing
        };
        this.setDownloadOptions = function (serverUrl, shaKey, plateforme, architecture, appType) {
            var qrDiv = document.createElement('div');
            qrDiv.id = "qrcodeDiv";
            document.getElementById("exportResultContainer").appendChild(qrDiv);
            var link = document.createElement('a');
            link.href = serverUrl + "/" + shaKey + "/" + plateforme + "/" + architecture + "/" + appType;
            qrDiv.appendChild(link);
            var myWhiteDiv = ExportLib.getQrCode(serverUrl, shaKey, plateforme, architecture, appType, 120);
            link.appendChild(myWhiteDiv);
            App.removeLoadingLogo();
        };
    }
    //------ Handle Combo Boxes
    Export.prototype.setEventListeners = function () {
        var _this = this;
        this.exportView.refreshButton.onclick = this.uploadTargets;
        this.exportView.selectPlatform.onchange = function () { _this.updateArchitectures(); };
        this.exportView.exportButton.onclick = function (event) { _this.exportPatch(event, _this); };
    };
    Export.prototype.addItem = function (id, itemText) {
        var platformsSelect = document.getElementById(id);
        var option = document.createElement('option');
        option.text = itemText;
        platformsSelect.options.add(option);
    };
    Export.prototype.clearComboBox = function (id) {
        if (document.getElementById(id) != undefined) {
            while (document.getElementById(id).childNodes.length > 0) {
                document.getElementById(id).removeChild(document.getElementById(id).childNodes[0]);
            }
            return true;
        }
        else {
            return false;
        }
    };
    Export.prototype.uploadTargetCallback = function (json) {
        App.jsonText = json;
        var data = JSON.parse(App.jsonText);
        for (var platform in data) {
            this.addItem('platforms', platform);
        }
        this.setDefaultSelect();
        this.updateArchitectures();
    };
    Export.prototype.setDefaultSelect = function () {
        var platefromSelect = document.getElementById("platforms");
        platefromSelect.selectedIndex = 3;
    };
    /********************************************************************
    *********************  HANDLE POST TO FAUST WEB  ********************
    ********************************************************************/
    Export.prototype.exportPatch = function (event, expor) {
        this.removeQRCode();
        App.addLoadingLogo("exportResultContainer");
        var equivalentFaust = new EquivalentFaust();
        var faustCode = equivalentFaust.getFaustEquivalent(App.scene, Scene.sceneName);
        ExportLib.getSHAKey(document.getElementById("faustweburl").value, Scene.sceneName, faustCode, expor.exportFaustCode);
    };
    Export.prototype.removeQRCode = function () {
        var qrcodeSpan = document.getElementById('qrcodeDiv');
        if (qrcodeSpan)
            qrcodeSpan.parentNode.removeChild(qrcodeSpan);
    };
    Export.exportUrl = "http://faustservice.grame.fr";
    Export.targetsUrl = "http://faustservice.grame.fr/targets";
    return Export;
})();
//# sourceMappingURL=Export.js.map