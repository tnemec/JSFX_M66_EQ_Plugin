// Effect by Tony Nemec - TN Design
// You are free to modify and distrubute this. 
// License: LGPL - http://www.gnu.org/licenses/gpl.html

// Mono vintage-type EQ with analog saturation
// Input Trim: -20dB to +10dB
// LF Gain, LMF Gain, HMF Gain, HF Gain & Output: -10dB to +10dB
// LF switchable center frequncy at 80Hz or 200Hz fixed Q of 2.0
// HF switchable center frequncy at 10kHz or 2k0Hz fixed Q of 2.0
// LPF, HPF sweepable frequency with fixed Q of 0.5
// BW controls: 1 = narrow, 4 = wide
// Saturation: Analog-type tape saturation simulation

desc:M66 Vnitage EQ (GUI)
//tags: equalizer filter
//author: TN Design


slider1:0<-20,10,0.1>Input Trim
slider2:0<-10,10,0.1>LF Gain
slider3:0<0,2,1{80,200}>LF Freq (Hz)
slider4:0<0,300,0.5>HPF Freq (Hz)
slider5:0<-10,10,0.1>LMF Gain
slider6:0<250,1500,0.5>LMF Freq (Hz)
slider7:2<1,4,0.1>LMF BW
slider8:0<-10,10,0.1>HMF Gain
slider9:0<2000,7500,1>HMF Freq (Hz)
slider10:2<1,4,0.1>HMF BW
slider11:0<-10,10,0.1>HF Gain
slider12:0<0,2,1{10000,12000}>HF Freq (Hz)
slider13:20000<5000,20000,1>LPF Freq (Hz)
slider14:0<0,10,0.1>Saturation
slider15:0<-10,10,0.1>Output Level

filename:0,gfx/M66_panel.png
filename:1,gfx/wave_blk_skirt_80px.png
filename:2,gfx/pushbutton_plus_led.png
filename:3,gfx/switch_toggle.png

in_pin:left input
in_pin:right input
out_pin:left output
out_pin:right output


// RBJ's Cookbook library
// Auth: Derek John Evans
import rbj.jsfx-inc


@init

  HPFQ = 0.5;
  LPFQ = 0.5;
  LFBW = 2;
  HFBW = 2;
  EQin = 1;
  initdraw = 1;
  autorefreshinterval = 30; // 1sec gfx will redraw after this count is reached
  autorefreshcount = 0;

  function setParameters() (

    inputLvl = 10^(slider1/20);

    LFFreq = (slider3 == 0 ? 80 : 200);
    HFFreq = (slider12 == 0 ? 10000 : 12000);
    
    HPFLvl = Max(1,slider4);

    hp.RBJ.SetFAQ(HPFLvl, 0, HPFQ); // HPF
    hp.RBJ.HPF();

    p0.RBJ.SetFG2BW1(LFFreq, slider2, LFBW); // LF
    p0.RBJ.PeakEq();

    p1.RBJ.SetFG2BW1(slider6, slider5, slider7); // LMF
    p1.RBJ.PeakEq();

    p2.RBJ.SetFG2BW1(slider9, slider8, slider10); // HMF
    p2.RBJ.PeakEq();     

    p3.RBJ.SetFG2BW1(HFFreq, slider11, HFBW); // LF
    p3.RBJ.PeakEq();

    lp.RBJ.SetFAQ(slider13, 0, LPFQ); // LPF
    lp.RBJ.LPF();          

    saturationLvl = Max(1,slider14 * 10);
    satA = saturationLvl/200*$pi;
    satB = sin(saturationLvl/200*$pi);
    
    outputLvl =  10^(slider15/20);

  );

  setParameters();


  function draw_pot(x,y,fw,fh,fn,f,t,s,d,rev,img)
   // (dest x, dest y, control width, control height, normalized (img count), min val, max val, step, default, reverse control, img index)
   (
     
     this.range = abs(f - t);
     this.steps = this.range / s;
          
     // Mouse Logic
     mouse_x >= x && mouse_x <= x+fw && mouse_y >= y && mouse_y <= y+fh && !this.disabled && !_priority ?  (
       !mouse_cap ? this.hasEntered = 1;
       mouse_cap ? this.hasClicked = 1;
       mouse_cap & 4 ? this.value = d;
       this.hasEntered && this.hasClicked ? (
         this.canChange = 1;         
          _priority = id;
       );
     ) : (
       this.hasEntered = this.hasClicked = 0;
     );
     !mouse_cap ? (
       this.canChange = 0;
       _priority = 0;  
     );
     
     // Process
     this.canChange && id == _priority ? (
        this.value += (this.y_tmp - mouse_y ) * s; 
         _sliderDirty = 1;
     );
     
     this.y_tmp = mouse_y;
  
     // Update
     this.value.temp != this.value ? (   
       this.value = max(this.value,f);
       this.value = min(this.value,t);
       this.normalized = this.value * (1/(this.steps * s)) * 0.999;
       rev ? this.normalized = max(0,1 - this.normalized);
       this.rpos = floor((1 - this.normalized) + fn * this.normalized) * fh ;
       this.value == 0 ? this.rpos = 0;
       
       _draw = 1;
       this.value.temp = this.value;   
     );
     
     drawindex += 8;
     this.coord = drawindex;
     this.coord[0] = 0;
     this.coord[1] = this.rpos;
     this.coord[2] = this.coord[6] = fw;
     this.coord[3] = this.coord[7] = fh;
     this.coord[4] = x;
     this.coord[5] = y;
     
     this.img = img;
      
     // gfx_blitext(img, this.coord, 0);
     
     this.value;
   );
   
   
   function drawSwitch(x,y,w,h,img)
   (
     // Mouse Logic
     mouse_x >= x && mouse_x <= x+w && mouse_y >= y && mouse_y <= y+h && !this.disabled ? (
       !mouse_cap ? this.hasEntered = 1;
       mouse_cap ? this.hasClicked = 1;
       this.hasEntered && this.hasClicked ? this.canChange = 1;
     ) : (
       this.hasEntered = this.hasClicked = this.canChange = 0;
     );
     !mouse_cap ? (this.canChange = 0;);
   
     this.canChange ? (
       this.value = 1-this.value;
       this.hasEntered = this.hasClicked = this.canChange = 0;
       _sliderDirty = 1;
     );

     this.value.temp != this.value ? (   
        _draw = 1;
        this.value.temp = this.value;   
     ) ;
      
     drawindex += 8;
     this.coord = drawindex;
     this.coord[0] = 0;
     this.coord[1] = 0; // top img is on
     this.coord[2] = this.coord[6] = w;
     this.coord[3] = this.coord[7] = h;
     this.coord[4] = x;
     this.coord[5] = y; 
     
     // Checked
     this.value ? (
      this.coord[1] = h;    
      );
      
      this.img = img;
      
     //gfx_blitext(img, this.coord, 0);
       
     this.value; 
   );

@slider 

  s1.value = slider1 + 20;
  s2.value = slider2 + 10;
  s3.value = slider3;
  s4.value = slider4;
  s5.value = slider5 + 10;
  s6.value = slider6 -250;
  s7.value = slider7 -1;
  s8.value = slider8 +10; 
  s9.value = slider9 -2000;  
  s10.value = slider10 -1;  
  s11.value = slider11 + 10;
  s12.value = slider12;
  s13.value = slider13 -5000;
  s15.value = slider15 + 10;
  s16.value = EQIn;
        
  setParameters();


@sample 

  EQIn ? (
    op0 = spl0 * inputLvl;
    op0 = hp.RBJ.Sample(op0);
    op0 = p0.RBJ.Sample(op0);
    op0 = p1.RBJ.Sample(op0);
    op0 = p2.RBJ.Sample(op0);
    op0 = p3.RBJ.Sample(op0);
    op0 = lp.RBJ.Sample(op0);
    op0 = min(max( sin(max(min(op0,1),-1)*satA)/satB ,-1) ,1);

    spl0 = spl1 = op0 * outputLvl;
  )

@gfx 709 229

  drawindex = 1000;
  
  autorefreshcount == autorefreshinterval ? (
    _draw = 1;
    autorefreshcount = 0;
  );
  autorefreshcount += 1;
  
         
  // pots
  slider1 = s1.draw_pot(24,33,80,80,60,0,30,0.1,20,0,1) -20;  //Input
  slider2 = s2.draw_pot(122,33,80,80,60,0,20,0.1,10,0,1) -10;  //LF Gain
  slider4 = Max(0.1,s4.draw_pot(122,142,80,80,60,0,300,1.1,0,0,1));  //HPF
  slider5 = s5.draw_pot(225,33,80,80,60,0,20,0.1,10,0,1) -10;  //LMF Gain
  slider6 = s6.draw_pot(235,142,80,80,60,0,1250,3,0,0,1) + 250;  //LMF Freq
  slider7 = s7.draw_pot(317,33,80,80,60,0,3,0.02,1,0,1) +1;  //LMF BW 
  slider8 = s8.draw_pot(417,33,80,80,60,0,20,0.1,10,0,1) -10;  //HMF Gain 
  slider9 = s9.draw_pot(355,142,80,80,60,0,5500,15,0,0,1) +2000;  //HMF Freq
  slider10 = s10.draw_pot(446,142,80,80,60,0,3,0.02,1,0,1) +1;  //HMF BW   
  slider11 = s11.draw_pot(545,33,80,80,60,0,20,0.1,10,0,1) -10;  //HF Gain  
  slider13 = s13.draw_pot(545,142,80,80,60,0,15000,50,0,0,1) +5000;  //LPF
  slider14 = s14.draw_pot(646,33,80,80,60,0,10,0.1,0,0,1);  //Saturation
  slider15 = s15.draw_pot(646,142,80,80,60,0,20,0.1,10,0,1) -10;  //output
   
 // switches
  slider3 = s3.drawSwitch(123,3,32,32,3);
  slider12 = s12.drawSwitch(546,3,32,32,3); 
  EQIn = s16.drawSwitch(35,130,60,60,2);
  

  _draw || initdraw ? (
    gfx_x = 0; gfx_y = 0;   
    gfx_dest = -1; 
    gfx_blit(0,1,0); //background
    gfx_blitext(s1.img, s1.coord, 0);
    gfx_blitext(s2.img, s2.coord, 0);
    gfx_blitext(s3.img, s3.coord, 0);
    gfx_blitext(s4.img, s4.coord, 0);    
    gfx_blitext(s5.img, s5.coord, 0);
    gfx_blitext(s6.img, s6.coord, 0);
    gfx_blitext(s7.img, s7.coord, 0);
    gfx_blitext(s8.img, s8.coord, 0);
    gfx_blitext(s9.img, s9.coord, 0);
    gfx_blitext(s10.img, s10.coord, 0);
    gfx_blitext(s11.img, s11.coord, 0);
    gfx_blitext(s12.img, s12.coord, 0);    
    gfx_blitext(s13.img, s13.coord, 0);
    gfx_blitext(s14.img, s14.coord, 0);
    gfx_blitext(s15.img, s15.coord, 0);
    gfx_blitext(s16.img, s16.coord, 0);    
    
     gfx_r = 0.1; gfx_g = 0.1; gfx_b = 0.1;
     EQIn ? ( 
       gfx_x = 57; gfx_y = 161;
     ) : (
       gfx_x = 55; gfx_y = 160;
     );
       gfx_setfont(1, Arial, 19, b); 
       gfx_drawstr("IN");
   _draw = 0;
  );
  
  
  
  _sliderDirty ? (  
    setParameters();
    _sliderDirty = 0;
  );

