WebGL 示例程序=============## 程序描述    关于WebGL的学习示例和参考程序。## 文件说明- spheres.html : 旋转运动的3D球体- squares.html : 旋转运动的正方形- triangles.html : 旋转运动的三角形- geometries.html : 旋转的几何体## 使用的库- webgl-utils.js- m3.js- m4.js- primitives.js- texture-utils.js- chroma.min.js## WebGL程序的结构#### At Init time- create all shaders and programs and look up locations- create buffers and upload vertex data- create textures and upload texture data#### At Render Time- clear and set the viewport and other global state (enable depth testing, turn on culling, etc..)+ For each thing you want to draw     - call gl.useProgram for the program needed to draw.     + setup attributes for the thing you want to draw      - for each attribute call gl.bindBuffer, gl.vertexAttribPointer, gl.enableVertexAttribArray   + setup uniforms for the thing you want to draw      - call gl.uniformXXX for each uniform      - call gl.activeTexture and gl.bindTexture to assign textures to texture units.   - call gl.drawArrays or gl.drawElements    