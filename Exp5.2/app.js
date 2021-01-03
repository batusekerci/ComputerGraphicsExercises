"use strict";

var rot = 0;
var speed = 2;
var islocked = true;
var isPressed = false;
var numVertices  = 36;

var modelView, projection;
var pointsArray = [];
var normalsArray = [];


var headLight = true;
var perPixel = false;
var perVertex = true;

var vertices = [
  vec4( -0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5,  0.5,  0.5, 1.0 ),
  vec4( 0.5,  0.5,  0.5, 1.0 ),
  vec4( 0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( -0.5,  0.5, -0.5, 1.0 ),
  vec4( 0.5,  0.5, -0.5, 1.0 ),
  vec4( 0.5, -0.5, -0.5, 1.0 )
];

function quad(a, b, c, d) {

  var t1 = subtract(vertices[b], vertices[a]);
  var t2 = subtract(vertices[c], vertices[b]);
  var normal = cross(t1, t2);
  var normal = vec3(normal);


  pointsArray.push(vertices[a]);
  normalsArray.push(normal);
  pointsArray.push(vertices[b]);
  normalsArray.push(normal);
  pointsArray.push(vertices[c]);
  normalsArray.push(normal);
  pointsArray.push(vertices[a]);
  normalsArray.push(normal);
  pointsArray.push(vertices[c]);
  normalsArray.push(normal);
  pointsArray.push(vertices[d]);
  normalsArray.push(normal);
}

function colorCube()
{
  quad( 1, 0, 3, 2 );
  quad( 2, 3, 7, 6 );
  quad( 3, 0, 4, 7 );
  quad( 6, 5, 1, 2 );
  quad( 4, 5, 6, 7 );
  quad( 5, 4, 0, 1 );
}


var theta =[0, 0, 0];

var thetaLoc;

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

  colorCube()

  const vertex_location = gl.getAttribLocation(program, "a_position"); //get the vertex position
  const colorLocation = gl.getUniformLocation(program, "color");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");

  const cubeVao = gl.createVertexArray();
  gl.bindVertexArray(cubeVao );


  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;

  var textureCube = gl.createTexture();


  var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
  // create the texcoord buffer, make it the current ARRAY_BUFFER and copy in the texcoord values


  var texcoordBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);

  // Turn on the attribute
    gl.enableVertexAttribArray(texcoordAttributeLocation);


    var size = 2;          // 2 components per iteration

    gl.vertexAttribPointer(
        texcoordAttributeLocation, size, type, normalize, stride, offset);




  //  Load the image asynchronously
    var imageCube = new Image();
    imageCube.src = "texture_cube.png";
    imageCube.addEventListener('load', function () {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, textureCube);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageCube);
      gl.generateMipmap(gl.TEXTURE_2D);
    });


    //  Load the second image asynchronously
    var image = new Image();
    image.src = "texture_ground.bmp";
    image.addEventListener('load', function () {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, textureGround);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
    });



  var vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
  // console.log(pointsArray)
  gl.vertexAttribPointer(vertex_location, 4, type, normalize, stride, offset);
  gl.enableVertexAttribArray(vertex_location); //enable attributes to use them


  const planeBuffer = gl.createBuffer();
  const planevao = gl.createVertexArray();

  var textureGround = gl.createTexture();
  var texcoordBuffer2 = gl.createBuffer();




  function drawPlane(){       //draw plane

    const plane = [
        -45 , -0.51 , 45 ,
      45 , -0.51, 45 ,
        -45 , -0.51 , -45 ,
      45 , -0.51 , -45
    ];

    gl.bindVertexArray(planevao);


    gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer); //bind the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(vertex_location); //enable attributes to use them
    gl.vertexAttribPointer(vertex_location, 3, type, normalize, stride, offset); //set the attributes order
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer2);
// Turn on the attribute
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    setTexcoordsPlane(gl);
    gl.vertexAttribPointer(
        texcoordAttributeLocation, 2, type, normalize, stride, offset);
  }


  function degToRad(d) {
    return d * Math.PI / 180;
  }

  //**
  var fieldOfViewRadians = degToRad(100);
  var cameraAngleX = 303;
  var cameraAngleY = 13;
  var then = 0;
  let xValue= 10;
  let yValue = 8;
  var radius = 0;
  let zValue = radius * 1.5 + 10;

  function render(now) {

    now *= 0.063;  // convert
    const deltaTime = now - then;
    then = now;

    resize(gl.canvas);


    // Clear the canvas
    gl.clearColor(1, 1, 1, 1.0);  // Background color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);


    rot +=  speed * deltaTime;
    // Set the color.
    gl.uniform4f(colorLocation, 0, 1.0, 0,1.0);



    // Compute the matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 0.01;
    var zFar = 200;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    var cameraMatrix = m4.translation(xValue, yValue, zValue);

    cameraMatrix = m4.yRotate(cameraMatrix , degToRad(cameraAngleY));

    cameraMatrix = m4.xRotate(cameraMatrix, degToRad(cameraAngleX));



    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverseMatrix(cameraMatrix);


    // move the projection space to view space (the space in front of
    // the camera)
    var viewProjectionMatrix = m4.matrixMultiply(projectionMatrix, viewMatrix);


    var angle = Math.PI * 2 ;
    var x = Math.cos(angle) * radius;
    var z = Math.sin(angle) * radius;

    var matrix = m4.translate(viewProjectionMatrix, x, 0, z);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);


    // Draw the Plane

    gl.viewport(0,0, canvas.clientWidth , canvas.clientHeight);
    gl.bindTexture(gl.TEXTURE_2D, textureGround);



    drawPlane()

    gl.bindVertexArray(planevao);

    // move the projection space to view space (the space in front of
    // the camera)

    var viewProjectionMatrixPlane = m4.matrixMultiply(projectionMatrix, viewMatrix);

    var planeMatrix = m4.translate(viewProjectionMatrixPlane, x, 0, z);
    gl.uniformMatrix4fv(matrixLocation, false, planeMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, offset, 4); //draw the shape that has 4 vertices

    // Draw the Cubes


    let spacing = 3;
    var viewProjectionMatrixCube = m4.matrixMultiply(projectionMatrix, viewMatrix);
    gl.bindVertexArray(cubeVao);
    //
    viewProjectionMatrixCube = m4.translate(viewProjectionMatrixCube, -40 , 0 ,-40)
    gl.bindTexture(gl.TEXTURE_2D, textureCube);
    gl.uniformMatrix4fv(matrixLocation, false, viewProjectionMatrixCube);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    let viewProjectionMatrixCubeManip = viewProjectionMatrixCube
    var viewProjectionMatrixCubeY= viewProjectionMatrixCube;

    for (var i= 0 ; i< 24 ; i++){


      viewProjectionMatrixCubeManip = m4.translate(viewProjectionMatrixCubeManip, spacing , 0 ,0)
      gl.uniformMatrix4fv(matrixLocation, false, viewProjectionMatrixCubeManip);


      gl.bindTexture(gl.TEXTURE_2D, textureCube);

      gl.drawArrays( gl.TRIANGLES, 0, numVertices );

      for (var j= 0 ; j< 24 ; j++){
        viewProjectionMatrixCubeY = m4.translate(viewProjectionMatrixCubeY, 0 , 0 ,spacing)
        gl.uniformMatrix4fv(matrixLocation, false, viewProjectionMatrixCubeY);
        gl.bindTexture(gl.TEXTURE_2D, textureCube);

        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
      }

      viewProjectionMatrixCubeY= viewProjectionMatrixCubeManip;
    }
    for (var j= 0 ; j< 24 ; j++){
      viewProjectionMatrixCubeY = m4.translate(viewProjectionMatrixCubeY, 0 , 0 ,spacing)
      gl.uniformMatrix4fv(matrixLocation, false, viewProjectionMatrixCubeY);
      gl.bindTexture(gl.TEXTURE_2D, textureCube);

      gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    }


    // Recurse
    requestAnimationFrame(render);
  }


// mouse controls


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
    cameraAngleY -= e.movementX * 0.1;
    cameraAngleX -= e.movementY * 0.1;

    console.log(cameraAngleY , cameraAngleX)
  }

//----------------


// Key Controls

  window.onkeydown = function( event ) {  // keyboard controls
    String.fromCharCode(event.keyCode);
    switch( event.keyCode ) {
      case 69 :
        if(!isPressed)
          canvas.requestPointerLock();
        isPressed = !isPressed
        break;
      case 79:
        headLight = !headLight;
        console.log("O works")
        break;

      case 80:
        perPixel = !perPixel;
        perVertex = !perVertex;
        console.log("P works");
        break;

      case 38:
        console.log("up arrow");
        zValue -= 1
        break;

      case  39:
        console.log("right arrow");
        xValue += 1;
        break;

      case  40:
        console.log("down arrow");
        zValue += 1
        break;

      case  37:
        console.log("left arrow");
        xValue -= 1;
        break;

      case  33:
        console.log("page up");
        yValue += 1;
        break;

      case  34:
        console.log("page down");
        yValue -= 1;
        break;
    }
  };

// -----------------



  requestAnimationFrame(render);

}



// helper functions and variables



var m4 = {

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

  inverseMatrix: function(m) {
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

  matrixMultiply: function(a, b) {
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


  translate: function(m, tx, ty, tz) {
    return m4.matrixMultiply(m, m4.translation(tx, ty, tz));
  },


  yRotate: function(m, angleInRadians) {
    return m4.matrixMultiply(m, m4.yRotation(angleInRadians));
  },

  xRotate: function(m, angleInRadians) {
    return m4.matrixMultiply(m, m4.xRotation(angleInRadians));
  },


};




function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width  !== displayWidth ||
      canvas.height !== displayHeight) {

    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

function setTexcoords(gl) {                        // Function for texturing all 6 planes
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([

        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

      ]),
      gl.STATIC_DRAW);
}

function setTexcoordsPlane(gl) {                        // Function for texturing all 6 planes
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([


        0, 0,
        1, 0,
        1, 1,
        0, 1,



      ]),
      gl.STATIC_DRAW);
}

//----------------------------------------------------------------------------
//
//  Helper functions
//

function _argumentsToArray( args )
{
  return [].concat.apply( [], Array.prototype.slice.apply(args) );
}

//----------------------------------------------------------------------------


//----------------------------------------------------------------------------
//
//  Vector Constructors
//


function vec3()
{
  var result = _argumentsToArray( arguments );

  switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
  }

  return result.splice( 0, 3 );
}

function vec4()
{
  var result = _argumentsToArray( arguments );

  switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    case 3: result.push( 1.0 );
  }

  return result.splice( 0, 4 );
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//


//----------------------------------------------------------------------------

function subtract( u, v )
{
  var result = [];

  if ( u.matrix && v.matrix ) {
    if ( u.length != v.length ) {
      throw "subtract(): trying to subtract matrices" +
      " of different dimensions";
    }

    for ( var i = 0; i < u.length; ++i ) {
      if ( u[i].length != v[i].length ) {
        throw "subtract(): trying to subtact matrices" +
        " of different dimensions";
      }
      result.push( [] );
      for ( var j = 0; j < u[i].length; ++j ) {
        result[i].push( u[i][j] - v[i][j] );
      }
    }

    result.matrix = true;

    return result;
  }
  else if ( u.matrix && !v.matrix || !u.matrix && v.matrix ) {
    throw "subtact(): trying to subtact  matrix and non-matrix variables";
  }
  else {
    if ( u.length != v.length ) {
      throw "subtract(): vectors are not the same length";
    }

    for ( var i = 0; i < u.length; ++i ) {
      result.push( u[i] - v[i] );
    }

    return result;
  }
}


//----------------------------------------------------------------------------
//
//  Matrix Functions
//

function transpose( m )
{
  if ( !m.matrix ) {
    return "transpose(): trying to transpose a non-matrix";
  }

  var result = [];
  for ( var i = 0; i < m.length; ++i ) {
    result.push( [] );
    for ( var j = 0; j < m[i].length; ++j ) {
      result[i].push( m[j][i] );
    }
  }

  result.matrix = true;

  return result;
}

//----------------------------------------------------------------------------
//
//  Vector Functions
//




//----------------------------------------------------------------------------

function cross( u, v )
{
  if ( !Array.isArray(u) || u.length < 3 ) {
    throw "cross(): first argument is not a vector of at least 3";
  }

  if ( !Array.isArray(v) || v.length < 3 ) {
    throw "cross(): second argument is not a vector of at least 3";
  }

  var result = [
    u[1]*v[2] - u[2]*v[1],
    u[2]*v[0] - u[0]*v[2],
    u[0]*v[1] - u[1]*v[0]
  ];

  return result;
}

//----------------------------------------------------------------------------







function flatten( v )
{
  if ( v.matrix === true ) {
    v = transpose( v );
  }

  var n = v.length;
  var elemsAreArrays = false;

  if ( Array.isArray(v[0]) ) {
    elemsAreArrays = true;
    n *= v[0].length;
  }

  var floats = new Float32Array( n );

  if ( elemsAreArrays ) {
    var idx = 0;
    for ( var i = 0; i < v.length; ++i ) {
      for ( var j = 0; j < v[i].length; ++j ) {
        floats[idx++] = v[i][j];
      }
    }
  }
  else {
    for ( var i = 0; i < v.length; ++i ) {
      floats[i] = v[i];
    }
  }

  return floats;
}

//----------------------------------------------------------------------------











