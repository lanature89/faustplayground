/*				MODULECLASS.JS
HAND-MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE AND ITS INTERFACE

*/

/// <reference path="../Dragging.ts"/>
/// <reference path="../CodeFaustParser.ts"/>
/// <reference path="../Connect.ts"/>
/// <reference path="../Modules/FaustInterface.ts"/>
/// <reference path="../Messages.ts"/>
/// <reference path="ModuleFaust.ts"/>
/// <reference path="ModuleView.ts"/>
/// <reference path="GraphicalModule.ts"/>

interface iMovement{
    min_loops: number, 
    instruments : string[],
    midi_files : any //{instrument : [files]}
}

interface iComposition{
    n_movements:number,
    movements: iMovement[]
}

//Todo, delete callback targets on cable deletion
class InstrumentController{
    name: string;
    movementMidiControllers : {number:MIDIManager[]};
    fileLoaded : boolean;
    numbars : number;
    currentMovement : 0;
    currentController : 0;
    connectors : Connector[];
    isPlaying :boolean;
    callbackTargets :Function[];   
    
    constructor(name:string, n_movements:number){
        this.name = name;
        this.fileLoaded = false;
        this.movementMidiControllers ={}// {number: MIDIManager[]}
        this.currentMovement = 0;
        this.currentController = 0;
        this.isPlaying = false;
        this.callbackTargets =[];
        this.connectors = [];
        for(let i =0; i <n_movements; i++){
            this.movementMidiControllers[i] = []
        }
    }
    addMidiCallback(c: Connector, cb:Function){
        this.callbackTargets.push(cb);
        this.connectors.push(c);
        // for (let m of Object.keys(this.movementMidiControllers)){
        //     for (let c of this.movementMidiControllers[m]){
        //         c.addListener(cb);
        //     }
        // }
    }
    midiCallback(midiInfo){
        console.log (`${this.name} - MIDI event: ${midiInfo}`);
        var cbtl = this.callbackTargets.length
        if ( cbtl>0){
            for (let i =0; i<cbtl; i++){
                this.callbackTargets[i](midiInfo)
            }
        }
    }
    loadMidi(file, movement){
        let m = new MIDIManager((midiInfo)=>this.midiCallback(midiInfo));
        m.loadFile(file, (file) =>{this.midiLoaded(file)},null, (file)=> (this.midiLoadFailed(file)))
        this.movementMidiControllers[movement].push(m);
    }
    
    midiLoaded(filename:string):void{
        console.log(this.name + " successfully loaded file : "+ filename)
        this.fileLoaded =true;
    }
    
    midiLoadFailed(filename:string):void{
        console.log(this.name + " failed to load file : "+ filename)
        this.fileLoaded =false;
    }
    
    play():void{
        console.log(`${this.name} starting playback of movement ${this.currentMovement} -${this.currentController}`)
        let movementLength = this.movementMidiControllers[this.currentMovement].length;
        if (movementLength >0){
            if (this.currentController >=movementLength||this.currentController<0){
                this.currentController =0;
            }
            this.movementMidiControllers[this.currentMovement][this.currentController].start();
            this.isPlaying = true;
        }
    }

    setBPM(bpm){
        for(let key of Object.keys(this.movementMidiControllers)){  
            for (let c of this.movementMidiControllers[key]){
                c.setBPM(bpm)
            }
        }
    }
    
    stop():void{
        this.movementMidiControllers[this.currentMovement][this.currentController].stop();
        this.isPlaying = false;
    }
    
    loopCallback():void{
        this.currentController +=1;
        this.play();
    }
} 

//TODO:
//make a midi output connector for each unique instrument
//overall bpm slider
//on movement load
//calculate maximum number of bars possible 

//todo: add probabilities

class CompositionModule extends GraphicalModule{
    movementIndex : number;
    totalMovements: number;
    movements: iMovement[];
    
    currentMovement : iMovement;
    instruments : Set<string>;
    instrumentControllers : {string:InstrumentController};
    
    protected deleteCallback: (module: CompositionModule) => void;
    protected fModuleInterfaceParams: { [label: string]: string } = {};
    
    eventCloseEditHandler: (event: Event) => void;
    
    targetMidiCallback : (c:number,p:number,v:number) => void;
    
    constructor(id: number, x: number, y: number, name: string, htmlElementModuleContainer: HTMLElement,
        removeModuleCallBack: (m: CompositionModule) => void, moduleInfo:JSONModuleDescription, 
        loadedCallback: (m: CompositionModule) => void){
        super(id,x, y, name, htmlElementModuleContainer);
        
        //this.MIDIcontrol =new MIDIManager(this.midiCallback);
        this.eventCloseEditHandler = (event: MouseEvent) => { this.recompileSource(event, this) }
        this.eventOpenEditHandler = () => { this.edit() }
        
        this.deleteCallback = removeModuleCallBack;
        this.typeString = "midimaster"
        this.instruments = new Set<string>()
        this.movements = []
        this.instrumentControllers = {}
        this.fetchCompositionFile(moduleInfo.file, loadedCallback)        
        // var connector: Connector = new Connector();
        // connector.createConnection(this, this.moduleView.getOutputNode(), saveOutCnx[i].destination, saveOutCnx[i].destination.moduleView.getInputNode());
        
    }
    //load composition json file
    fetchCompositionFile(file:string, cb):void {
        var fp =Utilitary.getCompositionDir() + file;
        console.log(`Loading composition file ${fp}`);
        fetch(fp)
        .then(response=> response.json())
        .then(json=> {
            this.loadComposition(json);
            cb(this);
            }
        )
    }
    
    loadComposition(comp:iComposition):void {
        let movement:iMovement;
        this.instruments.clear()
        //todo cleanup past movements and instrument controllers
        // this.movements.clear();
        this.totalMovements = comp.n_movements;
        console.log(`Comp contains ${this.totalMovements} movements`)

        for (let i =0; i<comp.n_movements; i++){
            movement = comp.movements[i];
            this.movements.push(movement);
            for(let inst of movement.instruments ){
                this.instruments.add(inst);
                if (this.instrumentControllers[inst]==null){
                    this.instrumentControllers[inst] = (new InstrumentController(inst, this.totalMovements))
                }
            }
            
            for(let inst of movement.instruments){
                for(let midifile of movement.midi_files[inst]){
                    this.instrumentControllers[inst].loadMidi( Utilitary.getMidiDir() +midifile, i)
                }
            }
        }
        this.currentMovement = comp.movements[0];
        this.movementIndex = 0;
    }
    
    startMovement(movementIndex):void{
        var movementInstruments= this.movements[movementIndex].instruments;
        console.log(`Starting movement ${movementIndex}`)
        for(let instrument of this.instruments){
            let ic:InstrumentController = this.instrumentControllers[instrument]
            ic.currentMovement =movementIndex;
            //in movement
            if (movementInstruments.indexOf(instrument) >=0){
                if (!ic.isPlaying){
                    ic.play();
                }
            }
            // not in movement
            else{
                if (ic.isPlaying){
                    ic.stop();
                }
            }
        }
    }
    
    playAll():void{
        for(let instrument of this.instruments){
            let ic:InstrumentController = this.instrumentControllers[instrument]
            ic.currentMovement =this.movementIndex;
            if (!ic.isPlaying){
                ic.play();
            }
        }
    }

    setBPM(bpm):void{
        for(let instrument of this.instruments){
            let ic:InstrumentController = this.instrumentControllers[instrument]
            ic.setBPM(bpm)

        }
    }
    
    
    stopAll():void{
        for(let instrument of this.instruments){
            let ic = this.instrumentControllers[instrument]
            if (ic.isPlaying){
                ic.stop();
            }
        }
    }
    
    //todo: add probabilities
    nextMovement():void{
        this.movementIndex +=1;
        this.startMovement(this.movementIndex)
    }
    
    
    /*******************************  PUBLIC METHODS  **********************************/
    deleteModule(): void {
        
        var connector: Connector = new Connector()
        
        //connector.disconnectMIDIModule(this);
        super.deleteModule();
        this.deleteCallback(this);
    }

    addMidiCallback(id:string,c:Connector, cb ):void{
        if(!this.instrumentControllers[id]){
            console.log(`Failed to set callback because instrument ${id} does not exist`)
        }

        this.instrumentControllers[id].addMidiCallback(c, cb)
        
    }

    
    /******************** EDIT SOURCE & RECOMPILE *************************/
    //OVERRIDE
    edit(): void {
        
        this.saveInterfaceParams();
        
        var event: CustomEvent = new CustomEvent("codeeditevent")
        document.dispatchEvent(event);
        
        this.deleteFaustInterface();
        
        this.moduleView.textArea.style.display = "block";
        //this.moduleView.textArea.value = this.MIDIcontrol.;
        Connector.redrawInputConnections(this, this.drag);
        Connector.redrawOutputConnections(this, this.drag);
        this.moduleView.fEditImg.style.backgroundImage = "url(" + Utilitary.baseImg + "enter.png)";
        this.moduleView.fEditImg.addEventListener("click", this.eventCloseEditHandler);
        this.moduleView.fEditImg.addEventListener("touchend", this.eventCloseEditHandler);
        this.moduleView.fEditImg.removeEventListener("click", this.eventOpenEditHandler);
        this.moduleView.fEditImg.removeEventListener("touchend", this.eventOpenEditHandler);
    }
    
    //---- Update ModuleClass with new name/code source
    update(name: string, code: string): void {
        
        var event: CustomEvent = new CustomEvent("midiEditEvent")
        document.dispatchEvent(event);
        
        //this.compileFaust({ name: name, sourceCode: code, x: this.moduleView.x, y: this.moduleView.y});
    }
    
    //---- React to recompilation triggered by click on icon
    protected recompileSource(event: MouseEvent, module: CompositionModule): void {
        
        // Utilitary.showFullPageLoading();
        // var dsp_code: string = this.moduleView.textArea.value;
        // this.moduleView.textArea.style.display = "none";
        // Connector.redrawOutputConnections(this, this.drag);
        // Connector.redrawInputConnections(this, this.drag)
        // module.update(this.moduleView.fTitle.textContent, dsp_code);
        // module.recallInterfaceParams();
        
        // module.moduleView.fEditImg.style.backgroundImage = "url(" + Utilitary.baseImg + "edit.png)";
        // module.moduleView.fEditImg.addEventListener("click", this.eventOpenEditHandler);
        // module.moduleView.fEditImg.addEventListener("touchend", this.eventOpenEditHandler);
        // module.moduleView.fEditImg.removeEventListener("click", this.eventCloseEditHandler);
        // module.moduleView.fEditImg.removeEventListener("touchend", this.eventCloseEditHandler);
    }
    
    /***************** CREATE/DELETE the DSP Interface ********************/
    //play, reset, movement select buttons
    // Fill fInterfaceContainer with the DSP's Interface (--> see FaustInterface.js)
    //Override
    setFaustInterfaceControles(): void {
        //this.moduleView.fTitle.textContent = this.moduleFaust.fName;
        
            
            this.moduleControles.push(FaustInterfaceControler.addButton("Start", () => {this.playAll()}))
            this.moduleControles.push(FaustInterfaceControler.addButton("Stop", () => {this.stopAll()}))
            
            for(let i = 0; i<this.totalMovements; i++){
                this.moduleControles.push(FaustInterfaceControler.addButton(`M ${i}`, () => {this.startMovement(i)}))
            }

            for(let inst of this.instruments){
                this.moduleControles.push(FaustInterfaceControler.addMidiLabel(inst, () => {}))
            }

            this.moduleControles.push(FaustInterfaceControler.addSlider("BPM", 30, 300, 60, 1, (value) => {this.setBPM(value)}))
            
            //this.moduleControles = moduleFaustInterface.parseFaustJsonUI(JSON.parse(this.getJSON()).ui, this);
        }
        
        // interface Iitem{
        //     label: string;
        //     init: string;
        //     address: string;
        //     type: string;
        //     min: string;
        //     max: string;
        //     step: string;
        //     meta: FaustMeta[];
        // }
        
        
        // Delete all FaustInterfaceControler
        protected deleteFaustInterface(): void {
            
            super.deleteFaustInterface();
        }
        
        
        // set DSP value to all FaustInterfaceControlers
        setOutputValues() {

        }
        
        // set DSP value to specific FaustInterfaceControlers
        setDSPValueCallback(address: string, value: string) {

        }
        
        
        //Function overrides
        getNumInputs(): number{
            return 0;
            //return this.MIDIcontrol.getNumInputs();
        }
        
        getNumOutputs(): number{
            return 0 ;
            //return this.MIDIcontrol.getNumOutputs();
        }
        
        setParamValue(text:string, val:string):void{
            //this.MIDIcontrol.setParamValue(text, val);
        } 
        
        getOutputConnections() : Connector[]{
            var connectors = []
            for (let inst of this.instruments){
                connectors.push(...this.instrumentControllers[inst].connectors)
            }
            return connectors;
        }
        
        getParameterConnections() : Connector[]{
            return [];
            //return this.MIDIcontrol.fOutputConnections;
        }
        
    }