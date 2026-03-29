import svgPaths from "./svg-yb48l66bfs";

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.pbb04100} fill="var(--fill-0, #1976D2)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="<Icon>">
      <Icon />
    </div>
  );
}

export default function IconButton() {
  return (
    <div className="relative rounded-[100px] size-full" data-name="<IconButton>">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative size-full">
          <Icon1 />
          <div className="absolute bg-[rgba(25,118,210,0.3)] left-1/2 rounded-[100px] size-[36px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="focusRipple" />
        </div>
      </div>
    </div>
  );
}