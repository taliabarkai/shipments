import svgPaths from "./svg-ejk8r75i8o";

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full z-[1]">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Add Collection
      </p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col isolate items-start relative shrink-0 w-full z-[5]">
      <Frame2 />
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
          <path d="M7 9.5L12 14.5L17 9.5H7Z" fill="var(--fill-0, black)" fillOpacity="0.56" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-center overflow-clip px-0 py-[16px] relative shrink-0 w-full" data-name="Container">
      <MinHeight />
      <div className="basis-0 flex flex-col font-['Roboto:Regular',sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[16px] text-[rgba(0,0,0,0.6)] tracking-[0.15px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Select</p>
      </div>
      <MinWidth />
      <ArrowDropDownFilled />
    </div>
  );
}

function Input() {
  return (
    <div className="relative rounded-[4px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.23)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start px-[12px] py-0 relative w-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function PackingFacility() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="<PackingFacility>">
      <Input />
    </div>
  );
}

function Carriers() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Carriers">
      <PackingFacility />
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[472px] z-[4]" data-name="Component 8">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Carrier
      </p>
      <Carriers />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p218f2800} fill="var(--fill-0, black)" fillOpacity="0.56" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function AdornmentEnd() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="AdornmentEnd">
      <Icon />
    </div>
  );
}

function AdornEndContainer() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Adorn. End Container">
      <AdornmentEnd />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex items-center min-h-[24px] overflow-clip px-0 py-[16px] relative shrink-0 w-full" data-name="Content">
      <p className="basis-0 font-['Roboto:Regular',sans-serif] font-normal grow leading-[24px] min-h-px min-w-px relative shrink-0 text-[16px] text-[rgba(0,0,0,0.6)] tracking-[0.15px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Select
      </p>
      <AdornEndContainer />
    </div>
  );
}

function Input1() {
  return (
    <div className="relative rounded-[4px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.23)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start px-[12px] py-0 relative w-full">
          <Content />
        </div>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="<TextField>">
      <Input1 />
    </div>
  );
}

function DatePicker() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="<DatePicker>">
      <TextField />
    </div>
  );
}

function Time() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Time">
      <DatePicker />
    </div>
  );
}

function Component1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[472px] z-[3]" data-name="Component 9">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Pickup Time
      </p>
      <Time />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p3fd9e500} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="<Icon>">
      <Icon1 />
    </div>
  );
}

function IconButton() {
  return (
    <button className="absolute content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip p-[8px] right-[8px] rounded-[100px] top-[8px] z-[2]" data-name="!!<IconButton>">
      <Icon2 />
    </button>
  );
}

function Base() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Base">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[26px] relative shrink-0 text-[#1976d2] text-[15px] text-left text-nowrap tracking-[0.46px] uppercase whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        cancel
      </p>
    </div>
  );
}

function Button() {
  return (
    <button className="cursor-pointer relative rounded-[4px] shrink-0" data-name="<Button>">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip px-[22px] py-[8px] relative rounded-[inherit]">
        <Base />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(25,118,210,0.5)] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </button>
  );
}

function Base1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Base">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[26px] relative shrink-0 text-[15px] text-nowrap text-white tracking-[0.46px] uppercase whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        add
      </p>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#1976d2] content-stretch flex flex-col items-center justify-center overflow-clip px-[22px] py-[8px] relative rounded-[4px] shadow-[0px_1px_5px_0px_rgba(0,0,0,0.12),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_3px_1px_-2px_rgba(0,0,0,0.2)] shrink-0" data-name="<Button>">
      <Base1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-start justify-end right-[24px] top-[425px] z-[1]">
      <Button />
      <Button1 />
    </div>
  );
}

export default function NewCollection() {
  return (
    <div className="bg-white relative rounded-[4px] size-full" data-name="New Collection">
      <div className="flex flex-col items-end size-full">
        <div className="content-stretch flex flex-col gap-[24px] isolate items-end p-[24px] relative size-full">
          <Frame1 />
          <Component />
          <Component1 />
          <IconButton />
          <Frame />
        </div>
      </div>
    </div>
  );
}