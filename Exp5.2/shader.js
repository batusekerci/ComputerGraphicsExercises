const v_shader_2 = `#version 300 es
  
  in vec4 a_position;
  in vec2 a_texcoord;
  out vec2 v_texcoord;
  out vec4 fColor;
  uniform mat4 u_matrix;
 
  void main() {
    gl_Position = u_matrix * a_position;
    v_texcoord = a_texcoord;
  }
`;

const f_shader_2 = `#version 300 es
  
  precision highp float;
 
  uniform vec4 color;
  in vec4 fColor;
  
  in vec2 v_texcoord;
  out vec4 outColor;
  uniform sampler2D u_texture;    // Uniform texture variable.
 
  void main () {
    outColor = texture(u_texture, v_texcoord);
  }
`;
