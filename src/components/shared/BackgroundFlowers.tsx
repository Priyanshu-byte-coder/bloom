// Pure CSS rotations — no framer-motion, no "use client", runs on compositor thread
export function BackgroundFlowers() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="bloom-spin-120 absolute -bottom-[250px] -right-[250px] text-[600px] leading-none opacity-[0.03]">🌸</div>
      <div className="bloom-spin-90  absolute top-[-150px] -left-[150px] text-[400px] leading-none opacity-[0.04]">🌸</div>
      <div className="bloom-spin-60  absolute top-[30%] -right-[100px] text-[200px] leading-none opacity-[0.05]">🌸</div>
      <div className="bloom-spin-75  absolute bottom-[20%] -left-[100px] text-[250px] leading-none opacity-[0.04]">🌸</div>
    </div>
  )
}
