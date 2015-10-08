declare name "Tibetan Bowl";
declare description "Banded Waveguide Modeld Tibetan Bowl";
declare author "Romain Michon";
declare copyright "Romain Michon (rmichon@ccrma.stanford.edu)";
declare version "1.0";
declare licence "STK-4.3"; // Synthesis Tool Kit 4.3 (MIT style license);
declare description "This instrument uses banded waveguide. For more information, see Essl, G. and Cook, P. Banded Waveguides: Towards Physical Modelling of Bar Percussion Instruments, Proceedings of the 1999 International Computer Music Conference.";

//Modifications GRAME July 2015


/* ============ DESCRIPTION =============

- Tibetan Bowl
- Set the frequency manually
- Fishing rod/Front shaking = Ringing the bowl
- Right = maximum modulation
- Rocking = modulating the sound

*/

import("music.lib");
import("instrument.lib");

//==================== INSTRUMENT =======================

process = (((select-1)*-1) <:
		//nModes resonances with nModes feedbacks for bow table look-up
		par(i,nModes,(resonance(i)~_))):>+:
		NLFM :> lowpass(1, 5000);

//==================== GUI SPECIFICATION ================

freq = hslider("[1]Frequency[unit:Hz][tooltip:Tone frequency]",440,180,780,1);
gain = 0.5;
gate = 0;
select = hslider("[0]Play[tooltip:0=Bow; 1=Strike] [acc:2 0 -10 0 10]", 0,0,1,1);
baseGain = 0.5;
typeModulation = 3;
nonLinearity = hslider("[2]Modulation[acc:0 0 -10 0 10][tooltip:Nonlinearity factor (value between 0 and 1)]",0.02,0,0.1,0.001):smooth(0.999);
frequencyMod = hslider("[3]Modulation Frequency[unit:Hz][acc:0 1 -10 0 10]", 220,150,500,0.1):smooth(0.999);
nonLinAttack = 0.1;

//==================== MODAL PARAMETERS ================

preset = 0;

nMode(0) = 12;

modes(0,0) = 0.996108344;
basegains(0,0) = 0.999925960128219;
excitation(0,0) = 11.900357 / 10;

modes(0,1) = 1.0038916562;
basegains(0,1) = 0.999925960128219;
excitation(0,1) = 11.900357 / 10;

modes(0,2) = 2.979178;
basegains(0,2) = 0.999982774366897;
excitation(0,2) = 10.914886 / 10;

modes(0,3) = 2.99329767;
basegains(0,3) = 0.999982774366897;
excitation(0,3) = 10.914886 / 10;

modes(0,4) = 5.704452;
basegains(0,4) = 1.0;
excitation(0,4) = 42.995041 / 10;

modes(0,5) = 5.704452;
basegains(0,5) = 1.0;
excitation(0,5) = 42.995041 / 10;

modes(0,6) = 8.9982;
basegains(0,6) = 1.0;
excitation(0,6) = 40.063034 / 10;

modes(0,7) = 9.01549726;
basegains(0,7) = 1.0;
excitation(0,7) = 40.063034 / 10;

modes(0,8) = 12.83303;
basegains(0,8) = 0.999965497558225;
excitation(0,8) = 7.063034 / 10;

modes(0,9) = 12.807382;
basegains(0,9) = 0.999965497558225;
excitation(0,9) = 7.063034 / 10;

modes(0,10) = 17.2808219;
basegains(0,10) = 0.9999999999999999999965497558225;
excitation(0,10) = 57.063034 / 10;

modes(0,11) = 21.97602739726;
basegains(0,11) = 0.999999999999999965497558225;
excitation(0,11) = 57.063034 / 10;

//==================== SIGNAL PROCESSING ================

//----------------------- Nonlinear filter ----------------------------
//nonlinearities are created by the nonlinear passive allpass ladder filter declared in filter.lib

//nonlinear filter order
nlfOrder = 6;

//nonLinearModultor is declared in instrument.lib, it adapts allpassnn from filter.lib
//for using it with waveguide instruments
NLFM =  nonLinearModulator((nonLinearity : smooth(0.999)),1,freq,
typeModulation,(frequencyMod : smooth(0.999)),nlfOrder);

//----------------------- Synthesis parameters computing and functions declaration ----------------------------

//the number of modes depends on the preset being used
nModes = nMode(preset);

delayLengthBase = SR/freq;

//delay lengths in number of samples
delayLength(x) = delayLengthBase/modes(preset,x);

//delay lines
delayLine(x) = delay(4096,delayLength(x));

//Filter bank: bandpass filters (declared in instrument.lib)
radius = 1 - PI*32/SR;
bandPassFilter(x) = bandPass(freq*modes(preset,x),radius);

//One resonance
resonance(x) = + : + (excitation(preset,x)*select) : delayLine(x) : *(basegains(preset,x)) : bandPassFilter(x);
