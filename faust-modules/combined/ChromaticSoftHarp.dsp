declare name "Chromatic Soft Harp";
declare author "ER";//Adapted from Nonlinear EKS by Julius Smith and Romain Michon;
declare reference "http://ccrma.stanford.edu/~jos/pasp/vegf.html";

import("music.lib");    // Define SR, delay
import("instrument.lib");
import("effect.lib");   // stereopanner

/* =============== DESCRIPTION ================= 

- Reverberated soft chromatic harp
- Left = Lower frequencies/Silence when still
- Front = Resonance
- Back = No resonance
- Right = Higher frequencies/Fast rhythm
- Head = Reverberation
- Rocking = plucking all strings one by one

*/

//==================== INSTRUMENT =======================

process = par(i, N, NFLeks(i)):>_<: instrReverbHarp : *(vol),*(vol);

NFLeks(n) = filtered_excitation(n+1,P(freq(n)),freq(n)) : stringloop(freq(n));
 
//==================== GUI SPECIFICATION ================
// standard MIDI voice parameters:
// NOTE: The labels MUST be "freq", "gain", and "gate" for faust2pd

N = 24;
hand = hslider("h:[1]/Instrument Hand[acc:0 0 -10 0 10]", 12, 0, N, 1) : automat(bps, 15, 0.0)// => gate
with{
bps = hslider("h:[1]/Speed[style:knob][acc:0 0 -10 0 10]", 480, 180, 720, 1):smooth(0.999) : min(720) : max(180) : int;
};
gain = 1;
vol = 2;
pickangle  = 0.9;
beta = 0.5;

// String decay time in seconds:
t60 = hslider("h:[2]Reverb/[1]Resonance (InstrReverb)[unit:s][acc:2 0 -10 0 10]", 5, 0.5, 10, 0.01):min(10):max(0.5);  // -60db decay time (sec)
B = 0;
L = -10 : db2linear;

//---------------------------------- FREQUENCY TABLE ---------------------------

freq(0) = 130.81;
freq(1) = 138.59;
freq(2) = 146.83;
freq(3) = 155.56;
freq(4) = 164.81;
freq(5) = 174.61;
freq(6) = 184.99;
freq(7) = 195.99;
freq(8) = 207.65;
freq(9) = 220.00;
freq(10) = 233.08;
freq(11) = 246.94;


freq(d)	 = freq(d-12)*(2);	
	

//==================== SIGNAL PROCESSING ================

//----------------------- noiseburst -------------------------
// White noise burst (adapted from Faust's karplus.dsp example)
// Requires music.lib (for noise)
noiseburst(d,e) = noise : *(trigger(d,e))
with{
upfront(x) = (x-x') > 0;
decay(n,x) = x - (x>0)/n;
release(n) = + ~ decay(n);
position(d) = abs(hand - d) < 0.5;
trigger(d,n) = position(d) : upfront : release(n) : > (0.0);
};

//nlfOrder = 6;
P(f) = SR/f ; // fundamental period in samples
Pmax = 4096; // maximum P (for delay-line allocation)

ppdel(f) = beta*P(f); // pick position delay
pickposfilter(f) = ffcombfilter(Pmax,ppdel(f),-1); // defined in filter.lib

excitation(d,e) = noiseburst(d,e) : *(gain); // defined in signal.lib

rho(f) = pow(0.001,1.0/(f*t60)); // multiplies loop-gain

// Original EKS damping filter:
b1 = 0.5*B; b0 = 1.0-b1; // S and 1-S
dampingfilter1(f,x) = rho(f) * ((b0 * x) + (b1 * x'));

// Linear phase FIR3 damping filter:
h0 = (1.0 + B)/2; h1 = (1.0 - B)/4;
dampingfilter2(f,x) = rho(f) * (h0 * x' + h1*(x+x''));

loopfilter(f) = dampingfilter2(f); // or dampingfilter1

filtered_excitation(d,e,f) = excitation(d,e) : smooth(pickangle) 
		    : pickposfilter(f) : levelfilter(L,f); // see filter.lib

stringloop(f) = (+ : fdelay4(Pmax, P(f)-2)) ~ (loopfilter(f));

//================================= REVERB ==============================

instrReverbHarp = _,_ <: *(reverbGain),*(reverbGain),*(1 - reverbGain),*(1 - reverbGain) : 
zita_rev1_stereo(rdel,f1,f2,t60dc,t60m,fsmax),_,_ <: _,!,_,!,!,_,!,_ : +,+
       with{
       reverbGain = hslider("h:[2]Reverb/[2]Reverberation Volume (InstrReverb)[style:knob][acc:1 0 -30 0 17]", 0.2,0.05,1,0.01):smooth(0.999):min(1):max(0.05);
       roomSize = hslider("h:[2]Reverb/[3]Reverberation Room Size (InstrReverb)[style:knob][acc:1 0 -30 0 16]", 0.72,0.05,2,0.01):min(2):max(0.05);
       rdel = 20;
       f1 = 200;
       f2 = 6000;
       t60dc = roomSize*3;
       t60m = roomSize*2;
       fsmax = 48000;
       };


