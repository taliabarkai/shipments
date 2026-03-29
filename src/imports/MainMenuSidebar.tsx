import svgPaths from "./svg-b76gxeuxhf";

function Home() {
  return (
    <div className="absolute left-1/2 size-[40px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="home">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="home">
          <path d={svgPaths.pa9a7f0} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TgMenuIcons() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="TG Menu Icons">
      <Home />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0">
      <p className="font-['Open_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[12px] text-center text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Home
      </p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
      <TgMenuIcons />
      <Frame />
    </div>
  );
}

function Assignment() {
  return (
    <div className="absolute inset-[10%]" data-name="assignment">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="assignment">
          <path d={svgPaths.p214f7280} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TgMenuIcons1() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="TG Menu Icons">
      <Assignment />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative rounded-[4px] shrink-0 w-full">
      <TgMenuIcons1 />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[0.17px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Orders
      </p>
    </div>
  );
}

function LocalShipping() {
  return (
    <div className="absolute left-1/2 size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="local_shipping">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="local_shipping">
          <path d={svgPaths.p39769e00} fill="var(--fill-0, #42A5F5)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TgMenuIcons2() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="TG Menu Icons">
      <LocalShipping />
    </div>
  );
}

function FinalIcons() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative rounded-[4px] shrink-0 w-full" data-name="FINAL ICONS">
      <TgMenuIcons2 />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#42a5f5] text-[14px] text-center text-nowrap tracking-[0.17px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Shipment
      </p>
    </div>
  );
}

function LocalLibrary() {
  return (
    <div className="absolute inset-[10%]" data-name="local_library">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="local_library">
          <path d={svgPaths.p2b46f6f0} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TgMenuIcons3() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="TG Menu Icons">
      <LocalLibrary />
    </div>
  );
}

function FinalIcons1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative rounded-[4px] shrink-0 w-full" data-name="FINAL ICONS">
      <TgMenuIcons3 />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[0.17px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Catalog
      </p>
    </div>
  );
}

function ShoppingCart() {
  return (
    <div className="absolute left-1/2 size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="shopping_cart">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="shopping_cart">
          <path d={svgPaths.pca94a00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TgMenuIcons4() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="TG Menu Icons">
      <ShoppingCart />
    </div>
  );
}

function FinalIcons2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative rounded-[4px] shrink-0 w-full" data-name="FINAL ICONS">
      <TgMenuIcons4 />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[0.17px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Cart Engine
      </p>
    </div>
  );
}

function GridView() {
  return (
    <div className="absolute inset-[10%]" data-name="grid_view">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="grid_view">
          <g id="Vector">
            <path d={svgPaths.p18f69700} fill="var(--fill-0, white)" />
            <path d={svgPaths.p28d31af0} fill="var(--fill-0, white)" />
            <path d={svgPaths.p5fda400} fill="var(--fill-0, white)" />
            <path d={svgPaths.p192b300} fill="var(--fill-0, white)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function TgMenuIcons5() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="TG Menu Icons">
      <GridView />
    </div>
  );
}

function FinalIcons3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative rounded-[4px] shrink-0 w-full" data-name="FINAL ICONS">
      <TgMenuIcons5 />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[0.17px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Category
      </p>
    </div>
  );
}

function AccountCircle() {
  return (
    <div className="absolute left-1/2 size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="account_circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="account_circle">
          <path d={svgPaths.p805d880} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function TgMenuIcons6() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="TG Menu Icons">
      <AccountCircle />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative rounded-[4px] shrink-0 w-full">
      <TgMenuIcons6 />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white tracking-[0.17px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Accounts
      </p>
    </div>
  );
}

export default function MainMenuSidebar() {
  return (
    <div className="bg-[#303030] relative size-full" data-name="Main Menu / Sidebar">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-center px-[12px] py-[16px] relative size-full">
          <Frame3 />
          <Frame2 />
          <FinalIcons />
          <FinalIcons1 />
          <FinalIcons2 />
          <FinalIcons3 />
          <Frame1 />
        </div>
      </div>
    </div>
  );
}