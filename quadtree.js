/**
 * @fileoverview quadtree.js - quadtree setup and functions
 * @author Xavier de Boysson
 */

"use strict";
function Quadtree(nodeList, xmin, ymin, xmax, ymax, d)
{
	this.xmin = xmin;
	this.ymin = ymin;
	this.xmax = xmax;
	this.ymax = ymax;
	this.d = d;
    this.lod = Math.pow(2,d) * viewPort;
    this.depth = 4-d;
    this.chunk = null;
    this.children = null;
    if (d > 0)
    {
        d--;
        var xmid = (xmin + xmax)/2;
        var ymid = (ymin + ymax)/2;
        this.children = [
            new Quadtree(nodeList, xmin, ymin, xmid, ymid, d),
            new Quadtree(nodeList, xmin, ymid, xmid, ymax, d),
            new Quadtree(nodeList, xmid, ymid, xmax, ymax, d),
            new Quadtree(nodeList, xmid, ymin, xmax, ymid, d)
        ];
    }

	nodeList.push(this);
//	((4^depth)-1)*4/3

}



Quadtree.prototype.getScreenError = function()
{
    var a = this.chunk.boundingSphere;
    var b = input.pos;
    var d = Math.sqrt((a.x + b.x)*(a.x + b.x) + (a.y + b.y)*(a.y + b.y) + (a.z + b.z)*(a.z + b.z))-a.r;
    if (d<0) d = 0;
    return this.lod/d;
}

Quadtree.prototype.renderChunk = function()
{
    var chunk = this.chunk;
    if (chunk && sphereInFrustum(frustum, chunk.boundingSphere))
    {
        var child = this.children;

        var chunkScreenError = this.getScreenError();

        if (chunkScreenError <= 32 || !child)
        {
            var n = chunkScreenError/16 - 1;
            if (n>1) n = 1;
            if (n<0) n = 0;

            if (this.depth == 0)
                n = 1;

            if (!input.vertexMorphing)
                n = 1;

            gl.uniform1f(terrain.uMorph, n);

            cnt++;

            gl.bindBuffer(gl.ARRAY_BUFFER, chunk.interleavedArrayBuffer);
            gl.vertexAttribPointer(terrain.aVertexPosition, 4, gl.FLOAT, false, 6*4, 0);
            gl.vertexAttribPointer(terrain.aTextureCoordinates, 2, gl.FLOAT, false, 6*4, 4*4);

            if (input.wireframe)
                gl.drawElements(gl.LINES, terrain.indicesLength, gl.UNSIGNED_SHORT, 0);
            else
                gl.drawElements(gl.TRIANGLES, terrain.indicesLength , gl.UNSIGNED_SHORT, 0);


        }
        else
        {
            if (child)
            {
                child[0].renderChunk();
                child[1].renderChunk();
                child[2].renderChunk();
                child[3].renderChunk();
            }
        }

    }
}


