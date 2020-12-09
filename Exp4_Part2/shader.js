/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const v_shader_2 = `#version 300 es
    in vec4 a_position;
  in vec3 a_normal;
 
  uniform mat4 u_projection;
  uniform mat4 u_view;
  uniform mat4 u_world;
 
  out vec3 v_normal;
 
  void main() {
    gl_Position = u_projection * u_view * u_world * a_position;
    v_normal = mat3(u_world) * a_normal;
  }
`;

const f_shader_2 = `#version 300 es
    precision highp float;
 
  in vec3 v_normal;
 
  uniform vec4 u_diffuse;
  uniform vec3 u_lightDirection;
 
  out vec4 outColor;
 
  void main () {
    vec3 normal = normalize(v_normal);
    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
    outColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
  }
`;


