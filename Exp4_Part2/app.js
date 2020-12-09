"use strict";


window.onload = function() {
    init();
};

async function init() {
    const canvas = document.querySelector("#glCanvas"); //get canvas element
    const gl = canvas.getContext("webgl2"); //get webgl2 from WebGL2RenderingContext
    
    if(!gl) { // if your browser does not support webgl2
        alert("WebGL2 is not working on this browser!");
        return;
    }

  twgl.setAttributePrefix("a_");

  //create shaders
  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, v_shader_2);
  gl.compileShader(vertex_shader);
  if ( !gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS) ) {
    var info = gl.getShaderInfoLog(vertex_shader);
    alert("Could not compile vertex shader. \n\n" + info);
    return;
  }

  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, f_shader_2);
  gl.compileShader(fragment_shader);
  if ( !gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS) ) {
    var info = gl.getShaderInfoLog(fragment_shader);
    alert("Could not compile fragment shader. \n\n" + info);
    return;
  }
  const meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const response = await fetch('dragon_10k.obj');
  const text = await response.text();
  const data = parseOBJ(text);
  const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
  const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);

  function parseOBJ(text) {

    const objPositions = [[0, 0, 0]];


    // same order as `f` indices
    const objVertexData = [
      objPositions,

    ];

    // same order as `f` indices
    let webglVertexData = [
      [],   // positions

    ];

    function addVertex(vert) {
      const ptn = vert.split('/');
      ptn.forEach((objIndexStr, i) => {
        if (!objIndexStr) {
          return;
        }
        const objIndex = parseInt(objIndexStr);
        const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
        webglVertexData[i].push(...objVertexData[i][index]);
      });
    }

    const keywords = {
      v(parts) {
        objPositions.push(parts.map(parseFloat));
      },

      f(parts) {
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; ++tri) {
          addVertex(parts[0]);
          addVertex(parts[tri + 1]);
          addVertex(parts[tri + 2]);
        }
      },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();


      const m = keywordRE.exec(line);
      if (!m) {
        continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) {
        console.warn('unhandled keyword:', keyword, 'at line', lineNo + 1);
        continue;
      }
      handler(parts, unparsedArgs);
    }

  return {
    position: webglVertexData[0],

  };
}

}