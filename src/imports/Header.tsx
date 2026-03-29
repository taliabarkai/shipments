import svgPaths from "./svg-4st2jinrul";

function Group1() {
  return (
    <div className="h-[50px] relative shrink-0 w-[56.273px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 50">
        <g id="Group 2">
          <path d={svgPaths.p4c9f820} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p18021e80} fill="var(--fill-0, white)" id="Vector_2" />
          <g id="Vector_3">
            <mask fill="white" id="path-3-inside-1_1_23774">
              <path d={svgPaths.p34b3ed40} />
            </mask>
            <path d={svgPaths.pae8a580} fill="var(--stroke-0, white)" mask="url(#path-3-inside-1_1_23774)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Layer() {
  return (
    <div className="content-stretch flex flex-col gap-[9.55px] items-start overflow-clip relative shrink-0 w-[56.273px]" data-name="Layer_1">
      <Group1 />
    </div>
  );
}

function Group() {
  return (
    <div className="h-[15px] relative shrink-0 w-[253.5px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 254 15">
        <g id="Group 1">
          <path d={svgPaths.pc164700} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p28c8d400} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p232cb000} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p7cf96f0} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p29783080} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p3003bd00} fill="var(--fill-0, white)" id="Vector_6" />
          <path d={svgPaths.p2bbd2500} fill="var(--fill-0, white)" id="Vector_7" />
          <path d={svgPaths.p34d50aa0} fill="var(--fill-0, white)" id="Vector_8" />
          <path d={svgPaths.p845f680} fill="var(--fill-0, white)" id="Vector_9" />
          <path d={svgPaths.p1aaa2d80} fill="var(--fill-0, white)" id="Vector_10" />
        </g>
      </svg>
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0" data-name="Component 4">
      <Layer />
      <Group />
    </div>
  );
}

function LogoLinks() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0" data-name="Logo + Links">
      <Component />
    </div>
  );
}

function Language() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="language">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="language">
          <path d={svgPaths.p556f6c0} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function AdornStartContainer() {
  return (
    <div className="box-border content-stretch flex h-px items-center pl-0 pr-[8px] py-0 relative shrink-0" data-name="Adorn. Start Container">
      <Language />
    </div>
  );
}

function MinHeight() {
  return <div className="h-[24px] shrink-0 w-0" data-name="min-height" />;
}

function MinWidth() {
  return <div className="h-0 shrink-0 w-[24px]" data-name="min-width" />;
}

function ArrowDropDownFilled() {
  return (
    <div className="absolute right-0 size-[24px] top-1/2 translate-y-[-50%]" data-name="ArrowDropDownFilled">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="ArrowDropDownFilled">
          <path d="M7 9.5L12 14.5L17 9.5H7Z" fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="box-border content-stretch flex items-center overflow-clip px-0 py-[8px] relative shrink-0" data-name="Container">
      <AdornStartContainer />
      <MinHeight />
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[16px] text-nowrap text-white tracking-[0.15px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px] whitespace-pre">MYKA US</p>
      </div>
      <MinWidth />
      <ArrowDropDownFilled />
    </div>
  );
}

function Input() {
  return (
    <div className="relative rounded-[4px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start px-[12px] py-0 relative w-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function SelectMykaUs() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0" data-name="<Select MYKA US>">
      <Input />
    </div>
  );
}

function MinWidth1() {
  return <div className="size-[40px]" data-name="min-width" />;
}

function Instance() {
  return (
    <div className="bg-[#bdbdbd] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0" data-name="Instance #2">
      <div className="absolute flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 text-[20px] text-center text-white top-1/2 tracking-[0.14px] translate-x-[-50%] translate-y-[-50%] w-[40px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px]">JD</p>
      </div>
      <div className="flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center relative shrink-0 w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]" style={{ "--transform-inner-width": "40", "--transform-inner-height": "40" } as React.CSSProperties}>
        <div className="flex-none rotate-[270deg]">
          <MinWidth1 />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <Instance />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
      <SelectMykaUs />
      <Frame />
    </div>
  );
}

export default function Header() {
  return (
    <div className="bg-[#303030] relative size-full" data-name="Header">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center justify-between px-[24px] py-[16px] relative size-full">
          <LogoLinks />
          <Frame1 />
        </div>
      </div>
    </div>
  );
}