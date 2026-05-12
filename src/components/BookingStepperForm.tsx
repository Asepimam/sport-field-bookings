import { useState } from 'react';
import { Alert, Button, Card, Checkbox, DatePicker, Spin, Steps } from 'antd';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import BookingSlotPicker from './BookingSlotPicker';
import { formatPrice } from '../utils/format';
import type { GroundFacility } from '../api/fields';

interface BookingStepperFormProps {
  fieldId: string;
  fieldName: string;
  pricePerHour: number;
  openTime: string;
  closeTime: string;
  selectedDate: Dayjs | null;
  selectedSlots: string[];
  facilities: GroundFacility[];
  onDateChange: (date: Dayjs | null) => void;
  onSlotsChange: (slots: string[]) => void;
  onBook: (selectedFacilities: string[]) => Promise<void>;
  isLoading?: boolean;
}

type StepType = 'date' | 'time' | 'facilities' | 'review';

const steps: { id: StepType; label: string }[] = [
  { id: 'date', label: 'Tanggal' },
  { id: 'time', label: 'Jam' },
  { id: 'facilities', label: 'Fasilitas' },
  { id: 'review', label: 'Konfirmasi' },
];

export default function BookingStepperForm({
  fieldId,
  fieldName,
  pricePerHour,
  openTime,
  closeTime,
  selectedDate,
  selectedSlots,
  facilities,
  onDateChange,
  onSlotsChange,
  onBook,
  isLoading = false,
}: BookingStepperFormProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('date');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'date' && !selectedDate) {
      return;
    }
    if (currentStep === 'time' && selectedSlots.length === 0) {
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleBooking = async () => {
    setIsSubmitting(true);
    try {
      await onBook(selectedFacilities);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepsStatus = (): Array<'wait' | 'process' | 'finish'> => {
    return steps.map((_step, index) => {
      if (index < currentStepIndex) return 'finish';
      if (index === currentStepIndex) return 'process';
      return 'wait';
    });
  };

  const estimatedTotal = selectedSlots.length * pricePerHour;
  const selectedFacilityTotal = facilities
    .filter((facility) => selectedFacilities.includes(facility.name))
    .reduce((sum, facility) => sum + (facility.price ?? 0), 0);
  const estimatedPayment = estimatedTotal + selectedFacilityTotal;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <Steps
          current={currentStepIndex}
          status={getStepsStatus()[currentStepIndex]}
          responsive={false}
          items={steps.map((step) => ({
            title: step.label,
          }))}
        />
      </div>

      {/* Step Content */}
      <div className="min-h-64 mb-8">
        {currentStep === 'date' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Pilih Tanggal</h3>
            <p className="text-gray-600 text-sm">Kapan Anda ingin booking lapangan?</p>
            <DatePicker
              value={selectedDate}
              onChange={(date) => {
                onDateChange(date);
                onSlotsChange([]);
              }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              format="DD MMMM YYYY"
              className="w-full"
              size="large"
            />
            {selectedDate ? (
              <Card className="bg-blue-50 border-blue-200">
                <p className="text-center text-blue-700 font-medium">
                  {selectedDate.format('dddd, DD MMMM YYYY')}
                </p>
              </Card>
            ) : (
              <Alert
                message="Silakan pilih tanggal booking"
                type="info"
                showIcon
              />
            )}
          </div>
        )}

        {currentStep === 'time' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Pilih Jam</h3>
            <p className="text-gray-600 text-sm">
              Tanggal: {selectedDate?.format('DD MMMM YYYY')}
            </p>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : (
              <div>
                <BookingSlotPicker
                  fieldId={fieldId}
                  openTime={openTime}
                  closeTime={closeTime}
                  selectedDate={selectedDate}
                  selectedSlots={selectedSlots}
                  onSlotsChange={onSlotsChange}
                />
                {selectedSlots.length > 0 && (
                  <Card className="mt-4 bg-blue-50 border-blue-200">
                    <p className="text-sm text-gray-600">Jam yang dipilih:</p>
                    <p className="font-semibold text-blue-700">
                      {selectedSlots.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Durasi: {selectedSlots.length} jam
                    </p>
                    <p className="text-sm font-semibold text-blue-700 mt-1">
                      Estimasi pembayaran: {formatPrice(estimatedPayment)}
                    </p>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === 'facilities' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tambahan Fasilitas (Opsional)</h3>
            <p className="text-gray-600 text-sm">
              Tambahkan fasilitas untuk meningkatkan pengalaman booking Anda
            </p>

            {facilities.length > 0 ? (
              <div className="space-y-3">
                {facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedFacilities.includes(facility.name)}
                      onChange={(e) => {
                        setSelectedFacilities((prev) =>
                          e.target.checked
                            ? [...prev, facility.name]
                            : prev.filter((f) => f !== facility.name)
                        );
                      }}
                    >
                      <span>{facility.name}</span>
                    </Checkbox>
                    <span className="text-sm text-gray-500">
                      {facility.price > 0 ? formatPrice(facility.price) : 'Gratis'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Alert
                message="Tidak ada fasilitas tambahan tersedia untuk lapangan ini"
                type="info"
                showIcon
              />
            )}
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Konfirmasi Booking</h3>
            <div className="space-y-3">
              <Card>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lapangan:</span>
                    <span className="font-medium">{fieldName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="font-medium">
                      {selectedDate?.format('DD MMMM YYYY')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jam:</span>
                    <span className="font-medium">
                      {selectedSlots.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durasi:</span>
                    <span className="font-medium">{selectedSlots.length} jam</span>
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between text-lg">
                    <span className="font-semibold">Estimasi pembayaran:</span>
                    <span className="font-semibold text-blue-600">
                      {formatPrice(estimatedPayment)}
                    </span>
                  </div>

                  {selectedFacilities.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fasilitas:</span>
                      <span className="font-medium">{selectedFacilities.join(', ')}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          icon={<ArrowLeft size={16} />}
          className="w-full sm:w-auto"
        >
          Sebelumnya
        </Button>

        {currentStep !== 'review' && (
          <Button
            type="primary"
            onClick={handleNext}
            disabled={
              (currentStep === 'date' && !selectedDate) ||
              (currentStep === 'time' && selectedSlots.length === 0)
            }
            icon={<ArrowRight size={16} />}
            className="w-full sm:w-auto"
          >
            Berikutnya
          </Button>
        )}

        {currentStep === 'review' && (
          <Button
            type="primary"
            onClick={handleBooking}
            loading={isSubmitting}
            size="large"
            className="w-full whitespace-normal h-auto min-h-11 px-4 py-2 sm:w-auto"
          >
            Konfirmasi & Lanjut Pembayaran
          </Button>
        )}
      </div>
    </div>
  );
}
