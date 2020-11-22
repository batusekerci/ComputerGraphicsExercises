/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const radian = Math.PI/180;

const square = [-0.5, 0.5,       
    0.5, 0.5,       
    -0.5, -0.5,     
    0.5, -0.5];     
          
                                //                                    x = radius * cos(angle)
const center = [-0.5, -0.5];  //                                  Y = radius * sin(angle)
const radius = 0.5;   
                              
       
const color_s = [0.1, 0.8, 0.3];  // Square's color

let square_color = [];
for(let i = 0; i < 4; i++){
    square_color = square_color.concat(color_s);
}

