import svgPaths from "./svg-yqfdgmtxa7";

function MinHeight() {
  return <div className="h-[16px] shrink-0 w-px" data-name="min-height" />;
}

function SpacingVertical() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[8px]" data-name="Spacing | Vertical">
      <MinHeight />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p1ea84400} fill="var(--fill-0, #1976D2)" />
            <path d={svgPaths.p3f9aa200} fill="var(--fill-0, #1976D2)" />
            <path d={svgPaths.p27f52a40} fill="var(--fill-0, #1976D2)" />
            <path d={svgPaths.p68e4b00} fill="var(--fill-0, #1976D2)" />
          </g>
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

function IconButton() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative rounded-[100px] shrink-0" data-name="<IconButton>">
      <Icon1 />
      <div className="absolute bg-[rgba(25,118,210,0.3)] left-1/2 rounded-[100px] size-[36px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="focusRipple" />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center px-[16px] py-[8px] relative w-full">
          <IconButton />
        </div>
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="<ListItem>">
      <Container />
    </div>
  );
}

function CustomExpandableNavItem() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0" data-name="*Custom / Expandable Nav Item">
      <ListItem />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p3a434080} fill="var(--fill-0, black)" fillOpacity="0.56" />
            <path d={svgPaths.p3538f80} fill="var(--fill-0, black)" fillOpacity="0.56" />
          </g>
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

function IconButton1() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative rounded-[100px] shrink-0" data-name="<IconButton>">
      <Icon3 />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center px-[16px] py-[8px] relative w-full">
          <IconButton1 />
        </div>
      </div>
    </div>
  );
}

function ListItem1() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="<ListItem>">
      <Container1 />
    </div>
  );
}

function CustomExpandableNavItem1() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0" data-name="*Custom / Expandable Nav Item">
      <ListItem1 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p2b3adb80} fill="var(--fill-0, black)" fillOpacity="0.56" />
            <path d={svgPaths.p3d9c48f1} fill="var(--fill-0, black)" fillOpacity="0.56" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Icon5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="<Icon>">
      <Icon4 />
    </div>
  );
}

function IconButton2() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative rounded-[100px] shrink-0" data-name="<IconButton>">
      <Icon5 />
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center px-[16px] py-[8px] relative w-full">
          <IconButton2 />
        </div>
      </div>
    </div>
  );
}

function ListItem2() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0" data-name="<ListItem>">
      <Container2 />
    </div>
  );
}

function CustomExpandableNavItem2() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0" data-name="*Custom / Expandable Nav Item">
      <ListItem2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <SpacingVertical />
      <CustomExpandableNavItem />
      <CustomExpandableNavItem1 />
      <CustomExpandableNavItem2 />
    </div>
  );
}

function Frame2() {
  return <div className="bg-white h-[721px] shrink-0 w-[69px]" />;
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p332a0b00} fill="var(--fill-0, black)" fillOpacity="0.56" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="<Icon>">
      <Icon6 />
    </div>
  );
}

function IconButton3() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[5px] relative rounded-[100px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.12),0px_1px_1px_0px_rgba(0,0,0,0.14),0px_2px_1px_-1px_rgba(0,0,0,0.2)] shrink-0" data-name="<IconButton>">
      <Icon7 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bottom-0 box-border content-stretch flex gap-[10px] items-center justify-end left-0 px-[24px] py-[16px] w-[80px]">
      <IconButton3 />
    </div>
  );
}

export default function Sidebar() {
  return (
    <div className="bg-white relative shadow-[0px_1px_3px_0px_rgba(0,0,0,0.12),0px_1px_1px_0px_rgba(0,0,0,0.14),0px_2px_1px_-1px_rgba(0,0,0,0.2)] size-full" data-name="SIDEBAR">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[4px] relative size-full">
          <Frame />
          <Frame2 />
          <Frame1 />
        </div>
      </div>
    </div>
  );
}