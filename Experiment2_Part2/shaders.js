/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const v_shader_2 = `#version 300 es
    in vec4 a_position;
    in vec4 a_color;
    out vec4 color;
    uniform vec4 scale_factor;
    uniform vec2 u_rotation;

    void main() {
        vec4 scaledPos = a_position * scale_factor;
        vec2 rotatedPosition = vec2(
            scaledPos.x * u_rotation.y + scaledPos.y * u_rotation.x,
            scaledPos.y * u_rotation.y - scaledPos.x * u_rotation.x);

        
            gl_Position = vec4 (rotatedPosition,0,1);
        color = a_color;
    }
`;

const f_shader_2 = `#version 300 es
    precision mediump float;
    in vec4 color;
    out vec4 outColor ;
    uniform float radi;

    void main() {
        
        outColor  = vec4( color.x  , color.y + radi ,color.z + radi ,1);

    }
`;


