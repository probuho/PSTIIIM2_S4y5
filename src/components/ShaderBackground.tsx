import React, { useEffect, useRef } from "react";

// Componente que renderiza el canvas con la animación shader
const ShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Adaptación del shader para React (solo canvas, sin controles ni editor)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animationId: number;
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    const startTime = Date.now();

    // Vertex shader
    const vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;
    // Fragment shader (espacio exterior + estrellas)
    const fragmentSrc = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}
void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    // Mezcla de color espacial: azul oscuro, violeta, cian
    col = mix(
      col,
      vec3(
        bg * 0.20 + bg * 0.10,   // Rojo: violeta
        bg * 0.08 + bg * 0.15,   // Verde: bajo, azul profundo
        bg * 0.35 + bg * 0.60    // Azul: dominante
      ),
      d
    );
  }
  O=vec4(col,1); 
}`;
    // Cuadrado para cubrir todo el canvas
    const vertices = new Float32Array([
      -1, 1, -1, -1, 1, 1, 1, -1
    ]);

    function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error(gl.getShaderInfoLog(shader) || "Shader error");
      }
      return shader;
    }

    function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
      const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.deleteProgram(prog);
        throw new Error(gl.getProgramInfoLog(prog) || "Program error");
      }
      return prog;
    }

    function resizeCanvas() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas!.parentElement ? canvas!.parentElement.offsetWidth : window.innerWidth;
      const height = canvas!.parentElement ? canvas!.parentElement.offsetHeight : window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      gl?.viewport(0, 0, canvas.width, canvas.height);
    }

    try {
      gl = canvas.getContext("webgl2");
      if (!gl) throw new Error("WebGL2 no soportado");
      program = createProgram(gl, vertexSrc, fragmentSrc);
      const position = gl.getAttribLocation(program, "position");
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      // Animación
      function render() {
        if (!gl || !program) return;
        gl.useProgram(program);
        // Uniforms
        const resolution = gl.getUniformLocation(program, "resolution");
        const time = gl.getUniformLocation(program, "time");
        gl.uniform2f(resolution, canvas!.width, canvas!.height);
        gl.uniform1f(time, (Date.now() - startTime) * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationId = requestAnimationFrame(render);
      }
      render();
    } catch {
      // Si hay error, no renderiza nada
      // Opcional: puedes mostrar un mensaje de error
    }
    // Limpieza al desmontar
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      // Limpieza de WebGL
      if (gl && program) {
        gl.deleteProgram(program);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="shader-canvas"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "none",
        borderRadius: "inherit"
      }}
    />
  );
};

export default ShaderBackground; 