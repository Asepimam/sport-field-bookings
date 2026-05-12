import { useEffect, useState } from 'react';
import { Alert, Button, Spin, Typography } from 'antd';
import { CalendarCheck, X } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useAvailableSlots } from '../hooks/useFields';

const { Text } = Typography;

interface Props {
  fieldId: string;
  openTime: string;
  closeTime: string;
  selectedDate: Dayjs | null;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
}

function generateAllSlots(open: string, close: string): string[] {
  const slots: string[] = [];
  let current = dayjs(`2000-01-01 ${open}`);
  const end = dayjs(`2000-01-01 ${close}`);
  while (current.isBefore(end)) {
    slots.push(current.format('HH:mm'));
    current = current.add(1, 'hour');
  }
  return slots;
}

export default function BookingSlotPicker({
  fieldId,
  openTime,
  closeTime,
  selectedDate,
  selectedSlots,
  onSlotsChange,
}: Props) {
  const [selectionError, setSelectionError] = useState(false);
  const dateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : null;
  const { data: available, isLoading, isError } = useAvailableSlots(fieldId, dateStr ?? '');

  const allSlots = generateAllSlots(openTime, closeTime);

  const isAvailable = (slot: string) => !available || available.includes(slot);
  const isSelected = (slot: string) => selectedSlots.includes(slot);
  const sortSlots = (slots: string[]) =>
    [...slots].sort((a, b) => allSlots.indexOf(a) - allSlots.indexOf(b));

  const areSlotsContiguous = (slots: string[]) => {
    if (slots.length <= 1) return true;

    const sortedSlots = sortSlots(slots);
    return sortedSlots.every((slot, index) => {
      if (index === 0) return true;
      return allSlots.indexOf(slot) - allSlots.indexOf(sortedSlots[index - 1]) === 1;
    });
  };

  const handleSlotClick = (slot: string) => {
    if (!isAvailable(slot)) return;

    const nextSlots = selectedSlots.includes(slot)
      ? selectedSlots.filter((selectedSlot) => selectedSlot !== slot)
      : sortSlots([...selectedSlots, slot]);

    if (!areSlotsContiguous(nextSlots)) {
      setSelectionError(true);
      return;
    }

    if (!nextSlots.every(isAvailable)) {
      setSelectionError(true);
      return;
    }

    if (nextSlots.length <= 1 || selectedSlots.includes(slot)) {
      setSelectionError(false);
      onSlotsChange(nextSlots);
      return;
    }

    setSelectionError(false);
    onSlotsChange(nextSlots);
  };

  useEffect(() => {
    setSelectionError(false);
  }, [dateStr]);

  return (
    <div className="space-y-5">
      {selectedDate && (
        <div>
          <div className="mb-3 flex flex-col gap-1">
            <Text strong>Pilih Jam</Text>
            <Text className="text-xs text-gray-500">
              Pilih slot per jam. Untuk booking beberapa jam, pilih slot yang berurutan tanpa jeda.
            </Text>
          </div>

          {isLoading && (
            <div className="flex justify-center py-6">
              <Spin tip="Memuat slot tersedia..." />
            </div>
          )}

          {isError && (
            <Alert
              type="error"
              message="Gagal memuat slot. Silakan coba lagi."
              showIcon
            />
          )}

          {!isLoading && !isError && (
            <>
              {selectionError && (
                <Alert
                  type="warning"
                  showIcon
                  className="mb-3"
                  message="Slot harus berurutan"
                  description="Contoh: untuk booking 10:00 sampai 12:00, pilih 10:00 dan 11:00. Jangan lompat langsung ke 12:00."
                />
              )}

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {allSlots.map((slot) => {
                  const avail = isAvailable(slot);
                  const selected = isSelected(slot);
                  return (
                    <button
                      key={slot}
                      disabled={!avail}
                      onClick={() => handleSlotClick(slot)}
                      className={[
                        'min-h-11 rounded-lg px-2 text-sm font-medium border-2 transition-all duration-150',
                        avail
                          ? selected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer'
                          : 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed line-through',
                      ].join(' ')}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Dipilih
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-white border-2 border-gray-200 inline-block" />{' '}
                  Tersedia
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Terisi
                </span>
              </div>
            </>
          )}

          {selectedSlots.length > 0 && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <CalendarCheck size={16} className="mt-0.5 text-blue-600" />
                  <div>
                    <Text className="block text-sm font-semibold text-blue-700">
                      {sortSlots(selectedSlots).join(', ')}
                    </Text>
                    <Text className="text-xs text-blue-600">
                      {selectedSlots.length} jam dipilih
                    </Text>
                  </div>
                </div>
                <Button
                  size="small"
                  type="text"
                  icon={<X size={14} />}
                  onClick={() => onSlotsChange([])}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
