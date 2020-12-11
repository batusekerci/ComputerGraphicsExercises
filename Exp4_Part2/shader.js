/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const v_shader_2 = `#version 300 es
  in vec4 a_position;
  
 
  void main() {
    gl_Position = a_position;

  }
`;

const f_shader_2 = `#version 300 es
  precision highp float;
 

  uniform vec3 color;

 
  out vec4 outColor;
 
  void main () {
    

    outColor = vec4(color, 1.0);
  }
`;


