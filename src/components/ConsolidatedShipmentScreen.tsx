import ConsolidatedShipmentForm from './ConsolidatedShipmentForm';
import type { ConsolidatedShipment } from './ConsolidatedShipmentsApp';

interface ConsolidatedShipmentScreenProps {
  shipment: ConsolidatedShipment;
  onBack: () => void;
  onSave: (shipment: ConsolidatedShipment) => void;
}

/**
 * Full-page editor for an existing consolidated shipment (edit flow).
 * New shipment creation uses {@link ConsolidatedShipmentCreateDrawer} instead.
 */
export default function ConsolidatedShipmentScreen({
  shipment,
  onBack,
  onSave,
}: ConsolidatedShipmentScreenProps) {
  return (
    <ConsolidatedShipmentForm
      variant="page"
      shipment={shipment}
      onPack={(s) => {
        onSave(s);
        onBack();
      }}
      onSaveDraft={(s) => {
        onSave(s);
        onBack();
      }}
      onCloseRequest={onBack}
    />
  );
}
