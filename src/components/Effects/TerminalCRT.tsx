import { useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSystemStore } from '../../store/useSystem';
import styles from '../../styles/components/terminal.module.css';

const VERT = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  uniform vec2 u_res;
  uniform float u_time;

  vec2 warp(vec2 uv) {
    vec2 c = uv - 0.5;
    float r2 = dot(c, c);
    return c * (1.0 + 0.06 * r2) + 0.5;
  }

  void main() {
    vec2 uv = warp(gl_FragCoord.xy / u_res);
    vec2 vc = uv - 0.5;

    float scanline = 1.0 - 0.07 * smoothstep(0.2, 0.8,
        abs(sin(uv.y * u_res.y * 3.14159)));

    float vignette = 1.0 - 0.3 * dot(vc, vc);

    float glow = 0.006 * (0.5 + 0.5 * sin(u_time * 0.7));

    float brightness = scanline * vignette + glow;
    brightness = clamp(brightness, 0.0, 1.0);

    gl_FragColor = vec4(brightness, brightness, brightness, 1.0);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vsSrc: string,
  fsSrc: string,
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

function webglAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  const c = document.createElement('canvas');
  return c.getContext('webgl') !== null;
}

export function TerminalCRT() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const rafRef = useRef<number>(0);

  const isMobile = useIsMobile();
  const motion = useSystemStore((s) => s.motion);
  const crtFlicker = useSystemStore((s) => s.crtFlicker);

  const motionOff =
    motion === 'off' ||
    (motion === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const shouldRender = !isMobile && !motionOff && webglAvailable() && crtFlicker;

  const setupGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const prog = createProgram(gl, VERT, FRAG);
    if (!prog) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(prog);

    glRef.current = gl;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    const t0 = performance.now();
    const draw = () => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - t0) * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!shouldRender) return;
    const cleanup = setupGL();
    return () => {
      cancelAnimationFrame(rafRef.current);
      const gl = glRef.current;
      if (gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        glRef.current = null;
      }
      cleanup?.();
    };
  }, [shouldRender, setupGL]);

  if (!shouldRender) return null;

  return (
    <canvas
      ref={canvasRef}
      className={styles.crtCanvas}
      aria-hidden="true"
    />
  );
}
