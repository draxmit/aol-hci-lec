import { useEffect, useRef } from 'react'

export function EntryShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    if (!gl) return

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const VS = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`
    const FS = `
      precision highp float;
      uniform vec2 R; uniform float T;
      void main(){
        vec2 uv = (gl_FragCoord.xy * 2.0 - R) / min(R.x, R.y);
        float t = T * 0.008;
        float lw = 0.002;
        vec3 c = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i = 0; i < 5; i++){
            c[j] += lw * float(i*i) / abs(
              fract(t - 0.003*float(j) + float(i)*0.003)*5.0
              - length(uv)
              + mod(uv.x + uv.y, 0.2)
            );
          }
        }
        gl_FragColor = vec4(c, 1.0);
      }
    `

    function makeShader(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src); gl!.compileShader(s); return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, VS))
    gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uR = gl.getUniformLocation(prog, 'R')
    const uT = gl.getUniformLocation(prog, 'T')
    let t = 0, rafId = 0

    function draw() {
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      gl!.uniform2f(uR, canvas!.width, canvas!.height)
      gl!.uniform1f(uT, t += 0.3)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      rafId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
