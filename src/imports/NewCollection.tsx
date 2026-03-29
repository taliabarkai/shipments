import svgPaths from "./svg-zkarc0ywlb";

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full z-[2]">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Create New Consolidated Shipment
      </p>
    </div>
  );
}

function Place() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="place">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="place">
          <path d={svgPaths.p1c5cb100} fill="var(--fill-0, black)" fillOpacity="0.56" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame7() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] items-center relative">
        <Place />
        <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          Destination
        </p>
      </div>
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
    <div className="box-border content-stretch flex items-center overflow-clip px-0 py-[16px] relative shrink-0 w-full" data-name="Container">
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
        <div className="box-border content-stretch flex flex-col items-start px-[12px] py-0 relative w-full">
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

function Destination() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Destination">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] items-start relative w-full">
        <PackingFacility />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px relative shrink-0 z-[2]" data-name="Container">
      <Frame7 />
      <Destination />
    </div>
  );
}

function LocalShipping() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="local_shipping">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="local_shipping">
          <path d={svgPaths.p3d94fd00} fill="var(--fill-0, black)" fillOpacity="0.56" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] items-center relative">
        <LocalShipping />
        <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
          Carrier
        </p>
      </div>
    </div>
  );
}

function MinHeight1() {
  return <div className="h-[24px] shrink-0 w-0" data-name="min-height" />;
}

function MinWidth1() {
  return <div className="h-0 shrink-0 w-[24px]" data-name="min-width" />;
}

function ArrowDropDownFilled1() {
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

function Container2() {
  return (
    <div className="box-border content-stretch flex items-center overflow-clip px-0 py-[16px] relative shrink-0 w-full" data-name="Container">
      <MinHeight1 />
      <div className="basis-0 flex flex-col font-['Roboto:Regular',sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[16px] text-[rgba(0,0,0,0.6)] tracking-[0.15px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Select</p>
      </div>
      <MinWidth1 />
      <ArrowDropDownFilled1 />
    </div>
  );
}

function Input1() {
  return (
    <div className="relative rounded-[4px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.23)] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start px-[12px] py-0 relative w-full">
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function PackingFacility1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="<PackingFacility>">
      <Input1 />
    </div>
  );
}

function Carriers() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="Carriers">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] items-start relative w-full">
        <PackingFacility1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px relative shrink-0 z-[1]" data-name="Container">
      <Frame9 />
      <Carriers />
    </div>
  );
}

function ScanBarcodes() {
  return (
    <div className="bg-neutral-50 relative rounded-[12px] shrink-0 w-full z-[1]" data-name="ScanBarcodes">
      <div className="size-full">
        <div className="box-border content-stretch flex gap-[32px] isolate items-start p-[16px] relative w-full">
          <Container1 />
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] isolate items-start relative shrink-0 w-full z-[2]">
      <Frame2 />
      <ScanBarcodes />
    </div>
  );
}

function ListAlt() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="list_alt">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="list_alt">
          <path d={svgPaths.pb87fa80} fill="var(--fill-0, black)" fillOpacity="0.56" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[12px] items-start justify-end relative shrink-0">
      <ListAlt />
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Scan Orders
      </p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame3 />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.6)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        0 items
      </p>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p1a4ed500} fill="var(--fill-0, black)" fillOpacity="0.56" id="Vector" />
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

function AdornStartContainer() {
  return (
    <div className="box-border content-stretch flex items-center pl-0 pr-[12px] py-0 relative shrink-0" data-name="Adorn. Start Container">
      <Icon1 />
    </div>
  );
}

function Content() {
  return (
    <div className="min-h-[24px] relative shrink-0 w-full" data-name="Content">
      <div className="flex flex-row items-center min-h-inherit overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex items-center min-h-inherit pl-0 pr-[12px] py-[16px] relative w-full">
          <AdornStartContainer />
          <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.6)] text-nowrap tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
            Scan or Enter Order ID
          </p>
        </div>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Input">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start px-[12px] py-0 relative w-full">
          <Content />
        </div>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="<TextField>">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.12)] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-full">
        <Input2 />
      </div>
    </div>
  );
}

function IconLeft() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="Icon Left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon Left">
          <path d={svgPaths.p2090e800} fill="var(--fill-0, black)" fillOpacity="0.56" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[23.993px] relative shrink-0 w-[163.984px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.6)] text-nowrap top-[-0.78px] tracking-[-0.3125px] whitespace-pre">No orders scanned yet</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[183.915px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.6)] text-nowrap top-[0.67px] tracking-[-0.1504px] whitespace-pre">Start scanning to add orders</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] items-center justify-center relative size-full">
        <IconLeft />
        <Paragraph />
        <Paragraph1 />
      </div>
    </div>
  );
}

function ScanBarcodes1() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="ScanBarcodes">
      <div className="box-border content-stretch flex flex-col gap-[7.995px] items-center overflow-clip p-px relative rounded-[inherit] size-full">
        <TextField />
        <Frame8 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Component() {
  return (
    <div className="basis-0 bg-neutral-50 grow min-h-px min-w-px relative shrink-0 w-full z-[1]" data-name="Component 30">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start justify-center p-[24px] relative size-full">
          <Frame6 />
          <ScanBarcodes1 />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[24px] grow isolate items-start min-h-px min-w-px relative shrink-0 w-full z-[3]">
      <Frame1 />
      <Component />
    </div>
  );
}

function Icon2() {
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

function Icon3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="<Icon>">
      <Icon2 />
    </div>
  );
}

function IconButton() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] right-[8px] rounded-[100px] top-[8px] z-[2]" data-name="!!<IconButton>">
      <Icon3 />
    </div>
  );
}

function Base() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Base">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[26px] relative shrink-0 text-[#1976d2] text-[15px] text-nowrap tracking-[0.46px] uppercase whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        cancel
      </p>
    </div>
  );
}

function ButtonBack() {
  return (
    <button className="box-border content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip px-[11px] py-[8px] relative rounded-[4px] shrink-0" data-name="<ButtonBack>">
      <Base />
    </button>
  );
}

function Base1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Base">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[26px] relative shrink-0 text-[15px] text-[rgba(0,0,0,0.38)] text-nowrap tracking-[0.46px] uppercase whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        pack consolidated shipment
      </p>
    </div>
  );
}

function Create() {
  return (
    <div className="bg-[rgba(0,0,0,0.12)] box-border content-stretch flex flex-col items-center justify-center overflow-clip px-[22px] py-[8px] relative rounded-[4px] shrink-0" data-name="<Create>">
      <Base1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <Create />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full z-[1]">
      <ButtonBack />
      <Frame5 />
    </div>
  );
}

export default function NewCollection() {
  return (
    <div className="bg-white relative rounded-[4px] size-full" data-name="New Collection">
      <div className="flex flex-col items-end size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] isolate items-end p-[24px] relative size-full">
          <Frame4 />
          <IconButton />
          <Frame />
        </div>
      </div>
    </div>
  );
}