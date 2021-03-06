/// <reference path="../Utilitary.ts"/>

/*				FAUSTINTERFACE.JS

	HELPER FUNCTIONS TO CREATE FAUST INTERFACES

	FIRST PART --> DECODE JSON ENCODED INTERFACE
	SECOND PART --> ADD GRAPHICAL OBJECTS TO INTERFACE
*/

/********************************************************************
*************************** DECODE JSON *****************************
********************************************************************/
interface Iitems extends HTMLDivElement {
    label: string;
    items: Iitems[];
    type: string;
    meta: any[];
}

interface Iitem{
    label: string;
    init: string;
    address: string;
    type: string;
    min: string;
    max: string;
    step: string;
    meta: FaustMeta[];
}

interface FaustMeta {
    acc: string;
    noacc: string;
    unit: string;
}

interface AccParams {
    isEnabled: boolean;
    acc: string;
    address: string;
    min: number;
    max: number;
    init: number;
    label: string;
}

// interface describing values needed to use CodeFaustParser
interface ElementCodeFaustParser {
    sliderName: string,
    newAccValue: string,
    isEnabled: boolean
}

class FaustInterfaceControler {
    //array only used at init to fill all FaustInterfaceControler of a Modules (moduleControlers)
    faustControlers: FaustInterfaceControler[];
    name: string;
    itemParam: Iitem;
    unit: string;
    precision: string;
    isEnabled: boolean;
    accDefault: string = "0 0 -10 0 10";
    acc: string;
    value: string;
    valueChangeCallbacks: { [address: string] : Function; };
    accParams: AccParams;

    faustInterfaceView: FaustInterfaceView;

    interfaceCallback: (faustInterfaceControler: FaustInterfaceControler) => void;
    callbackEdit: () => void;
    updateFaustCodeCallback: (details: ElementCodeFaustParser)=>void
    setDSPValueCallback: (address: string, value: string) => void;

    constructor(interfaceCallback: (faustInterfaceControler: FaustInterfaceControler) => void, setDSPValueCallback: (address: string, value: string) => void) {
        this.interfaceCallback = interfaceCallback;
        this.setDSPValueCallback = setDSPValueCallback;
        this.valueChangeCallbacks = {};
    }

    //parse interface json from faust webaudio-asm-wrapper to create corresponding FaustInterfaceControler
    parseFaustJsonUI(ui: Iitems[], module: ModuleClass): FaustInterfaceControler[] {
        this.faustControlers = [];
        for (var i = 0; i < ui.length; i++) {
            this.parse_group(ui[i], module);
        }
        return this.faustControlers;
    }

    parse_group(group: Iitems, module: ModuleClass): void {
        if (group.items)
            this.parse_items(group.items, module);
    }

    parse_item(item: any, module: ModuleClass): void {

        var params = module.getInterfaceParams();

        if (params && params[item.address]) {
            item.init = params[item.address];
        }

        if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") {
            this.parse_items(item.items, module);
        } else if (item.type === "vslider" || item.type === "hslider") {
            var itemElement = <Iitem>item;

            var controler: FaustInterfaceControler = new FaustInterfaceControler(
                () => { this.interfaceCallback(controler) },
                (adress, value) => { this.setDSPValueCallback(adress,value) }
            );
            controler.name = itemElement.label;
            controler.itemParam = itemElement;
            controler.value = itemElement.init;
            this.faustControlers.push(controler)

        } else if (item.type === "button") {
            var itemElement = <Iitem>item;
            var controler: FaustInterfaceControler = new FaustInterfaceControler(
                (faustInterface) => { this.interfaceCallback(faustInterface) },
                (adress, value) => { this.setDSPValueCallback(adress, value) }
            );
            controler.itemParam = itemElement;
            controler.value = "0";
            this.faustControlers.push(controler)

        } else if (item.type === "checkbox") {
            var itemElement = <Iitem>item;
            var controler: FaustInterfaceControler = new FaustInterfaceControler(
                (faustInterface) => { this.interfaceCallback(faustInterface) },
                (adress, value) => { this.setDSPValueCallback(adress, value) }
            );
            controler.itemParam = itemElement;
            controler.value = "0";
            this.faustControlers.push(controler)
        }
    }

    parse_items(items: Iitems[], node: ModuleClass): void {
        for (var i = 0; i < items.length; i++)
            this.parse_item(items[i], node);
    }

    setParams() {
        if (this.itemParam.meta != undefined) {
            for (var j = 0; j < this.itemParam.meta.length; j++) {
                if (this.itemParam.meta[j].unit) {
                    this.unit = this.itemParam.meta[j].unit;
                }
            }
        }
        if (this.unit == undefined) {
            this.unit = "";
        }

        if (this.itemParam.step != undefined) {
            var precision = this.itemParam.step.toString().split('.').pop().length;
            this.precision = String(precision);
        }
        this.accParams = {
            isEnabled: this.isEnabled,
            acc: this.acc,
            address: this.itemParam.address,
            init: parseFloat( this.itemParam.init),
            max: parseFloat(this.itemParam.max),
            min: parseFloat(this.itemParam.min),
            label: this.itemParam.label
        }
    }

    // create and allocate right faustInterfaceView
    createFaustInterfaceElement(): HTMLElement {
        if (this.faustInterfaceView && this.faustInterfaceView.type) {
            if (this.faustInterfaceView.type === "vslider" || this.faustInterfaceView.type === "hslider") {
                return this.faustInterfaceView.addFaustModuleSlider(this.itemParam, parseFloat(this.precision), this.unit)
            } else if (this.faustInterfaceView.type === "button") {
                return this.faustInterfaceView.addFaustButton(this.itemParam);
            } else if (this.faustInterfaceView.type === "checkbox") {
                return this.faustInterfaceView.addFaustCheckBox(this.itemParam.init);
            }
            else if (this.faustInterfaceView.type === "midilabel") {
                return this.faustInterfaceView.addFaustMidiLabel(this.itemParam);
            }
        }
    }

    // Set eventListner of the faustInterfaceView
    setEventListener() {
        if (this.faustInterfaceView && this.faustInterfaceView.type) {
            if (this.faustInterfaceView.type === "vslider" || this.faustInterfaceView.type === "hslider") {
                this.faustInterfaceView.slider.addEventListener("input", (event) => {
                    this.interfaceCallback(this);
                    event.stopPropagation();
                    event.preventDefault();
                });
                this.faustInterfaceView.slider.addEventListener("mousedown", (e) => { e.stopPropagation() })
                this.faustInterfaceView.slider.addEventListener("touchstart", (e) => { e.stopPropagation() })
                this.faustInterfaceView.slider.addEventListener("touchmove", (e) => { e.stopPropagation() })
            } else if (this.faustInterfaceView.type === "button") {
                this.faustInterfaceView.button.addEventListener("mousedown", (e: Event) => {
                    e.stopPropagation();
                    this.interfaceCallback(this)

                })
                this.faustInterfaceView.button.addEventListener("mouseup", (e: Event) => {
                    e.stopPropagation();
                    this.interfaceCallback(this)
                })
                this.faustInterfaceView.button.addEventListener("touchstart", (e: Event) => {
                    e.stopPropagation();
                    this.interfaceCallback(this)
                })
                this.faustInterfaceView.button.addEventListener("touchend", (e: Event) => {
                    e.stopPropagation();
                    this.interfaceCallback(this)
                })
            } else if (this.faustInterfaceView.type === "checkbox") {

            }
        }
    }

   
    //callback to update the dsp value
    callbackValueChange(address: string, value: number) {
        this.setDSPValueCallback(address, String(value));
        this.faustInterfaceView.slider.value = String((value - parseFloat(this.itemParam.min)) / parseFloat(this.itemParam.step))
        this.faustInterfaceView.output.textContent = String(value.toFixed(parseFloat(this.precision)));
    }

    static addButton(name, callback):FaustInterfaceControler{

        var itemElement  :Iitem=  {type:"button", label:name};
        var controler: FaustInterfaceControler = new FaustInterfaceControler(
            (faustInterface) => { callback() },
            (adress, value) => { }
        );
        controler.itemParam = itemElement;
        controler.value = "0";
        return controler;
    }

    static addMidiLabel(name, callback):FaustInterfaceControler{

        var itemElement :Iitem=  { type:"midilabel", label:name};
        var controler: FaustInterfaceControler = new FaustInterfaceControler(
            (faustInterface) => { callback() },
            (adress, value) => { }
        );
        controler.itemParam = itemElement;
        controler.value = "0";
        return controler;
    }

    static addSlider(name, min, max, value,step, callback):FaustInterfaceControler{

        var itemElement :Iitem =  { type:"hslider", label:name,min : min, max :max, init:value, address: "", step:step, meta:[] };
        var controler: FaustInterfaceControler = new FaustInterfaceControler(
            (faustInterface) => {callback(faustInterface) },
            (adress, value) => { }
        );
        controler.itemParam = itemElement;
        return controler;
    }
}

/********************************************************************
********************* ADD GRAPHICAL ELEMENTS ***********************
********************************************************************/
class FaustInterfaceView {
    type : string;
    inputNode :HTMLDivElement;
    outputNode : HTMLDivElement;
    slider: HTMLInputElement;
    button: HTMLInputElement;
    output: HTMLElement;
    group: HTMLElement;
    label: HTMLElement;

    constructor(type: string) {
        this.type = type;
    }

    addFaustModuleSlider(itemParam: Iitem, precision: number, unit: string): HTMLElement {

        var group = document.createElement("div");
        
        group.className = "control-group";

        var info: HTMLDivElement = document.createElement("div");
        info.className = "slider-info";
        info.setAttribute("parameter_address", itemParam.address);
        info.setAttribute("min", itemParam.min);
        info.setAttribute("max", itemParam.max);
        info.setAttribute("step", itemParam.step);
        info.setAttribute("precision", String(precision));
        var lab: HTMLSpanElement = document.createElement("span");
        lab.className = "label";
        lab.appendChild(document.createTextNode(itemParam.label));
        this.label = lab;
        info.appendChild(lab);
        var val: HTMLSpanElement = document.createElement("span");
        val.className = "value";
        this.output = val;


        this.inputNode = document.createElement("div");
        this.inputNode.className = "parameter-node  parameter-node-input";
        this.inputNode.draggable = false;
        let spanNode: HTMLSpanElement = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.inputNode.appendChild(spanNode);
        group.appendChild(this.inputNode)

        
        this.outputNode = document.createElement("div");
        this.outputNode.className = "parameter-node  parameter-node-output";
        this.outputNode.draggable = false;
        spanNode = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.outputNode.appendChild(spanNode);
        group.appendChild(this.outputNode)

        var myValue: string = Number(itemParam.init).toFixed(precision);

        val.appendChild(document.createTextNode("" + myValue + " " + unit));
        val.setAttribute("units", unit);
	      info.appendChild(val);

	      group.appendChild(info);

        var high: number = (parseFloat(itemParam.max) - parseFloat(itemParam.min)) / parseFloat(itemParam.step);

        var slider: HTMLInputElement = document.createElement("input");
	    slider.type="range";
	    slider.min =  "0";
        slider.max = String(high);
        slider.value = String((parseFloat(itemParam.init) - parseFloat(itemParam.min)) / parseFloat(itemParam.step));
        slider.step = "1";
        this.slider = slider;
        group.appendChild(slider);


        this.group = group

        return group;
        

    }

    addFaustCheckBox(ivalue: string): HTMLInputElement {
        var group = document.createElement("div");

        var checkbox: HTMLInputElement = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;

        checkbox.id = "mycheckbox";

        var label: HTMLLabelElement = document.createElement('label')
        label.htmlFor = "mycheckbox";
        label.appendChild(document.createTextNode(" " + ivalue));

        group.appendChild(checkbox);
        group.appendChild(label);

        return checkbox;
    }

    addFaustButton(itemParam: Iitem):HTMLElement {

        var group = document.createElement("div");

        var button = document.createElement("input");
        button.type = "button";
        this.button = button;
        this.button.value = itemParam.label;

        group.appendChild(button);

	    return button;
    }

    
    addFaustTextInput(itemParam: Iitem):HTMLElement {

        var group = document.createElement("div");

        var button = document.createElement("input");
        button.type = "text";
        this.button = button;
        this.button.value = itemParam.label;

        group.appendChild(button);
	    return button;
    }
    
    addFaustMidiLabel(itemParam: Iitem):HTMLElement {

        var group = document.createElement("div");
        group.className = "control-group";
        var info: HTMLDivElement = document.createElement("div");
        info.className = "slider-info";
        info.setAttribute("instrument_id", itemParam.label);

        var lab: HTMLSpanElement = document.createElement("span");
        lab.className = "label";
        lab.appendChild(document.createTextNode(itemParam.label));
        this.label = lab;
        info.appendChild(lab);

        
        this.outputNode = document.createElement("div");
        this.outputNode.className = "parameter-node parameter-node-output midi-output";
        this.outputNode.draggable = false;
        let spanNode = document.createElement("span");
        spanNode.draggable = false;
        spanNode.className = "node-button";
        this.outputNode.appendChild(spanNode);
        group.appendChild(this.outputNode)

        group.appendChild(info);
        this.group =group;

	    return group;
    }
}
