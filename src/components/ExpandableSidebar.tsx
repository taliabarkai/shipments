import { useState } from 'react';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import { SHOW_SHIPMENT_COLLECTIONS } from '../featureFlags';
import svgPaths from '../imports/svg-356o2y1fns';
import routeIconPaths from '../imports/svg-yb48l66bfs';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ExpandableSidebarProps {
  activeSection?: 'shipments' | 'collections' | 'consolidated' | 'routes' | 'globalCarrier';
  onSectionChange?: (section: 'shipments' | 'collections' | 'consolidated' | 'routes' | 'globalCarrier') => void;
}

export default function ExpandableSidebar({ activeSection = 'consolidated', onSectionChange }: ExpandableSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`bg-white relative shadow-[0px_1px_3px_0px_rgba(0,0,0,0.12),0px_1px_1px_0px_rgba(0,0,0,0.14),0px_2px_1px_-1px_rgba(0,0,0,0.2)] h-full transition-all duration-300 ${isExpanded ? 'w-[280px]' : 'w-[69px]'}`}
      data-name="SIDEBAR"
    >
      <div className="size-full">
        <div 
          className="box-border content-stretch flex flex-col items-start p-[4px] relative size-full cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Navigation Items */}
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <div className="h-[16px] shrink-0 w-px" />
            
            {/* Shipments */}
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <Tooltip key={`shipments-${isExpanded}`}>
                <TooltipTrigger asChild>
                  <div 
                    className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0 w-full cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionChange?.('shipments');
                    }}
                  >
                    <div className="relative shrink-0 w-full">
                      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                        <div className="box-border content-stretch flex items-center px-[16px] py-[8px] relative w-full pt-[8px] pr-[16px] pb-[8px] pl-[10px]">
                          {/* Fixed-width icon container */}
                          <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative rounded-[100px] shrink-0 w-[40px]">
                            <div className="content-stretch flex items-center justify-center relative shrink-0">
                              <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                                <LocalShippingOutlined
                                  sx={{
                                    fontSize: 24,
                                    color: activeSection === 'shipments' ? '#1976D2' : 'rgba(0,0,0,0.56)',
                                  }}
                                />
                              </div>
                            </div>
                            {activeSection === 'shipments' && (
                              <div className="absolute bg-[rgba(25,118,210,0.3)] left-1/2 rounded-[100px] size-[36px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
                            )}
                          </div>
                          {/* Text - only visible when expanded */}
                          <div className={`box-border content-stretch flex flex-col items-start px-0 py-[4px] relative overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-[8px]' : 'opacity-0 w-0'}`}>
                            <p className="font-['Roboto',sans-serif] leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] tracking-[0.15px] whitespace-nowrap">
                              Shipments
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="bottom">
                    <p>Shipments</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            {SHOW_SHIPMENT_COLLECTIONS && (
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              {/* Shipment Collections */}
              <Tooltip key={`collections-${isExpanded}`}>
                <TooltipTrigger asChild>
                  <div 
                    className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0 w-full cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionChange?.('collections');
                    }}
                  >
                    <div className="relative shrink-0 w-full">
                      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                        <div className="box-border content-stretch flex items-center px-[16px] py-[8px] relative w-full pt-[8px] pr-[16px] pb-[8px] pl-[10px]">
                          {/* Fixed-width icon container */}
                          <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative rounded-[100px] shrink-0 w-[40px]">
                            <div className="content-stretch flex items-center justify-center relative shrink-0">
                              <div className="relative shrink-0 size-[24px]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                                  <g>
                                    <path d={svgPaths.p3a434080} fill={activeSection === 'collections' ? '#1976D2' : 'rgba(0,0,0,0.56)'} />
                                    <path d={svgPaths.p3538f80} fill={activeSection === 'collections' ? '#1976D2' : 'rgba(0,0,0,0.56)'} />
                                  </g>
                                </svg>
                              </div>
                            </div>
                            {activeSection === 'collections' && (
                              <div className="absolute bg-[rgba(25,118,210,0.3)] left-1/2 rounded-[100px] size-[36px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
                            )}
                          </div>
                          {/* Text - only visible when expanded */}
                          <div className={`box-border content-stretch flex flex-col items-start px-0 py-[4px] relative overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-[8px]' : 'opacity-0 w-0'}`}>
                            <p className="font-['Roboto',sans-serif] leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] tracking-[0.15px] whitespace-nowrap">
                              Shipment Collections
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="bottom">
                    <p>Shipment Collections</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
            )}

            {/* Consolidated Shipments */}
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <Tooltip key={`consolidated-${isExpanded}`}>
                <TooltipTrigger asChild>
                  <div 
                    className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0 w-full cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionChange?.('consolidated');
                    }}
                  >
                    <div className="relative shrink-0 w-full">
                      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                        <div className="box-border content-stretch flex items-center px-[16px] py-[8px] relative w-full pt-[8px] pr-[16px] pb-[8px] pl-[10px]">
                          {/* Fixed-width icon container */}
                          <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative rounded-[100px] shrink-0 w-[40px]">
                            <div className="content-stretch flex items-center justify-center relative shrink-0">
                              <div className="relative shrink-0 size-[24px]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                                  <g>
                                    <path d={svgPaths.p2b3adb80} fill={activeSection === 'consolidated' ? '#1976D2' : 'rgba(0,0,0,0.56)'} />
                                    <path d={svgPaths.p3d9c48f1} fill={activeSection === 'consolidated' ? '#1976D2' : 'rgba(0,0,0,0.56)'} />
                                  </g>
                                </svg>
                              </div>
                            </div>
                            {activeSection === 'consolidated' && (
                              <div className="absolute bg-[rgba(25,118,210,0.3)] left-1/2 rounded-[100px] size-[36px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
                            )}
                          </div>
                          {/* Text - only visible when expanded */}
                          <div className={`box-border content-stretch flex flex-col items-start px-0 py-[4px] relative overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-[8px]' : 'opacity-0 w-0'}`}>
                            <p className="font-['Roboto',sans-serif] leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] tracking-[0.15px] whitespace-nowrap">
                              Consolidated Shipments
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="bottom">
                    <p>Consolidated Shipments</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Routes */}
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <Tooltip key={`routes-${isExpanded}`}>
                <TooltipTrigger asChild>
                  <div 
                    className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0 w-full cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionChange?.('routes');
                    }}
                  >
                    <div className="relative shrink-0 w-full">
                      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                        <div className="box-border content-stretch flex items-center px-[16px] py-[8px] relative w-full pt-[8px] pr-[16px] pb-[8px] pl-[10px]">
                          {/* Fixed-width icon container */}
                          <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative rounded-[100px] shrink-0 w-[40px]">
                            <div className="content-stretch flex items-center justify-center relative shrink-0">
                              <div className="relative shrink-0 size-[24px]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                                  <g>
                                    <path d={routeIconPaths.pbb04100} fill={activeSection === 'routes' ? '#1976D2' : 'rgba(0,0,0,0.56)'} />
                                  </g>
                                </svg>
                              </div>
                            </div>
                            {activeSection === 'routes' && (
                              <div className="absolute bg-[rgba(25,118,210,0.3)] left-1/2 rounded-[100px] size-[36px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
                            )}
                          </div>
                          {/* Text - only visible when expanded */}
                          <div className={`box-border content-stretch flex flex-col items-start px-0 py-[4px] relative overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-[8px]' : 'opacity-0 w-0'}`}>
                            <p className="font-['Roboto',sans-serif] leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] tracking-[0.15px] whitespace-nowrap">
                              Shipping Routes
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="bottom">
                    <p>Shipping Routes</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Global Carrier */}
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <Tooltip key={`globalCarrier-${isExpanded}`}>
                <TooltipTrigger asChild>
                  <div 
                    className="content-stretch flex flex-col items-start overflow-clip relative rounded-[4px] shrink-0 w-full cursor-pointer hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionChange?.('globalCarrier');
                    }}
                  >
                    <div className="relative shrink-0 w-full">
                      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                        <div className="box-border content-stretch flex items-center px-[16px] py-[8px] relative w-full pt-[8px] pr-[16px] pb-[8px] pl-[10px]">
                          {/* Fixed-width icon container */}
                          <div className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[8px] relative rounded-[100px] shrink-0 w-[40px]">
                            <div className="content-stretch flex items-center justify-center relative shrink-0">
                              <Settings className={`w-6 h-6 ${activeSection === 'globalCarrier' ? 'text-[#1976D2]' : 'text-[rgba(0,0,0,0.56)]'}`} />
                            </div>
                            {activeSection === 'globalCarrier' && (
                              <div className="absolute bg-[rgba(25,118,210,0.3)] left-1/2 rounded-[100px] size-[36px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
                            )}
                          </div>
                          {/* Text - only visible when expanded */}
                          <div className={`box-border content-stretch flex flex-col items-start px-0 py-[4px] relative overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-[8px]' : 'opacity-0 w-0'}`}>
                            <p className="font-['Roboto',sans-serif] leading-[1.5] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] tracking-[0.15px] whitespace-nowrap">
                              Global Carrier Settings
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="bottom">
                    <p>Global Carrier Settings</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Collapse/Expand Button */}
          <div className={`box-border content-stretch flex gap-[10px] items-center ${isExpanded ? 'justify-end px-[24px] py-[16px]' : 'justify-center px-[16px] py-[16px]'} w-full`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="bg-white box-border content-stretch flex flex-col items-center justify-center overflow-clip p-[5px] relative rounded-[100px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.12),0px_1px_1px_0px_rgba(0,0,0,0.14),0px_2px_1px_-1px_rgba(0,0,0,0.2)] shrink-0 hover:bg-gray-50 transition-colors"
            >
              <div className="content-stretch flex items-start relative shrink-0">
                {isExpanded ? (
                  <ChevronLeft className="w-5 h-5 text-[rgba(0,0,0,0.56)]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[rgba(0,0,0,0.56)]" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}