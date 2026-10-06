"use client"

import { useEffect, useRef, useCallback } from "react"
import { Button } from "../retroui/Button"
import { IconCode, IconRocket, IconStar } from "@tabler/icons-react"

/** Code badge — top-left */
function CodeBadge() {
  return (
    <div className="absolute -top-5 -left-7 z-30 flex -rotate-12 cursor-default items-center gap-2 border-[3px] border-black bg-black px-3 py-2.5 text-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 select-none hover:rotate-0">
      <IconCode
        size={18}
        strokeWidth={2.8}
        className="shrink-0 text-yellow-300"
      />
      <span className="font-mono text-sm leading-none font-black tracking-tight">
        FULL STACK
      </span>
    </div>
  )
}

/** Star / rating badge — top-right */
function StarBadge() {
  return (
    <div className="absolute -top-8 right-6 z-30 flex rotate-12 cursor-default flex-col items-center gap-1 border-[3px] border-black bg-yellow-300 px-3 py-2.5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 select-none hover:rotate-6">
      {/* Three filled stars */}
      {/* <div className="flex gap-0.5"> */}
      {/* {[0, 1, 2].map((k) => (
          <IconStar
            key={k}
            size={13}
            strokeWidth={2}
            className="fill-black text-black"
          />
        ))}
      </div> */}
      <span className="text-[10px] leading-none font-black tracking-widest text-black uppercase">
        DEBUGGING...
      </span>
    </div>
  )
}

/** Rocket / launch badge — bottom-right */
function RocketBadge() {
  return (
    <div className="absolute right-3 -bottom-7 z-30 flex rotate-6 cursor-default items-center gap-2 border-[3px] border-black bg-white px-3 py-2.5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 select-none hover:-rotate-2">
      <IconRocket
        size={20}
        strokeWidth={2.5}
        className="shrink-0 -rotate-45 text-black"
      />
      <div className="flex flex-col leading-none">
        <span className="text-xs font-black tracking-tight text-yellow-300 uppercase">
          DEPLOYING IDEAS
        </span>
      </div>
    </div>
  )
}

// /* Ring Configuration */
// const RING_CONFIG = {
//   color: "#fffb00",
//   lineWidth: 4.8,
//   glowSize: 34,
//   pad: 46,
//   speed: 0.19,
//   rotationsPerDir: 2.5,
//   numSegments: 14,
//   minDashFrac: 0.19,
//   maxDashFrac: 0.82,
//   minGapPx: 2,
//   freqMin: 0.04,
//   freqMax: 0.13,
// }

// interface OrganicSpinBorderProps {
//   containerRef: React.RefObject<HTMLDivElement | null>
// }

// function OrganicSpinBorder({ containerRef }: OrganicSpinBorderProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   const segOscs = useRef(
//     Array.from({ length: RING_CONFIG.numSegments }, (_, i) => ({
//       freq:
//         RING_CONFIG.freqMin +
//         Math.random() * (RING_CONFIG.freqMax - RING_CONFIG.freqMin),
//       phase:
//         (i / RING_CONFIG.numSegments) * (2 * Math.PI) +
//         (Math.random() - 0.5) * 0.9,
//     }))
//   )

//   const getSize = useCallback(() => {
//     const rect = containerRef.current?.getBoundingClientRect() ?? {
//       width: 380,
//       height: 380,
//     }
//     const PAD = RING_CONFIG.pad
//     const W = rect.width + PAD * 2
//     const H = rect.height + PAD * 2
//     return {
//       W,
//       H,
//       CX: W / 2,
//       CY: H / 2,
//       R: rect.width / 2 + PAD * 0.58,
//     }
//   }, [containerRef])

//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext("2d", { alpha: true })
//     if (!ctx) return

//     const dpr = Math.min(window.devicePixelRatio || 1, 2)
//     const TWO_PI = 2 * Math.PI

//     const applySize = () => {
//       const { W, H } = getSize()
//       canvas.width = W * dpr
//       canvas.height = H * dpr
//       canvas.style.width = `${W}px`
//       canvas.style.height = `${H}px`
//       ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
//     }

//     setTimeout(applySize, 50)
//     window.addEventListener("resize", applySize)

//     let ringAngle = 0
//     let direction = 1
//     let rotAccum = 0

//     let t = 0
//     let lastTs: number | null = null
//     let animId: number

//     function drawRing(CX: number, CY: number, R: number) {
//       const N = RING_CONFIG.numSegments
//       const circ = TWO_PI * R
//       const slot = circ / N
//       const dash: number[] = []

//       for (let i = 0; i < N; i++) {
//         const { freq, phase } = segOscs.current[i]
//         const sine = Math.sin(TWO_PI * freq * t + phase)
//         const norm = (sine + 1) / 2

//         const dashLen =
//           slot *
//           (RING_CONFIG.minDashFrac +
//             (RING_CONFIG.maxDashFrac - RING_CONFIG.minDashFrac) * norm)
//         const gapLen = Math.max(RING_CONFIG.minGapPx, slot - dashLen)

//         dash.push(Math.max(4, dashLen), Math.max(4, gapLen))
//       }

//       ctx.save()
//       ctx.translate(CX, CY)
//       ctx.rotate(ringAngle)
//       ctx.translate(-CX, -CY)

//       ctx.beginPath()
//       ctx.arc(CX, CY, R, 0, TWO_PI)
//       ctx.setLineDash(dash)
//       ctx.lineDashOffset = 0
//       ctx.strokeStyle = RING_CONFIG.color
//       ctx.lineWidth = RING_CONFIG.lineWidth
//       ctx.shadowBlur = RING_CONFIG.glowSize
//       ctx.shadowColor = RING_CONFIG.color
//       ctx.stroke()
//       ctx.restore()
//     }

//     function loop(ts: number) {
//       if (!lastTs) lastTs = ts
//       const dt = Math.min(ts - lastTs, 50)
//       lastTs = ts
//       t += dt * 0.001

//       const step = RING_CONFIG.speed * dt * 0.001
//       ringAngle += direction * step
//       rotAccum += Math.abs(step) / TWO_PI

//       if (rotAccum >= RING_CONFIG.rotationsPerDir) {
//         rotAccum -= RING_CONFIG.rotationsPerDir
//         direction *= -1
//       }

//       const { W, H, CX, CY, R } = getSize()
//       ctx.clearRect(0, 0, W, H)
//       drawRing(CX, CY, R)

//       animId = requestAnimationFrame(loop)
//     }

//     animId = requestAnimationFrame(loop)

//     return () => {
//       cancelAnimationFrame(animId)
//       window.removeEventListener("resize", applySize)
//     }
//   }, [getSize])

//   return (
//     <canvas
//       ref={canvasRef}
//       className="pointer-events-none absolute z-20"
//       style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
//     />
//   )
// }

export default function HeroSection() {
  const circleRef = useRef<HTMLDivElement>(null)

  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] items-center overflow-hidden border-b-4 border-black bg-white py-6 lg:py-12"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 [background-image:linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:40px_40px] opacity-10" />

      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        <div className="grid min-h-[85vh] grid-cols-1 items-center gap-8 lg:min-h-0 lg:grid-cols-2 lg:gap-12">
          {/* Left Content */}
          <div className="flex flex-col items-start gap-6">
            <div className="inline-block border-2 border-black bg-yellow-400 px-5 py-1.5 text-sm font-bold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              OPEN TO WORK!!
            </div>

            <h1 className="font-head text-2xl leading-tight font-black tracking-tight text-black uppercase md:text-3xl lg:text-4xl">
              Always{" "}
              <span className="cursor-default text-yellow-500 italic underline decoration-black decoration-4 transition-colors hover:text-yellow-400">
                LEARNING
              </span>{" "}
              &nbsp; because the web{" "}
              <span className="cursor-default text-yellow-500 italic decoration-black decoration-4 transition-colors hover:text-yellow-400">
                NEVER STOPS
              </span>
              &nbsp;;
              <br className="hidden lg:block" /> continuously{" "}
              <span className="cursor-default text-yellow-500 italic underline decoration-black decoration-4 transition-colors hover:text-yellow-400">
                IMPROVING
              </span>{" "}
              &nbsp; the{" "}
              <span className="cursor-default text-yellow-500 italic decoration-black decoration-4 transition-colors hover:text-yellow-400">
                CURRENT VERSION of
              </span>{" "}
              &nbsp; every app{" "}
              <span className="cursor-default text-yellow-500 decoration-black decoration-4 transition-colors hover:text-yellow-400">
                I
              </span>
              &nbsp; build.
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed font-medium text-zinc-700 md:text-lg">
              I'm Om Selkar — a Full Stack Developer focused on MERN,
              cloud-native applications, and intelligent automation systems.
              Passionate about building products that solve real-world problems
              with clean architecture and impactful user experience.
            </p>

        
          </div>

          {/* Right Side - Profile */}
          <div className="-mt-4 flex flex-col items-center lg:-mt-8 lg:items-center">
            <div className="relative w-[300px] md:w-[340px] lg:w-[390px]">
              {/* <OrganicSpinBorder containerRef={circleRef} /> */}

              <div
                ref={circleRef}
                className="relative z-10 rounded-3xl border-[12px] border-black bg-white p-5 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="relative aspect-[5/6] overflow-hidden rounded-2xl border-4 border-black">
                  <img
                    src="/my-photo.png"
                    alt="Om Selkar"
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border-[10px] border-white/80" />
                </div>
              </div>

              <CodeBadge />
              <StarBadge />
              <RocketBadge />
            </div>

            {/* Buttons moved to bottom of image */}
            <div className="mt-8 flex flex-wrap gap-4 lg:mt-10">
              <Button
                size="md"
                variant="default"
                onClick={() =>
                  window.open(
                    "https://github.com/OmSelkar?tab=repositories",
                    "_blank"
                  )
                }
                className="text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                View Projects
              </Button>

              <Button
                size="md"
                variant="outline"
                onClick={() =>
                  window.open("/resume.pdf", "_blank")
                }
                className="border-4 border-black text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-black hover:text-white"
              >
                Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
