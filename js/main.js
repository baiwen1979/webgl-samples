/** * Created by xiaobai on 2017/6/9. */"use strict";function updateFPS(deltaTime) {    var fpsDiv = document.getElementById('fps');    fpsDiv.innerHTML = "FPS:" + Math.floor(1000.0 / deltaTime);}function main() {  var canvas = document.getElementById('canvas');  var gl = canvas.getContext('webgl');  if (!gl) {      return;  }    // 创建球体对象的缓冲区    var buffers = primitives.createSphereBuffers(gl, 10, 48, 24);    // 根据着色器脚本创建GLSL程序    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);    // 创建uniform变量的设置器    var uniformSetters = webglUtils.createUniformSetters(gl, program);    // 创建attribute变量的设置器    var attribSetters  = webglUtils.createAttributeSetters(gl, program);    // 定义attribute变量及其对应的缓冲区对象    var attribs = {        a_position: { buffer: buffers.position, numComponents: 3, },        a_normal:   { buffer: buffers.normal,   numComponents: 3, },        a_texcoord: { buffer: buffers.texcoord, numComponents: 2, },    };    // 角度转化为弧度    function degToRad(d) {        return d * Math.PI / 180;    }    // 摄像机角度    var cameraAngleRadians = degToRad(0);    // 视野    var fieldOfViewRadians = degToRad(60);    // 摄像机高度    var cameraHeight = 50;    // 对于所有对象取值相同的uniform变量    var uniformsThatAreTheSameForAllObjects = {        u_lightWorldPos:         [-50, 30, 100], //灯光的世界坐标        u_viewInverse:           m4.identity(),  //视图反转矩阵        u_lightColor:            [1, 1, 1, 1],   //灯光颜色    };    // 特定于每个对象的uniform变量    var uniformsThatAreComputedForEachObject = {        u_worldViewProjection:   m4.identity(),  //世界视图投影矩阵        u_world:                 m4.identity(),  //世界矩阵        u_worldInverseTranspose: m4.identity(),  //世界反转矩阵的转置    };    // 生成min到max之间的随机数    var rand = function(min, max) {        if (max === undefined) {            max = min;            min = 0;        }        return min + Math.random() * (max - min);    };    // 生成0～range之间的随机整数    var randInt = function(range) {        return Math.floor(Math.random() * range);    };    // 纹理对象    var textures = [        textureUtils.makeStripeTexture(gl, { color1: "#FFF", color2: "#F00", }), //条状纹理        textureUtils.makeCheckerTexture(gl, { color1: "#FFF", color2: "#0F0", }), //棋盘状纹理        textureUtils.makeCircleTexture(gl, { color1: "#FFF", color2: "#00F", }), //圆形纹理    ];    var objects = []; // 对象(球体）数组    var numObjects = 100; // 对象（球体）个数    var baseColor = rand(240); // 对象（球体）的基本色    for (var ii = 0; ii < numObjects; ++ii) {        objects.push({            radius: rand(150), // 球体旋转半径（随机）            xRotation: rand(Math.PI * 2), // 绕X轴的旋转角度            yRotation: rand(Math.PI), // 绕Y轴的旋转角度            materialUniforms: {                u_colorMult: chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(), // HSV颜色                u_diffuse: textures[randInt(textures.length)], // 漫反射纹理（随机选择）                u_specular: [1, 1, 1, 1], // 高光颜色                u_shininess: rand(500), // 光泽度                u_specularFactor: rand(1), // 反射因子            },        });    }    requestAnimationFrame(drawScene); // 开始动画    var last = 0;    // 绘制场景    function drawScene(time) {        var deltaTime = time - last;        last = time;        time = time * 0.0001 + 5;        // 将画布的实际大小重置为显示大小        webglUtils.resizeCanvasToDisplaySize(gl.canvas);        // 设置WebGL视口范围（大小），即告诉WebGL如何将裁剪空间转化为像素空间        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);        // 清除颜色和深度缓冲区        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);        // 启用背面剔除操作        gl.enable(gl.CULL_FACE);        // 启用深度测试        gl.enable(gl.DEPTH_TEST);        // 计算投影矩阵        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight; // 计算宽高比        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000); // 使用透视投影矩阵        // 计算摄像机矩阵        var cameraPosition = [0, 0, 100]; // 摄像机的位置        var target = [0, 0, 0]; // 摄像机目标        var up = [0, 1, 0]; // 摄像机上部        var cameraMatrix = m4.lookAt(cameraPosition, target, up, uniformsThatAreTheSameForAllObjects.u_viewInverse);        // 反转摄像机矩阵得到视图矩阵.        var viewMatrix = m4.inverse(cameraMatrix);        // 计算视图投影矩阵        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);        // 使用着色器程序        gl.useProgram(program);        // 设置着色器中所有的attribute变量的值.        webglUtils.setAttributes(attribSetters, attribs);        // 绑定顶点缓冲区.        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);        // 设置着色器中所有对象都相同的uniform变量的值.        webglUtils.setUniforms(uniformSetters, uniformsThatAreTheSameForAllObjects);        // 绘制所有（球体）对象        objects.forEach(function(object) {            // 根据当前时间对每个对象绕X，Y轴进行旋转，并进行移动，得到其世界矩阵.            var worldMatrix = m4.xRotation(object.xRotation * time); // 绕X轴旋转            worldMatrix = m4.yRotate(worldMatrix, object.yRotation * time); // 绕Y轴旋转            worldMatrix = m4.translate(worldMatrix, 0, 0, object.radius); //沿Z轴移动其半径大小的距离            uniformsThatAreComputedForEachObject.u_world = worldMatrix; //存储世界矩阵到每个对象中            // 计算每个对象的世界视图投影矩阵及其逆矩阵的转置矩阵.            m4.multiply(viewProjectionMatrix, worldMatrix, uniformsThatAreComputedForEachObject.u_worldViewProjection);            m4.transpose(m4.inverse(worldMatrix), uniformsThatAreComputedForEachObject.u_worldInverseTranspose);            // 使用计算结果设置着色器中用于对象变换的uniform变量            webglUtils.setUniforms(uniformSetters, uniformsThatAreComputedForEachObject);            // 设置着色器中用于材质属性的uniform变量.            webglUtils.setUniforms(uniformSetters, object.materialUniforms);            // 绘制元素.            gl.drawElements(gl.TRIANGLES, buffers.numElements, gl.UNSIGNED_SHORT, 0);        });        //显示FPS        updateFPS(deltaTime);        //请求下一帧动画        requestAnimationFrame(drawScene);    }}main();