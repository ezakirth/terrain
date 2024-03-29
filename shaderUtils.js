/**
 * @fileoverview shaderUtils.js - Shader setup and functions
 * @author Xavier de Boysson
 */

"use strict";
function createShader(gl, type, source)
{
  var shader = gl.createShader(type);
  if (shader == null)
  {
    console.error('Error creating the shader with shader type: ' + type);
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled)
  {
    var info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    console.error('Error while compiling the shader ' + info);
  }
  return shader;
}

function createShaderFromURI(gl, type, uri, callback)
{
  var xhr = new XMLHttpRequest();
  xhr.open('GET', uri, true);
  xhr.onreadystatechange = function(e)
  {
    if (xhr.readyState == 4) {
      if (true)//xhr.status == 200)
      {
        callback(createShader(gl, type, xhr.responseText));
      }
      else
      {
        console.error(xhr, 'There was an error in the page load');
        callback(null);
      }
    }
  };
  xhr.send(null);
}

function createProgramFromShaders(gl, vs, fs)
{
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked)
    {
      console.error('Error linking the shader: ' + gl.getProgramInfoLog(program));
    }
    return program;
}

function createProgramFromURIs(gl, options)
{
  var vsURI = options.vsURI,
      fsURI = options.fsURI,
      onComplete = options.onComplete;

  createShaderFromURI(gl, gl.VERTEX_SHADER, vsURI, function(vsShader)
  {
    createShaderFromURI(gl, gl.FRAGMENT_SHADER, fsURI, function(fsShader)
    {
      onComplete(createProgramFromShaders(gl, vsShader, fsShader));
    });
  });
}

function createProgramsFromURIs(gl, options)
{
  var len = options.programs.length,
      programs = {},
      callback = function(name, program)
      {
        len--;

        programs[name] = program;

        if (len <= 0)
        {
          options.onComplete(programs);
        }
      };

  options.programs.forEach(function (opt)
  {
    createProgramFromURIs(gl,
    {
      vsURI: opt.vsURI,
      fsURI: opt.fsURI,
      onComplete: function(program)
      {
        callback(opt.name, program);
      }
    });
  });
}


