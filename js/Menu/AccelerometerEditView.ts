﻿class AccelerometerEditView {
    blockLayer: HTMLDivElement;
    container: HTMLDivElement;
    radioAxisContainer: HTMLFormElement;
    radioCurveContainer: HTMLFormElement;
    rangeContainer: HTMLDivElement;
    validButton: HTMLButtonElement;
    cancelButton: HTMLButtonElement;
    radioCurve1: HTMLInputElement;
    radioCurve2: HTMLInputElement;
    radioCurve3: HTMLInputElement;
    radioCurve4: HTMLInputElement;
    radioAxisX: HTMLInputElement;
    radioAxisY: HTMLInputElement;
    radioAxisZ: HTMLInputElement;
    range1: HTMLInputElement;
    range2: HTMLInputElement;
    range3: HTMLInputElement;
    rangeVirtual: HTMLInputElement;
    rangeCurrent: HTMLInputElement;

    constructor() {

    }

    initAccelerometerEdit(): HTMLElement {

        var blockLayer = document.createElement("div");
        blockLayer.id = "accBlockLayer";
        this.blockLayer = blockLayer;

        var container = document.createElement("div")
        container.id = "accEditContainer";
        this.container = container;


        var radioAxisContainer = document.createElement("form")
        radioAxisContainer.id = "radioAxisContainer"
        this.radioAxisContainer = radioAxisContainer;

        var labelX = document.createElement("label");
        labelX.className = "axe";
        labelX.id = "axeX";
        labelX.textContent = "axe X : ";

        var labelY = document.createElement("label");
        labelY.className = "axe";
        labelY.id = "axeY";
        labelY.textContent = "axe Y : ";

        var labelZ = document.createElement("label");
        labelZ.className = "axe";
        labelZ.id = "axeZ";
        labelZ.textContent = "axe Z : ";

        var radioX = document.createElement("input");
        radioX.id = "radioX";
        radioX.type = "radio";
        radioX.className = "radio";
        radioX.name = "axis";
        radioX.textContent = "axe X";
        radioX.value = "axe X"
        this.radioAxisX = radioX;
        labelX.appendChild(radioX);

        var radioY = document.createElement("input");
        radioY.id = "radioY";
        radioY.type = "radio";
        radioY.className = "radio";
        radioY.name = "axis";
        radioY.textContent = "axe Y";
        this.radioAxisY = radioY;
        labelY.appendChild(radioY);

        var radioZ = document.createElement("input");
        radioZ.id = "radioZ";
        radioZ.type = "radio";
        radioZ.className = "radio";
        radioZ.name = "axis";
        radioZ.textContent = "axe Z";
        this.radioAxisZ = radioZ;
        labelZ.appendChild(radioZ);


        radioAxisContainer.appendChild(labelX)
        radioAxisContainer.appendChild(labelY)
        radioAxisContainer.appendChild(labelZ)

        var radioCurveContainer = document.createElement("form")
        radioCurveContainer.id = "radioCurveContainer"
        this.radioCurveContainer = radioCurveContainer;

        var label1 = document.createElement("label");
        label1.className = "curve"
        label1.textContent = "curve 1 : ";

        var label2 = document.createElement("label");
        label2.className = "curve"
        label2.textContent = "curve 2 : ";

        var label3 = document.createElement("label");
        label3.className = "curve"
        label3.textContent = "curve 3 : ";

        var label4 = document.createElement("label");
        label4.className = "curve"
        label4.textContent = "curve 4 : ";

        var radio1 = document.createElement("input");
        radio1.id = "radio1";
        radio1.type = "radio";
        radio1.className = "radio";
        radio1.name = "curve";
        radio1.textContent = "curve 1";
        this.radioCurve1 = radio1;
        label1.appendChild(radio1);

        var radio2 = document.createElement("input");
        radio2.id = "radio2";
        radio2.type = "radio";
        radio2.className = "radio";
        radio2.name = "curve";
        radio2.textContent = "curve 2";
        this.radioCurve2 = radio2;
        label2.appendChild(radio2);


        var radio3 = document.createElement("input");
        radio3.id = "radio3";
        radio3.type = "radio";
        radio3.className = "radio";
        radio3.name = "curve";
        radio3.textContent = "curve 3";
        this.radioCurve3 = radio3;
        label3.appendChild(radio3);

        var radio4 = document.createElement("input");
        radio4.id = "radio4";
        radio4.type = "radio";
        radio4.className = "radio";
        radio4.name = "curve";
        radio4.textContent = "curve 4";
        this.radioCurve4 = radio4;
        label4.appendChild(radio4);


        radioCurveContainer.appendChild(label1)
        radioCurveContainer.appendChild(label2)
        radioCurveContainer.appendChild(label3)
        radioCurveContainer.appendChild(label4)

        var accRangeMax = document.createElement("input");
        accRangeMax.id = "accRangeMax";
        accRangeMax.className = "accRange";
        accRangeMax.type = "range";
        this.range3 = accRangeMax;

        var accRangeMid = document.createElement("input");
        accRangeMid.id = "accRangeMid";
        accRangeMid.className = "accRange";
        accRangeMid.type = "range";
        this.range2 = accRangeMid;

        var accRangeMin = document.createElement("input");
        accRangeMin.id = "accRangeMin";
        accRangeMin.className = "accRange";
        accRangeMin.type = "range";
        this.range1 = accRangeMin;

        var accRangeCurrent = document.createElement("input");
        accRangeCurrent.id = "accRangeCurrent";
        accRangeCurrent.className = "accRange acc";
        accRangeCurrent.type = "range";
        this.rangeCurrent = accRangeCurrent;

        var accRangeVirtual = document.createElement("input");
        accRangeVirtual.id = "accRangeVirtual";
        accRangeVirtual.className = "accRange acc";
        accRangeVirtual.type = "range";
        this.rangeVirtual = accRangeVirtual;

        var rangeContainer = document.createElement("div")
        rangeContainer.id = "rangeContainer";
        this.rangeContainer = rangeContainer;

        rangeContainer.appendChild(accRangeMin);
        rangeContainer.appendChild(accRangeMid);
        rangeContainer.appendChild(accRangeMax);
        rangeContainer.appendChild(accRangeCurrent);
        rangeContainer.appendChild(accRangeVirtual);

        var validContainer = document.createElement("div")
        validContainer.id = "validContainer";

        var validButton = document.createElement("button");
        validButton.id = "validButton";
        validButton.className = "accButton";
        this.validButton = validButton;

        var cancelButton = document.createElement("button")
        cancelButton.id = "cancelButton";
        cancelButton.className = "accButton";
        this.cancelButton = cancelButton;


        validContainer.appendChild(cancelButton);
        validContainer.appendChild(validButton);

        container.appendChild(radioAxisContainer)
        container.appendChild(radioCurveContainer)
        container.appendChild(rangeContainer)
        container.appendChild(validContainer)

        blockLayer.appendChild(container);

        return blockLayer;

    }
}