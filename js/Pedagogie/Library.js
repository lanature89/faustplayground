/*				LIBRARY.JS
    Creates Graphical Library of Faust Modules
    Connects with faust.grame.fr to receive the json description of available modules

    Interface structure
    ===================
    DIV --> PARENT
        DIV --> libraryDiv
            DIV --> libraryTitle
            DIV --> imageNode
            DIV --> fFooter
            UL --> section 1
                LI --> subsection 1
                LI --> subsection 2
                etc
            UL --> section 2
                LI --> subsection 1
                LI --> subsection 2
                etc
    ===================

    The library Div gets opened when passed over with the mouse

    DEPENDENCIES :
        - faust.grame.fr/www/pedagogie/index.json
*/
/// <reference path="../main.ts"/>
var Library = (function () {
    function Library() {
    }
    Library.prototype.initLibrary = function (parent) {
        var libraryDiv = document.createElement('div');
        libraryDiv.id = "library";
        parent.appendChild(libraryDiv);
        var libraryTitle = document.createElement('span');
        libraryTitle.id = "libraryTitle";
        libraryTitle.className = "title";
        libraryTitle.textContent = "Bibliothèque Faust";
        libraryDiv.appendChild(libraryTitle);
        this.imageNode = document.createElement('img');
        this.imageNode.id = "arrow";
        this.imageNode.src = App.baseImg + "open.png";
        this.imageNode.state = "closed";
        libraryDiv.appendChild(this.imageNode);
        libraryDiv.onmouseover = this.changeLibraryState;
        libraryDiv.onmouseout = this.changeLibraryState;
    };
    /***************  OPEN/CLOSE LIBRARY DIV  ***************************/
    Library.prototype.changeLibraryState = function (event) {
        var libDiv = document.getElementById("library");
        var boudingRect = libDiv.getBoundingClientRect();
        var img = this.imageNode;
        if (event.type == "mouseover" && img.state == "closed") {
            img.src = App.baseImg + "close.png";
            img.state = "opened";
            this.viewLibraryList(img);
        }
        else if (event.type == "mouseout" && (event.clientX > boudingRect.right || event.clientX < boudingRect.left || event.clientY < boudingRect.top || event.clientY > boudingRect.bottom)) {
            img.src = App.baseImg + "open.png";
            img.state = "closed";
            this.deleteLibraryList(img);
        }
    };
    //--- Load Library Content
    Library.prototype.viewLibraryList = function (selector) {
        document.getElementById("libraryTitle").style.cssText = " writing-mode:lr-tb; -webkit-transform:rotate(0deg); -moz-transform:rotate(0deg); -o-transform: rotate(0deg); display:block; position: relative; top:3%; left:5px; font-family: 'Droid Serif', Georgia, serif;  font-size:20px; z-index:3; margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px;";
        document.getElementById("library").style.cssText = "width:250px;";
        document.getElementById("arrow").style.cssText = "display: block; position: absolute; left:200px; top:2%; z-index:3;";
        var spaceDiv = document.createElement("div");
        spaceDiv.className = "space";
        document.getElementById("library").appendChild(spaceDiv);
        //var url = "http://faust.grame.fr/www/pedagogie/index.json";
        var url = "faust-modules/index.json";
        var getrequest = new XMLHttpRequest();
        getrequest.onreadystatechange = function () {
            console.log("enter onreadystatechange");
            if (getrequest.readyState == 4 && getrequest.status == 200) {
                App.libraryContent = getrequest.responseText;
                var data = JSON.parse(App.libraryContent);
                var sections = ["instruments", "effets", "exemples"];
                for (var i = 0; i < 3; i++) {
                    var section = sections[i];
                    var div = document.createElement("ul");
                    div.className = "ulElem";
                    selector.parentNode.appendChild(div);
                    if (App.isTooltipEnabled) {
                        var tooltip = this.toolTipForLibrary(section);
                        div.appendChild(tooltip);
                    }
                    var sel1 = document.createElement("li");
                    sel1.id = "generalSection";
                    sel1.className = "sections";
                    div.appendChild(document.createElement("br"));
                    var imageNode = document.createElement('img');
                    imageNode.src = App.baseImg + "triangleOpen.png";
                    imageNode.state = "opened";
                    imageNode.section = section;
                    imageNode.onclick = this.changeSectionState;
                    sel1.appendChild(imageNode);
                    sel1.appendChild(document.createTextNode("  " + section));
                    div.appendChild(sel1);
                    div.appendChild(document.createElement("br"));
                    this.viewFolderContent(imageNode);
                }
            }
        };
        getrequest.open("GET", url, true);
        getrequest.send(null);
    };
    //--- Unload Library Content
    Library.prototype.deleteLibraryList = function (selector) {
        var libraryDiv = selector.parentNode;
        for (var i = libraryDiv.childNodes.length - 1; i >= 0; i--) {
            if (libraryDiv.childNodes[i] != selector && libraryDiv.childNodes[i] != document.getElementById("libraryTitle"))
                libraryDiv.removeChild(libraryDiv.childNodes[i]);
        }
        document.getElementById("libraryTitle").style.cssText = " writing-mode:tb-rl; -webkit-transform:rotate(270deg); -moz-transform:rotate(270deg); -o-transform: rotate(270deg); display:block; position: relative; top:50%; right:250%; width:300px; font-family: 'Droid Serif', Georgia, serif;  font-size:20px; z-index:3; margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px;";
        document.getElementById("library").style.cssText = "width:50px;";
        document.getElementById("arrow").style.cssText = "display: block; margin-left: auto; margin-right: auto;";
    };
    //-------- CLOSE LIB ON LINK DRAGGING OUT OF LIB
    Library.prototype.onLinkDrag = function (event) {
        if (event.x > document.getElementById("library").getBoundingClientRect().width) {
            var img = this.imageNode;
            img.src = App.baseImg + "open.png";
            img.state = "closed";
            this.deleteLibraryList(img);
        }
    };
    Library.prototype.onclickPrevent = function (event) {
        event.preventDefault();
    };
    /***************  OPEN/CLOSE SECTION OF LIBRARY  ***************************/
    Library.prototype.changeSectionState = function (event) {
        if (event.target.state == "closed") {
            event.target.src = App.baseImg + "triangleOpen.png";
            event.target.state = "opened";
            this.viewFolderContent(event.target);
        }
        else {
            event.target.src = App.baseImg + "triangleClose.png";
            event.target.state = "closed";
            this.deleteFolderContent(event.target);
        }
    };
    Library.prototype.viewFolderContent = function (selector) {
        var data = JSON.parse(App.libraryContent);
        var selFolder = selector.section;
        var section = data[selFolder];
        var sublist = document.createElement("ul");
        sublist.className = "subsections";
        selector.parentNode.appendChild(sublist);
        for (var subsection in section) {
            var liElement = document.createElement("li");
            sublist.appendChild(liElement);
            var filename = section[subsection].toString().split('/').pop();
            filename = filename.toString().split('.').shift();
            var link = document.createElement("a");
            link.className = "link";
            // var linkAdd = "http://faust.grame.fr/www/pedagogie/" + selFolder + "/" + filename + ".dsp";
            var linkAdd = section[subsection];
            link.setAttribute("href", linkAdd);
            link.textContent = filename;
            link.onclick = this.onclickPrevent;
            link.ondrag = this.onLinkDrag;
            liElement.appendChild(link);
        }
    };
    Library.prototype.deleteFolderContent = function (selector) {
        var liElement = selector.parentNode;
        for (var i = 0; i < liElement.childNodes.length; i++) {
            if (liElement.childNodes[i].className == "subsections") {
                liElement.removeChild(liElement.childNodes[i]);
                break;
            }
        }
    };
    return Library;
})();
//# sourceMappingURL=Library.js.map