/**
 * @fileoverview stick.js - stick setup and functions
 * @author Xavier de Boysson
 */

"use strict";
function Stick(prog, buffer, pass)
{
    this.program = prog;
    this.init();
    gl.useProgram(this.program);
    this.aVertexPosition = gl.getAttribLocation(this.program, "aVertexPosition");
    this.aTextureCoordinates = gl.getAttribLocation(this.program, "aTextureCoordinates");
    this.uTexture = gl.getUniformLocation(this.program, "uTexture");
    gl.uniform1i(this.uTexture, 0);
    this.uMVPMatrix = gl.getUniformLocation(this.program, "uMVPMatrix");

    textures.loadTextureData("stickTexture", "stick.png");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.stickTexture);

}

Stick.prototype.render = function()
{
    gl.useProgram(this.program);

    gl.enableVertexAttribArray(this.aVertexPosition);
    gl.enableVertexAttribArray(this.aTextureCoordinates);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.stickTexture);
    gl.uniform1i(this.uTexture, 0);

		mat4.multiply(mvpMatrix, oMatrix, mvMatrix);
		gl.uniformMatrix4fv(this.uMVPMatrix, false, mvpMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.vertexAttribPointer(this.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);
    gl.vertexAttribPointer(this.aTextureCoordinates, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

    gl.drawElements(gl.TRIANGLES, this.indices.length , gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(this.aVertexPosition);
    gl.disableVertexAttribArray(this.aTextureCoordinates);
}

Stick.prototype.init = function()
{

  this.vertices = new Float32Array([
    -1.0, -1.0, -1.0, // NZ
    -1.0,  100.0, -1.0,
     100.0,  100.0, -1.0,
     100.0, -1.0, -1.0
  ]);

  this.textureCoords = new Float32Array([
    0.01, 0.01, // NZ
    0.01,  0.99,
     0.99,  0.99,
     0.99, 0.01
  ]);

  this.indices = new Uint16Array([
     2,  1,  0,
     3,  2,  0
  ]);

    this.verticesBuffer = gl.createBuffer();
    this.textureCoordsBuffer = gl.createBuffer();
    this.indicesBuffer = gl.createBuffer();


    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.textureCoords, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

}
