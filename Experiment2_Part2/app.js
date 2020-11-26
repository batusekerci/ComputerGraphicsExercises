"use strict";

var then = 0;
var rot = 0;
var a = 1;
var isOne = false;
var radi = 0.0;
var now = 0.1;
var theta = 0.0;
var thetaLoc;
var  ccv = true;
var speed = 100;
var cv = false;
var go = 0;
var isSpiral = false;
var isScale = false;
var turn = false;

window.onload = function() {
    init();
};

function init() {
    const canvas = document.querySelector("#glCanvas"); //get canvas element
    const gl = canvas.getContext("webgl2"); //get webgl2 from WebGL2RenderingContext
    
    if(!gl) { // if your browser does not support webgl2
        alert("WebGL2 is not working on this browser!");
        return;
    }
    
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
    
    //create program
    const program = gl.createProgram();
    gl.attachShader(program, vertex_shader); 
    gl.attachShader(program, fragment_shader); 
    gl.linkProgram(program); //link the program

    if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
         //if program is not linked
        var info = gl.getProgramInfoLog(program);
        alert("Could not link WebGL2 program. \n\n" + info);
        return;
    }
    
    const numComponents = 2;  
    const type = gl.FLOAT;    
    const normalize = false;  
    const stride = 0;                                        
    const offset = 0;        
    var scale_factor = [0.3, 0.3, 1, 1];
    let rotation = [];

    const vertex_location = gl.getAttribLocation(program, "a_position"); //get the vertex position
    const color_location = gl.getAttribLocation(program, "a_color"); //get the color position
    const uniform_Location = gl.getUniformLocation(program, "scale_factor");
    const rotationLocation = gl.getUniformLocation(program, "u_rotation");
    const radiLocation = gl.getUniformLocation(program, "radi");

    //create buffers for square

    const buffer_square = gl.createBuffer(); //create buffer for square
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_square); //bind the buffer
    /**/
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square.concat(square_color)), gl.STATIC_DRAW);
    
    /**/
    gl.clearColor(0.1, 0.8, 0.3, 1.0);  // Background color


    function draw() {
    
    gl.clear(gl.COLOR_BUFFER_BIT); // Clear the canvas before we start drawing on it.
    
    

    drawCircles(-0.5, -0.5, 0.5);
    drawCircles(-0.5, 0.5, 0.5);
    drawCircles(0.5, 0.5, 0.5);
    drawCircles(0.5, -0.5, 0.5);

    drawCircles(0.625, 0, 0.125);
    drawCircles(0, 0.625, 0.125);
    drawCircles(-0.625, 0, 0.125);
    drawCircles(0, -0.625, 0.125);
    gl.uniform1f(radiLocation, 0);    
    drawSquare()
    gl.uniform1f(radiLocation, radi);    
    drawCircles(0.5, -0.5, 0.125);
    drawCircles(-0.5, 0.5, 0.125);
    drawCircles(-0.5, -0.5, 0.125);
    drawCircles(0.5, 0.5, 0.125);

    }


    //Vertex Array Object
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    
    
    
    gl.useProgram(program); //use the program
    gl.bindVertexArray(vao);
    
    
    
    
    //draw circle
    function drawCircles(centerx ,centery,radius ) {
    let i;
        let circle = [];
        for(i = 0; i < 360; i++) {
        circle = circle.concat([radius*Math.cos(i*radian) + centerx, radius*Math.sin(i*radian) + centery]);
    }

    const color_c = [255, 0, 0];

        let circle_color = [];
        for(i = 0; i < 360; i++){
        circle_color = circle_color.concat(color_c);
    }  
    const buffer_circle = gl.createBuffer(); //create buffer for circle
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_circle); //bind the buffer
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW); //buffer data for circle vertices
    /**/
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle.concat(circle_color)), gl.STATIC_DRAW);
    /**/
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_circle); //bind the buffer of triangle
    gl.vertexAttribPointer(vertex_location, numComponents, type, normalize, stride, offset); //set the attributes order 
                                                                                             //and data in it
    gl.enableVertexAttribArray(vertex_location); //enable attributes to use them
    /**/
    gl.enableVertexAttribArray(color_location);
    gl.vertexAttribPointer(color_location, 3, type, normalize, stride, circle.length * 4);
    /**/
    gl.drawArrays(gl.TRIANGLE_FAN, offset, 360); //draw the shape that has 3 vertices
    

}

    function printSineAndCosineForAnAngle(angleInDegrees) {
        var angleInRadians = angleInDegrees * Math.PI / 180;
        rotation[0] = Math.sin(angleInRadians);
        rotation[1] = Math.cos(angleInRadians);
        
  }




  // Draw the scene repeatedly
  function render(now) {
    
    now *= 0.063;  // convert  , controls speed
    var deltaTime = now - then;
    then = now;
    
    if(ccv ){
    rot -= a*deltaTime;
    go=1;
    }

    else if(cv){
        rot += a*deltaTime;
        go =2;
        }

    else{
        rot += 0;
        }

        
    if (isOne){
        rot = 0;
        
    }    
    if(isScale){
        console.log("Scale begins");
        console.log(scale_factor[0]);
        
        if(scale_factor[0] < 0.45 && turn == true){
            scale_factor[0] += 0.005 ;
            scale_factor[1] += 0.005 ;
            if(scale_factor[0] > 0.45 ){turn = false;}
        }
        else if(scale_factor[0] > 0.15 && turn == false){
            
            scale_factor[0] -= 0.005 ;
            scale_factor[1] -= 0.005 ;
            console.log(scale_factor);
            if(scale_factor[0] < 0.15 ){turn = true;}
        }

        
              
    }
    
    printSineAndCosineForAnAngle(rot);
    gl.uniform4fv(uniform_Location, scale_factor);
    gl.uniform2fv(rotationLocation, rotation);
    
    draw();
    
    
    requestAnimationFrame(render);
}

requestAnimationFrame(render);



function drawSquare(){
//draw square
gl.bindBuffer(gl.ARRAY_BUFFER, buffer_square); //bind the buffer of square
gl.vertexAttribPointer(vertex_location, numComponents, type, normalize, stride, offset); //set the attributes order 
                                                                                         //and data in it
gl.enableVertexAttribArray(vertex_location); //enable attributes to use them
/**/
gl.enableVertexAttribArray(color_location);
gl.vertexAttribPointer(color_location, 3, type, normalize, stride, square.length * 4);
/**/
gl.drawArrays(gl.TRIANGLE_STRIP, offset, 4); //draw the shape that has 4 vertices
}







document.getElementById("StartSpin").onclick = function (event) {
    
    if(go=== 1){
        ccv = true;
    }
    else if(go === 2){cv = true;}
    
};

document.getElementById("StopSpin").onclick = function (event) {
    ccv = false;
    cv= false;
};


document.getElementById("StartScale").onclick = function (event) {
    isScale = true;
};

document.getElementById("StopScale").onclick = function (event) {
    
    isScale = false;

};

document.getElementById("StartSpiral").onclick = function (event) {
    isSpiral = true;
};

document.getElementById("StopSpiral").onclick = function (event) {
    
    isSpiral = false;

};



}

function Control1() {
    var x = document.getElementById("Control1").value;
 
    switch(x) {
    case "0":
        ccv = false;
        cv = false;
      break;

   case "1":
    ccv = true;
    
      break;

   case "2":
    a = 1.3;
      break;

    
    case "3":
    a = 1.5;
      break;

    
    case "4":
    a = 1.7;
      break;

    
    case "5":
    a = 1.9;
      break;

    case "6":
    a = 2.2;
      break;
    
     case "7":
    a = 2.7;
      break;

      case "8":
    a = 3.1;
      break;

      case "9":
    a = 3.3;
      break;

      case "10":
    a = 3.5;
      break;

      case "-1":
    cv = true;
    
    
      break;

   case "-2":
    a = 1.3;
    
      break;

    
    case "-3":
    a = 1.5;
    
      break;

    
    case "-4":
    a = 1.7;
    
      break;

    
    case "-5":
    a = 1.9;
    
      break;

    case "-6":
    a = 2.2;
    
      break;

    case "-7":
    a = 2.7;
    
      break;

      case "-8":
    a = 3.1;
    
      break;

      case "-9":
    a = 3.3;
    
      break;

      case "-10":
    a = 3.5;
    
      break;
    }
}