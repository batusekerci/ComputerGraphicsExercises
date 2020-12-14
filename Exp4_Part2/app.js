"use strict";

var rot = 0;
var speed = 2;
var islocked = true;

var theta  = 0.0;
var phi    = 0.0;

window.onload = function() {
    init();
};

async function init() {
  const canvas = document.querySelector("#glCanvas"); //get canvas element
  const gl = canvas.getContext("webgl2"); //get webgl2 from WebGL2RenderingContext

  if (!gl) { // if your browser does not support webgl2
    alert("WebGL2 is not working on this browser!");
    return;
  }

  //create shaders
  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, v_shader_2);
  gl.compileShader(vertex_shader);
  if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
    var info = gl.getShaderInfoLog(vertex_shader);
    alert("Could not compile vertex shader. \n\n" + info);
    return;
  }

  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, f_shader_2);
  gl.compileShader(fragment_shader);
  if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
    var info = gl.getShaderInfoLog(fragment_shader);
    alert("Could not compile fragment shader. \n\n" + info);
    return;
  }

  const response = await fetch('dragon_10k.obj');
  const text = await response.text();
  const data = splitObj(text);
  console.log(data);


  const program = gl.createProgram();
  gl.attachShader(program, vertex_shader);
  gl.attachShader(program, fragment_shader);
  gl.linkProgram(program); //link the program
  // use our program
  gl.useProgram(program);


  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    //if program is not linked
    var info = gl.getProgramInfoLog(program);
    alert("Could not link WebGL2 program. \n\n" + info);
    return;
  }


  const vertex_location = gl.getAttribLocation(program, "a_position"); //get the vertex position
  const colorLocation = gl.getUniformLocation(program, "color");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");

  const buffer_data = gl.createBuffer();
  const dragonvao = gl.createVertexArray();

  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;

  function drawDragon(){

    gl.bindVertexArray(dragonvao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_data); //bind the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.position), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(vertex_location); //enable attributes to use them

    gl.vertexAttribPointer(vertex_location, numComponents, type, normalize, stride, offset);

  }

  const planeBuffer = gl.createBuffer();
  const planevao = gl.createVertexArray();

  function drawPlane(){       //draw plane

    const plane = [
        -1 , 0.02 , 1 ,
      1 , 0.02, 1 ,
        -1 , 0.02 , -1 ,
      1 , 0.02 , -1
    ];



    gl.bindVertexArray(planevao);
    gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer); //bind the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(vertex_location); //enable attributes to use them
    gl.vertexAttribPointer(vertex_location, 3, type, normalize, stride, offset); //set the attributes order
}

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  //**
  var fieldOfViewRadians = degToRad(100);
  var cameraAngleRadians = degToRad(0);

  var then = 0;
  let xValue= 0;
  let yValue = 0.35;
  var radius = 0;
  let zValue = radius * 1.5 + 0.3;

  function render(now) {

    now *= 0.063;  // convert
    const deltaTime = now - then;
    then = now;


    var fPosition = [radius*30, 0, 0];

    // Clear the canvas
    gl.clearColor(1, 1, 1, 1.0);  // Background color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    drawDragon();
    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(dragonvao);

    // Set the color.
    gl.uniform4f(colorLocation, 0, 1.0, 0,1.0)

    // Compute the matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 0.01;
    var zFar = 200;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    // projectionMatrix = m4.translate(projectionMatrix, 0,0, 0.2);

    rot +=  speed*deltaTime;

    var cameraMatrix = m4.yRotation(cameraAngleRadians);

    cameraMatrix = m4.translate(cameraMatrix, 0, yValue, 0);


    var cameraPosition = [
      cameraMatrix[12] + xValue,
      cameraMatrix[13],
      cameraMatrix[14] + zValue,
    ];
    console.log(cameraMatrix)

    var up = [0, 1, 0];

    var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);


    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    // move the projection space to view space (the space in front of
    // the camera)
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
    viewProjectionMatrix = m4.yRotate(viewProjectionMatrix , degToRad(rot));

    var angle = Math.PI * 2 ;
    var x = Math.cos(angle) * radius;
    var z = Math.sin(angle) * radius;

    var matrix = m4.translate(viewProjectionMatrix, x, 0, z);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    // Draw the geometry.

    gl.drawArrays(gl.TRIANGLES, 0, data.position.length/3);

    drawPlane()
    gl.uniform4f(colorLocation, 0.9, 0.75, 0.8,1.0);   // color of plane
    gl.bindVertexArray(planevao);

    // move the projection space to view space (the space in front of
    // the camera)

    var viewProjectionMatrixPlane = m4.multiply(projectionMatrix, viewMatrix);

    var planeMatrix = m4.translate(viewProjectionMatrixPlane, x, 0, z);
    gl.uniformMatrix4fv(matrixLocation, false, planeMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, offset, 4); //draw the shape that has 4 vertices

    requestAnimationFrame(render);
  }



  function splitObj(text) {

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


  canvas.requestPointerLock = canvas.requestPointerLock ||
      canvas.mozRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
      document.mozExitPointerLock;


  canvas.onclick = function() {
    canvas.requestPointerLock();
  }

  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
  function lockChangeAlert() {
    if (document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas) {
      console.log('The pointer lock status is now locked');
      document.addEventListener("mousemove", updatePosition, false);
    } else {
      console.log('The pointer lock status is now unlocked');
      document.removeEventListener("mousemove", updatePosition, false);
    }
  }


  function updatePosition(e) {
    xValue += e.movementX * 0.001;
    yValue += e.movementY * 0.001;

  }

  window.onkeydown = function( event ) {
    String.fromCharCode(event.keyCode);
    switch( event.keyCode ) {

      case 107:
        speed *= 1.5;
        console.log("+ works")
        break;

      case 109:
        speed -= 1.5;
        console.log("- works");
        break;

      case 38:
        console.log("up arrow");
        zValue -= 0.01
        break;

      case  39:
        console.log("right arrow");
        xValue += 0.1;
        break;

      case  40:
        console.log("down arrow");
        zValue += 0.01
        break;

      case  37:
        console.log("left arrow");
        xValue -= 0.1;
        break;

      case  33:
        console.log("page up");
        yValue += 0.01;
        break;

      case  34:
        console.log("page down");
        yValue -= 0.01;
        break;
    }
  };

  requestAnimationFrame(render);
}

var m4 = {
  lookAt: function(cameraPosition, target, up) {
    var zAxis = normalize(
        subtractVectors(cameraPosition, target));
    var xAxis = normalize(cross(up, zAxis));
    var yAxis = normalize(cross(zAxis, xAxis));

    return [
      xAxis[0], xAxis[1], xAxis[2], 0,
      yAxis[0], yAxis[1], yAxis[2], 0,
      zAxis[0], zAxis[1], zAxis[2], 0,
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2],
      1,
    ];
  },
  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0,
    ];
  },

  inverse: function(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
          (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
          (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
          (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
          (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
          (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
          (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
          (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
          (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
          (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
          (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
          (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
          (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0,
      tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function(m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

};

function normalize(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}


function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]];
}