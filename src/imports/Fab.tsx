import svgPaths from "./svg-c1ji32avmt";

function ArrowBackFilled() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="ArrowBackFilled">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="ArrowBackFilled">
          <path d={svgPaths.p1d45ae00} fill="var(--fill-0, black)" fillOpacity="0.87" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Base() {
  return (
    <div className="content-stretch flex items-center overflow-clip p-[8px] relative rounded-[100px] shrink-0 bg-[rgba(217,217,217,0)]" data-name="Base">
      <ArrowBackFilled />
    </div>
  );
}

export default function Fab() {
  return (
    <div className="bg-[#eeeeee] content-stretch flex items-center overflow-clip relative rounded-[100px] size-full" data-name="<Fab>">
      <Base />
    </div>
  );
}