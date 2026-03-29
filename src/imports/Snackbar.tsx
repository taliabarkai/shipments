import svgPaths from "./svg-as2mch43nx";

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p33817400} fill="var(--fill-0, white)" id="Vector" />
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

function Instance() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[5px] relative rounded-[100px] shrink-0" data-name="Instance #2">
      <Icon1 />
    </div>
  );
}

function Stack() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="<Stack>">
      <Instance />
    </div>
  );
}

function SnackbarContent() {
  return (
    <div className="relative rounded-[4px] shrink-0 w-full" data-name="<SnackbarContent>">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[24px] items-center px-[24px] py-[12px] relative w-full">
          <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[1.5] relative shrink-0 text-[16px] text-nowrap text-white tracking-[0.15px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
            <span>{`Consolidated shipment `}</span>
            <span style={{ fontVariationSettings: "'wdth' 100" }}>273133181</span>
            <span>
              <br aria-hidden="true" />
              was created successfully!
            </span>
          </p>
          <Stack />
        </div>
      </div>
    </div>
  );
}

function Paper() {
  return (
    <div className="bg-[#323232] box-border content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shadow-[0px_1px_18px_0px_rgba(0,0,0,0.12),0px_6px_10px_0px_rgba(0,0,0,0.14),0px_3px_5px_-1px_rgba(0,0,0,0.2)] shrink-0" data-name="<Paper>">
      <SnackbarContent />
    </div>
  );
}

export default function Snackbar() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="<Snackbar>">
      <Paper />
    </div>
  );
}