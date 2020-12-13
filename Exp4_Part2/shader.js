const v_shader_2 = `#version 300 es
  
  in vec4 a_position;
  
  uniform mat4 u_matrix;
 
  void main() {
    gl_Position = u_matrix * a_position;
  }
`;

const f_shader_2 = `#version 300 es
  
  precision highp float;
 
  uniform vec4 color;
 
  out vec4 outColor;
 
  void main () {
    outColor = color;
  }
`;
