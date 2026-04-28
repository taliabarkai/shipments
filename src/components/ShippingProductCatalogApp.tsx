import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Download, Minus, Plus, Search } from 'lucide-react';
import CreateManualPackingItemDrawer from './CreateManualPackingItemDrawer';
import { HsCodeControlledPicker } from './HsCodeControlledPicker';
import ShippingCatalogRowDrawer from './ShippingCatalogRowDrawer';
import {
  CATALOG_CATEGORIES,
  CATALOG_MATERIAL_TYPES,
  formatCatalogCategoryLabel,
  formatCatalogMaterialLabel,
  HS_CODE_OPTIONS,
  type CatalogCategory,
  type CatalogItemStatus,
  type CatalogMaterialType,
  type ShippingCatalogRow,
} from './shippingCatalogModel';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';

export type { CatalogCategory, CatalogItemStatus, CatalogMaterialType, ShippingCatalogRow } from './shippingCatalogModel';
export { CATALOG_CATEGORIES, CATALOG_MATERIAL_TYPES, formatCatalogCategoryLabel } from './shippingCatalogModel';

const COLUMNS = [
  { id: 'sku' as const, label: 'SKU' },
  { id: 'siteSku' as const, label: 'Site SKU' },
  { id: 'supplierItemId' as const, label: 'Supplier ID' },
  { id: 'productName' as const, label: 'Product Name' },
  { id: 'hsCode' as const, label: 'HS Code' },
  { id: 'weight' as const, label: 'Weight' },
  { id: 'country' as const, label: 'Country' },
  { id: 'material' as const, label: 'Material' },
  { id: 'category' as const, label: 'Category' },
  { id: 'diamond' as const, label: 'Diamond' },
  { id: 'nonProd' as const, label: 'Non-Prod.' },
  { id: 'status' as const, label: 'Catalog Status' },
] as const;

/** SKU (first column): max width 110px; long values truncate (see body `title`). */
const SKU_COLUMN_HEADER_CELL = 'min-w-0 max-w-[110px] whitespace-nowrap align-middle';

const SKU_COLUMN_BODY_CELL = 'min-w-0 max-w-[110px] align-middle';

/** Supplier ID: max 100px; long values truncate (see body `title`). */
const SUPPLIER_ID_HEADER_CELL = 'min-w-0 max-w-[100px] whitespace-nowrap align-middle';

const SUPPLIER_ID_BODY_CELL = 'min-w-0 max-w-[100px] align-middle';

/** Site SKU: at least 120px and grow to fit cell text (no clipping). */
const SKU_GROUP_CELL =
  'min-w-[120px] w-[minmax(120px,max-content)] whitespace-nowrap align-middle';

const SKU_GROUP_HEADER_CELL =
  'min-w-[120px] w-[minmax(120px,max-content)] whitespace-nowrap align-middle';

/** HS Code column: bounded width + truncation so long labels don’t widen the table. */
const HS_CODE_HEADER_CELL = 'min-w-0 max-w-[200px] align-middle';
const HS_CODE_BODY_CELL = 'min-w-0 max-w-[200px] align-middle';

const TABLE_HEADER_TH = 'align-middle';

/** Horizontally centered in header + body; other columns are left-aligned (all cells use vertical middle). */
const CENTERED_CATALOG_COLUMN_IDS = new Set<string>(['country', 'weight', 'diamond', 'nonProd']);

/** Columns that show filter controls inside the header popover. */
const FILTERABLE_COLUMN_IDS = new Set<string>(['category', 'hsCode', 'material', 'diamond', 'nonProd']);

/** Catalog list scope: all rows, master online/archived, or locally created manual packing items only. */
type CatalogMasterStatusTab = 'All' | 'ManualPackingItems' | 'Online' | 'Archived';

type CatalogYesNoFilterChoice = 'yes' | 'no';

type CatalogTableFilters = {
  categories: CatalogCategory[];
  materials: CatalogMaterialType[];
  hsCodes: string[];
  /** Empty, both, or two selections = no filter; exactly one = filter to that value. */
  diamondSelections: CatalogYesNoFilterChoice[];
  nonProdSelections: CatalogYesNoFilterChoice[];
};

const initialCatalogFilters = (): CatalogTableFilters => ({
  categories: [],
  materials: [],
  hsCodes: [],
  diamondSelections: [],
  nonProdSelections: [],
});

function catalogColumnFilterCount(columnId: string, f: CatalogTableFilters): number {
  switch (columnId) {
    case 'category':
      return f.categories.length;
    case 'material':
      return f.materials.length;
    case 'hsCode':
      return f.hsCodes.length;
    case 'diamond':
      return f.diamondSelections.length === 1 ? 1 : 0;
    case 'nonProd':
      return f.nonProdSelections.length === 1 ? 1 : 0;
    default:
      return 0;
  }
}

const MOCK_ROWS: ShippingCatalogRow[] = [
  {
    id: '1',
    sku: 'Prod-001',
    siteSku: '2390-01-3626',
    supplierItemId: 'Prod-001',
    productName: 'Engraved Compass Necklace with Diamond - Gold Vermeil',
    category: 'necklace',
    hsCode: '7113195000',
    country: 'IL',
    material: 'jewelry_solid_gold',
    weight: '142 g',
    diamond: true,
    nonProd: false,
    status: 'Online',
  },
  {
    id: '2',
    sku: 'Prod-002',
    siteSku: '2390-02-1102',
    supplierItemId: 'SUP-8821',
    productName: 'Willow Tag Initial Ring with Diamond - Silver',
    category: 'ring',
    hsCode: '7113115000',
    country: 'IL',
    material: 'jewelry_gold_plating',
    weight: '8.2 g',
    diamond: false,
    nonProd: false,
    status: 'Online',
  },
  {
    id: '3',
    sku: 'Prod-003',
    siteSku: '2390-03-7741',
    supplierItemId: 'Prod-003',
    productName: 'Belle Custom Name Bracelet - Gold Plated',
    category: 'bracelet',
    hsCode: '7117900000',
    country: 'IL',
    material: 'jewelry_silver',
    weight: '32 g',
    diamond: true,
    nonProd: true,
    status: 'Archived',
  },
  {
    id: '4',
    sku: 'Prod-004',
    siteSku: '2390-04-2200',
    supplierItemId: 'EXT-4400',
    productName: 'Singapore Earrings - Gold Plated',
    category: 'earring',
    hsCode: '7113200000',
    country: 'IL',
    material: 'jewelry_white_gold',
    weight: '4.1 g',
    diamond: true,
    nonProd: false,
    status: 'Online',
  },
  {
    id: '5',
    sku: 'Prod-005',
    siteSku: '2390-05-9912',
    supplierItemId: 'Prod-005',
    productName: 'Personalized Gift Kit',
    category: 'gift_box',
    hsCode: '7117190000',
    country: 'IL',
    material: 'jewelry_stainless_steel',
    weight: '12 g',
    diamond: false,
    nonProd: false,
    status: 'Online',
  },
  {
    id: '6',
    sku: 'Prod-006',
    siteSku: '2390-06-3001',
    supplierItemId: 'NZ-PL-661',
    productName: 'Heart Shape Gemstone Charm - Gold Vermeil',
    category: 'charms',
    hsCode: '4202920000',
    country: 'IL',
    material: 'jewelry_gold_vermeil',
    weight: '6.5 g',
    diamond: true,
    nonProd: false,
    status: 'Online',
  },
  {
    id: '7',
    sku: 'Prod-007',
    siteSku: '2390-07-5510',
    supplierItemId: 'Prod-007',
    productName: 'Puffy Heart Pendant Stackable Ring - Solid Gold',
    category: 'ring',
    hsCode: '4819200000',
    country: 'IL',
    material: 'jewelry_rose_gold_plating',
    weight: '11 g',
    diamond: false,
    nonProd: false,
    status: 'Archived',
  },
  {
    id: '8',
    sku: 'Prod-008',
    siteSku: '2390-08-1209',
    supplierItemId: 'KG-9981',
    productName: "Custom Mother's Day Gift Note",
    category: 'gift_note',
    hsCode: '4817100000',
    country: 'IL',
    material: 'jewelry_brass',
    weight: '3 g',
    diamond: false,
    nonProd: true,
    status: 'Online',
  },
  {
    id: 'mp-proto-1',
    sku: 'PKG-MANUAL-01',
    siteSku: 'PKG-MANUAL-01',
    supplierItemId: '',
    productName: 'Branded tissue paper (A4)',
    category: 'packing_item',
    hsCode: '4819200000',
    country: 'IL',
    material: 'packing_item',
    weight: '50 g',
    diamond: false,
    nonProd: true,
    status: 'Online',
    isManualPackingItem: true,
  },
  {
    id: 'mp-proto-2',
    sku: 'PKG-MANUAL-02',
    siteSku: 'PKG-MANUAL-02',
    supplierItemId: '',
    productName: 'Kraft mailer box — small',
    category: 'packing_item',
    hsCode: '4202920000',
    country: 'US',
    material: 'jewelry_brass',
    weight: '120 g',
    diamond: false,
    nonProd: true,
    status: 'Online',
    isManualPackingItem: true,
  },
  {
    id: 'mp-proto-3',
    sku: 'PKG-MANUAL-03',
    siteSku: 'PKG-MANUAL-03',
    supplierItemId: '',
    productName: 'Ribbon roll — navy',
    category: 'packing_item',
    hsCode: '7117190000',
    country: 'IL',
    material: 'jewelry_stainless_steel',
    weight: '15 g',
    diamond: false,
    nonProd: true,
    status: 'Online',
    isManualPackingItem: true,
  },
];

function statusChipClass(status: CatalogItemStatus): string {
  if (status === 'Online') return 'bg-green-100 text-green-800';
  return 'bg-gray-200 text-gray-800';
}

/** Weight column: numeric value primary, ` g` suffix secondary (muted). */
function CatalogWeightCell({ value }: { value: string }) {
  const m = value.match(/^([\d.]+)(\s+g)$/i);
  if (!m) {
    return <span className="text-gray-700">{value}</span>;
  }
  return (
    <>
      <span className="text-gray-700">{m[1]}</span>
      <span className="text-gray-500">{m[2]}</span>
    </>
  );
}

function HsCodePickerCell({
  row,
  onSelectCode,
}: {
  row: ShippingCatalogRow;
  onSelectCode: (rowId: string, code: string) => void;
}) {
  return (
    <div className="block w-full min-w-0" onClick={(e) => e.stopPropagation()}>
      <HsCodeControlledPicker
        value={row.hsCode}
        onChange={(code) => onSelectCode(row.id, code)}
        variant="catalogTable"
        aria-label={`HS code for ${row.sku}, open picker`}
      />
    </div>
  );
}

export default function ShippingProductCatalogApp() {
  const [rows, setRows] = useState<ShippingCatalogRow[]>(() => MOCK_ROWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogFilters, setCatalogFilters] = useState<CatalogTableFilters>(() => initialCatalogFilters());
  const [hsCodeListQuery, setHsCodeListQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    [],
  );
  const [packingDrawerOpen, setPackingDrawerOpen] = useState(false);
  const [selectedCatalogRowId, setSelectedCatalogRowId] = useState<string | null>(null);
  const [catalogStatusTab, setCatalogStatusTab] = useState<CatalogMasterStatusTab>('All');

  const selectedCatalogRow = useMemo(
    () => (selectedCatalogRowId ? rows.find((r) => r.id === selectedCatalogRowId) ?? null : null),
    [rows, selectedCatalogRowId],
  );

  useEffect(() => {
    if (selectedCatalogRowId && !rows.some((r) => r.id === selectedCatalogRowId)) {
      setSelectedCatalogRowId(null);
    }
  }, [rows, selectedCatalogRowId]);

  const catalogStatusTabCounts = useMemo(() => {
    let online = 0;
    let archived = 0;
    let manualPacking = 0;
    for (const r of rows) {
      if (r.isManualPackingItem) {
        manualPacking += 1;
        continue;
      }
      if (r.status === 'Online') online += 1;
      else if (r.status === 'Archived') archived += 1;
    }
    return {
      All: rows.length,
      ManualPackingItems: manualPacking,
      Online: online,
      Archived: archived,
    };
  }, [rows]);

  const searchFilteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.sku.toLowerCase().includes(q) ||
        r.supplierItemId.toLowerCase().includes(q) ||
        r.siteSku.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q)
      );
    });
  }, [rows, searchQuery]);

  const columnFilteredRows = useMemo(() => {
    let list = searchFilteredRows;

    if (catalogStatusTab === 'ManualPackingItems') {
      list = list.filter((r) => r.isManualPackingItem === true);
    } else if (catalogStatusTab === 'Online') {
      list = list.filter((r) => !r.isManualPackingItem && r.status === 'Online');
    } else if (catalogStatusTab === 'Archived') {
      list = list.filter((r) => !r.isManualPackingItem && r.status === 'Archived');
    }

    const f = catalogFilters;

    if (f.categories.length) {
      list = list.filter((r) => f.categories.includes(r.category));
    }
    if (f.materials.length) {
      list = list.filter((r) => f.materials.includes(r.material));
    }
    if (f.diamondSelections.length === 1) {
      const want = f.diamondSelections[0] === 'yes';
      list = list.filter((r) => r.diamond === want);
    }
    if (f.nonProdSelections.length === 1) {
      const want = f.nonProdSelections[0] === 'yes';
      list = list.filter((r) => r.nonProd === want);
    }
    if (f.hsCodes.length) {
      list = list.filter((r) => f.hsCodes.includes(r.hsCode));
    }

    return list;
  }, [searchFilteredRows, catalogFilters, catalogStatusTab]);

  const filteredRows = columnFilteredRows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExportCsv = () => {
    const headers = COLUMNS.map((c) => c.label).join(',');
    const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const body = filteredRows
      .map((row) =>
        [
          row.sku,
          row.siteSku,
          row.isManualPackingItem ? '-' : row.supplierItemId,
          row.productName,
          row.hsCode,
          row.weight,
          row.country,
          formatCatalogMaterialLabel(row.material),
          formatCatalogCategoryLabel(row.category),
          row.diamond ? 'Yes' : 'No',
          row.nonProd ? 'Yes' : 'No',
          row.isManualPackingItem ? '-' : row.status,
        ]
          .map(escape)
          .join(','),
      )
      .join('\n');
    const csv = `${headers}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipping-product-catalog.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleHsCodeSelect = (rowId: string, code: string) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, hsCode: code } : r)));
  };

  const handleCreatePackingItem = (row: ShippingCatalogRow) => {
    setRows((prev) => [...prev, row]);
    setCurrentPage(1);
  };

  const handleSaveCatalogRow = (updated: ShippingCatalogRow) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const clearCatalogColumnFilter = (columnId: string) => {
    if (columnId === 'hsCode') setHsCodeListQuery('');
    setCatalogFilters((prev) => {
      const next = { ...prev };
      switch (columnId) {
        case 'category':
          next.categories = [];
          break;
        case 'material':
          next.materials = [];
          break;
        case 'hsCode':
          next.hsCodes = [];
          break;
        case 'diamond':
          next.diamondSelections = [];
          break;
        case 'nonProd':
          next.nonProdSelections = [];
          break;
        default:
          break;
      }
      return next;
    });
    setCurrentPage(1);
  };

  const toggleCategoryFilter = (c: CatalogCategory) => {
    setCatalogFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(c)
        ? prev.categories.filter((x) => x !== c)
        : [...prev.categories, c],
    }));
    setCurrentPage(1);
  };

  const toggleMaterialFilter = (m: CatalogMaterialType) => {
    setCatalogFilters((prev) => ({
      ...prev,
      materials: prev.materials.includes(m)
        ? prev.materials.filter((x) => x !== m)
        : [...prev.materials, m],
    }));
    setCurrentPage(1);
  };

  const toggleHsCodePick = (code: string) => {
    setCatalogFilters((prev) => ({
      ...prev,
      hsCodes: prev.hsCodes.includes(code) ? prev.hsCodes.filter((x) => x !== code) : [...prev.hsCodes, code],
    }));
    setCurrentPage(1);
  };

  const toggleDiamondSelection = (v: CatalogYesNoFilterChoice) => {
    setCatalogFilters((prev) => ({
      ...prev,
      diamondSelections: prev.diamondSelections.includes(v)
        ? prev.diamondSelections.filter((x) => x !== v)
        : [...prev.diamondSelections, v],
    }));
    setCurrentPage(1);
  };

  const toggleNonProdSelection = (v: CatalogYesNoFilterChoice) => {
    setCatalogFilters((prev) => ({
      ...prev,
      nonProdSelections: prev.nonProdSelections.includes(v)
        ? prev.nonProdSelections.filter((x) => x !== v)
        : [...prev.nonProdSelections, v],
    }));
    setCurrentPage(1);
  };

  const filteredHsCodeOptionsForFilter = useMemo(() => {
    const q = hsCodeListQuery.trim().toLowerCase();
    if (!q) return [...HS_CODE_OPTIONS];
    return HS_CODE_OPTIONS.filter(
      (o) => o.code.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
    );
  }, [hsCodeListQuery]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[rgb(249,250,251)]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
        <div className="shrink-0 rounded-xl bg-white p-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-medium tracking-tight text-[#101828]">Shipping Product Catalog</h1>
              <p className="text-gray-500">
                Manage shipping-specific product data, customs classification and packing items
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleExportCsv}
                className="border-[#1976d2] text-[#1976d2] hover:bg-blue-50 hover:text-[#1976d2]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                type="button"
                className="bg-[#1976d2] text-white hover:bg-[#1565c0]"
                onClick={() => setPackingDrawerOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Packing Item
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by SKU or Supplier ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full max-w-[600px] border-gray-300 bg-white pl-10 md:w-[600px]"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between p-[0px]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCatalogStatusTab('All');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                catalogStatusTab === 'All'
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({catalogStatusTabCounts.All})
            </button>
            <button
              type="button"
              onClick={() => {
                setCatalogStatusTab('ManualPackingItems');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                catalogStatusTab === 'ManualPackingItems'
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manual Packing Items ({catalogStatusTabCounts.ManualPackingItems})
            </button>
            <button
              type="button"
              onClick={() => {
                setCatalogStatusTab('Online');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                catalogStatusTab === 'Online'
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Online ({catalogStatusTabCounts.Online})
            </button>
            <button
              type="button"
              onClick={() => {
                setCatalogStatusTab('Archived');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                catalogStatusTab === 'Archived'
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Archived ({catalogStatusTabCounts.Archived})
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="table-auto relative w-full min-w-[1100px]">
                <thead className="sticky top-0 z-10 border-b bg-white">
                  <tr>
                    {COLUMNS.map((col) => {
                      const filterable = FILTERABLE_COLUMN_IDS.has(col.id);
                      const filterCount = filterable ? catalogColumnFilterCount(col.id, catalogFilters) : 0;
                      const hasActiveFilter = filterable && filterCount > 0;

                      return (
                        <th
                          key={col.id}
                          className={cn(
                            'px-4 py-4 text-xs font-medium text-gray-700',
                            TABLE_HEADER_TH,
                            CENTERED_CATALOG_COLUMN_IDS.has(col.id) ? 'text-center' : 'text-left',
                            col.id === 'sku' && SKU_COLUMN_HEADER_CELL,
                            col.id === 'siteSku' && SKU_GROUP_HEADER_CELL,
                            col.id === 'supplierItemId' && SUPPLIER_ID_HEADER_CELL,
                            col.id === 'hsCode' && HS_CODE_HEADER_CELL,
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-center gap-1.5',
                              CENTERED_CATALOG_COLUMN_IDS.has(col.id) ? 'justify-center' : 'justify-start',
                            )}
                          >
                            <span className="inline-flex items-center gap-1">
                              {col.label}
                              {hasActiveFilter ? (
                                <>
                                  <span className="ml-1 text-[#1976d2]">({filterCount})</span>
                                  <button
                                    type="button"
                                    className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearCatalogColumnFilter(col.id);
                                    }}
                                    aria-label={`Clear ${col.label} filter`}
                                  >
                                    ×
                                  </button>
                                </>
                              ) : null}
                            </span>
                            {filterable ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                    aria-label={`Filter by ${col.label}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ChevronsUpDown className="h-4 w-4 opacity-70" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="start"
                                  className={cn(
                                    'max-h-[min(70vh,32rem)] overflow-y-auto p-3',
                                    col.id === 'hsCode'
                                      ? 'w-max max-w-[min(440px,calc(100vw-1.5rem))] min-w-[220px]'
                                      : 'w-80',
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="mb-3 flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-[#101828]">
                                      Filter by {col.label}
                                    </span>
                                    {hasActiveFilter ? (
                                      <button
                                        type="button"
                                        className="text-xs font-medium text-[#1976d2] hover:text-[#1565c0]"
                                        onClick={() => clearCatalogColumnFilter(col.id)}
                                      >
                                        Clear
                                      </button>
                                    ) : null}
                                  </div>
                                  {col.id === 'category' ? (
                                        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                          {CATALOG_CATEGORIES.map((c) => (
                                            <div key={c} className="flex items-center gap-2">
                                              <Checkbox
                                                id={`cat-f-${c}`}
                                                checked={catalogFilters.categories.includes(c)}
                                                onCheckedChange={() => toggleCategoryFilter(c)}
                                              />
                                              <Label htmlFor={`cat-f-${c}`} className="cursor-pointer text-sm leading-none">
                                                {formatCatalogCategoryLabel(c)}
                                              </Label>
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}
                                      {col.id === 'material' ? (
                                        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                          {CATALOG_MATERIAL_TYPES.map((m) => (
                                            <div key={m} className="flex items-center gap-2">
                                              <Checkbox
                                                id={`mat-f-${m}`}
                                                checked={catalogFilters.materials.includes(m)}
                                                onCheckedChange={() => toggleMaterialFilter(m)}
                                              />
                                              <Label htmlFor={`mat-f-${m}`} className="cursor-pointer text-sm leading-snug">
                                                {formatCatalogMaterialLabel(m)}
                                              </Label>
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}
                                  {col.id === 'hsCode' ? (
                                    <div className="w-full min-w-0 space-y-3">
                                      <div className="relative w-full min-w-0">
                                        <Search
                                          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                          aria-hidden
                                        />
                                        <Input
                                          id="hs-header-picker-search"
                                          placeholder="Search HS codes by code or description"
                                          value={hsCodeListQuery}
                                          onChange={(e) => setHsCodeListQuery(e.target.value)}
                                          className="h-9 w-full min-w-0 border-gray-300 pl-9 text-sm"
                                          aria-label="Search HS codes by code or description"
                                        />
                                      </div>
                                      <div className="max-h-[min(14rem,40vh)] min-w-0 space-y-0.5 overflow-x-auto overflow-y-auto rounded-md border border-gray-100 p-1">
                                        {filteredHsCodeOptionsForFilter.map((opt) => (
                                          <div
                                            key={opt.code}
                                            title={`${opt.code} ${opt.description}`}
                                            className="flex w-max max-w-none items-baseline gap-2 rounded-[6px] px-2 py-2 hover:bg-gray-50"
                                          >
                                            <Checkbox
                                              id={`hs-fhdr-${opt.code}`}
                                              className="mt-0.5 shrink-0"
                                              checked={catalogFilters.hsCodes.includes(opt.code)}
                                              onCheckedChange={() => toggleHsCodePick(opt.code)}
                                            />
                                            <Label
                                              htmlFor={`hs-fhdr-${opt.code}`}
                                              className="flex w-max cursor-pointer flex-row flex-nowrap items-baseline gap-1 text-left"
                                            >
                                              <span className="shrink-0 whitespace-nowrap font-mono text-[12px] font-normal leading-snug text-[#1976d2]">
                                                {opt.code}
                                              </span>
                                              <span className="whitespace-nowrap text-[12px] font-normal leading-snug text-gray-700">
                                                {opt.description}
                                              </span>
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex w-full flex-row items-center justify-between gap-2 border-t border-gray-100 pt-2 text-left text-xs font-normal text-gray-500">
                                        <span className="min-w-0 shrink">
                                          {filteredHsCodeOptionsForFilter.length} of {HS_CODE_OPTIONS.length} codes
                                        </span>
                                        <span className="shrink-0 text-right">Managed in Shipping</span>
                                      </div>
                                    </div>
                                  ) : null}
                                  {col.id === 'diamond' ? (
                                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                      {(['yes', 'no'] as const).map((v) => (
                                        <div key={v} className="flex items-center gap-2">
                                          <Checkbox
                                            id={`diamond-f-${v}`}
                                            checked={catalogFilters.diamondSelections.includes(v)}
                                            onCheckedChange={() => toggleDiamondSelection(v)}
                                          />
                                          <Label htmlFor={`diamond-f-${v}`} className="cursor-pointer text-sm">
                                            {v === 'yes' ? 'Yes' : 'No'}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                  {col.id === 'nonProd' ? (
                                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                      {(['yes', 'no'] as const).map((v) => (
                                        <div key={v} className="flex items-center gap-2">
                                          <Checkbox
                                            id={`nonprod-f-${v}`}
                                            checked={catalogFilters.nonProdSelections.includes(v)}
                                            onCheckedChange={() => toggleNonProdSelection(v)}
                                          />
                                          <Label htmlFor={`nonprod-f-${v}`} className="cursor-pointer text-sm">
                                            {v === 'yes' ? 'Yes' : 'No'}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </PopoverContent>
                              </Popover>
                            ) : null}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center align-middle text-xs text-gray-500">
                        No catalog items match your search or filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row) => (
                      <tr
                        key={row.id}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => setSelectedCatalogRowId(row.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCatalogRowId(row.id);
                          }
                        }}
                      >
                        <td
                          className={cn(
                            'px-4 py-3 text-left align-middle text-xs font-medium text-[#101828]',
                            SKU_COLUMN_BODY_CELL,
                          )}
                          title={row.sku}
                        >
                          <div className="block w-full truncate">{row.sku}</div>
                        </td>
                        <td className={cn('px-4 py-3 text-left align-middle text-xs text-gray-700', SKU_GROUP_CELL)}>
                          {row.siteSku}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-3 align-middle text-xs text-gray-700',
                            SUPPLIER_ID_BODY_CELL,
                            row.isManualPackingItem ? 'text-center text-gray-600' : 'text-left',
                          )}
                          title={row.isManualPackingItem ? undefined : row.supplierItemId || undefined}
                        >
                          {row.isManualPackingItem ? (
                            <div className="flex justify-center">
                              <span className="inline-flex justify-center">
                                <Minus className="h-4 w-4 text-gray-400" aria-label="No supplier ID" />
                              </span>
                            </div>
                          ) : (
                            <div className="block w-full truncate">{row.supplierItemId}</div>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-left align-middle text-xs text-gray-700"
                          title={row.productName}
                        >
                          <div className="block max-w-[200px] truncate">{row.productName}</div>
                        </td>
                        <td className={cn('px-4 py-3 text-left align-middle text-xs text-gray-700', HS_CODE_BODY_CELL)}>
                          <HsCodePickerCell row={row} onSelectCode={handleHsCodeSelect} />
                        </td>
                        <td className="px-4 py-3 text-center align-middle text-xs">
                          <CatalogWeightCell value={row.weight} />
                        </td>
                        <td className="px-4 py-3 text-center align-middle text-xs text-gray-700">{row.country}</td>
                        <td
                          className="max-w-[140px] truncate px-4 py-3 text-left align-middle text-xs text-gray-700"
                          title={formatCatalogMaterialLabel(row.material)}
                        >
                          {formatCatalogMaterialLabel(row.material)}
                        </td>
                        <td className="px-4 py-3 text-left align-middle text-xs text-gray-700">
                          {formatCatalogCategoryLabel(row.category)}
                        </td>
                        <td className="px-4 py-3 text-center align-middle text-xs text-gray-600">
                          <span className="inline-flex justify-center">
                            {row.diamond ? (
                              <Check className="h-4 w-4 text-[#1976d2]" aria-label="Yes" />
                            ) : (
                              <Minus className="h-4 w-4 text-gray-400" aria-label="No" />
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center align-middle text-xs text-gray-600">
                          <span className="inline-flex justify-center">
                            {row.nonProd ? (
                              <Check className="h-4 w-4 text-[#1976d2]" aria-label="Yes" />
                            ) : (
                              <Minus className="h-4 w-4 text-gray-400" aria-label="No" />
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle text-xs text-gray-700">
                          {row.isManualPackingItem ? (
                            <div className="flex justify-center text-gray-600">
                              <span className="inline-flex justify-center">
                                <Minus className="h-4 w-4 text-gray-400" aria-label="Not in master catalog" />
                              </span>
                            </div>
                          ) : (
                            <div className="flex w-full justify-start text-left">
                              <span
                                className={cn(
                                  'inline-flex rounded-[8px] px-2.5 py-0.5 text-xs font-medium',
                                  statusChipClass(row.status),
                                )}
                              >
                                {row.status}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t bg-white px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="text-xs text-gray-500">Last Updated at {lastUpdated}</div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Rows per page:</span>
                  <select
                    className="rounded border px-2 py-1"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <span className="text-sm text-gray-700">
                  {filteredRows.length === 0
                    ? '0 of 0'
                    : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredRows.length)} of ${filteredRows.length}`}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={currentPage >= totalPages || filteredRows.length === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateManualPackingItemDrawer
        isOpen={packingDrawerOpen}
        onClose={() => setPackingDrawerOpen(false)}
        onCreate={handleCreatePackingItem}
        existingRows={rows}
      />

      <ShippingCatalogRowDrawer
        isOpen={selectedCatalogRowId !== null && selectedCatalogRow !== null}
        row={selectedCatalogRow}
        onClose={() => setSelectedCatalogRowId(null)}
        onSave={handleSaveCatalogRow}
      />
    </div>
  );
}
