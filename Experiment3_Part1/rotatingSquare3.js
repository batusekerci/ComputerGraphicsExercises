"use strict";

var gl;

var theta = 0.0;
var thetaLoc;

var speed = 100;
var direction = true;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vertices = [
        vec2(  0,  1 ),
        vec2(  -0.86602540378,  0 ),
        vec2( 0.86602540378,  0 ),
        
    ];

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition);
//-------------------------

var changeableColor = [
    Math.random(), Math.random(), Math.random(), 1,
    Math.random(), Math.random(), Math.random(), 1,
    Math.random(), Math.random(), Math.random(), 1,
    
];

    var bufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(changeableColor), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var changeableColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( changeableColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(changeableColor);

    thetaLoc = gl.getUniformLocation(program, "theta");

    var a =0;
    var b= 0;
    var c= 0;

    function setColor() 
    {

       
    var changeableColor = [
        Math.random(), Math.random(), Math.random(), 1,
        Math.random(), Math.random(), Math.random(), 1,
        Math.random(), Math.random(), Math.random(), 1,
        
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(changeableColor), gl.STATIC_DRAW);    
    
}
    
    setColor() 
    // Initialize event handlers
    
    
    document.getElementById("Toggle").onclick = function (event) {
        direction = !direction;
    };
    document.getElementById("Speed Up").onclick = function (event) {
        speed /= 2.0;
    };
    document.getElementById("Slow Down").onclick = function (event) {
        
        speed *= 2.0;

    };
    document.getElementById("Change").onclick = function (event) {
        
        setColor() 
      
    };

    
    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
          case '1':
            direction = !direction;
            break;

          case '2':
            speed /= 2.0;
            break;

          case '3':
            speed *= 2.0;
            break;
        }
    };


    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += (direction ? 0.1 : -0.1);
    gl.uniform1f(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    setTimeout(
        function () {
            requestAnimFrame( render );
        },
        speed
    );
}
